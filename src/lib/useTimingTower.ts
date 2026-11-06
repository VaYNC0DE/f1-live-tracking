import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ActiveRaceControlStatus,
  Driver,
  DriverDrsState,
  DriverTimingRow,
  FastestPitStop,
  Interval,
  Lap,
  PitStop,
  PitStopSummary,
  RaceControlMessage,
  Session,
  Stint,
  TrackState,
  TrackWeather,
  TyreCompound,
} from './types';
import {
  FALLBACK_SESSION_KEY,
  getDrivers,
  getIntervals,
  getLaps,
  getLatestSession,
  getPitStops,
  getRaceControl,
  getSessionByKey,
  getSessionsByYear,
  getStints,
  getTrackWeather,
  isSessionCurrentlyActive,
} from './openf1Client';
import { getTeamColor } from './teamColors';
import { parsePitStops } from './pitStopUtils';

export interface UseTimingTowerResult {
  drivers: DriverTimingRow[];
  sessionInfo: Session | null;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  isUpcoming: boolean;
  raceControlStatus: ActiveRaceControlStatus;
  trackState: TrackState;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedSessionKey: number | null;
  setSelectedSessionKey: (key: number) => void;
  availableSessions: Session[];
  fastestPitStop: FastestPitStop | null;
  pitStops: PitStopSummary[];
}

const VALID_COMPOUNDS: Set<TyreCompound> = new Set([
  'SOFT',
  'MEDIUM',
  'HARD',
  'INTERMEDIATE',
  'WET',
]);

function normalizeCompound(raw: string | null | undefined): TyreCompound {
  if (!raw) return 'UNKNOWN';
  const upper = raw.trim().toUpperCase() as TyreCompound;
  return VALID_COMPOUNDS.has(upper) ? upper : 'UNKNOWN';
}

function normalizeHexColor(raw: string | null | undefined): string {
  if (!raw) return '#808080';
  const clean = raw.trim().replace(/^#/, '');
  return /^[0-9A-Fa-f]{6}$/.test(clean) ? `#${clean.toUpperCase()}` : '#808080';
}

/**
 * Parses an OpenF1 gap or interval value into a numeric value for sorting.
 * Handles numbers (`1.42`), numeric strings (`"+1.420"`), lapped strings (`"+1 LAP"`),
 * and leader interval records where gap metrics are null.
 */
function parseGapForSorting(
  gap: number | string | null | undefined,
  isLeaderRecord: boolean = false
): number {
  if (isLeaderRecord) return 0;
  if (gap === null || gap === undefined) return Number.POSITIVE_INFINITY;
  if (typeof gap === 'number') return gap;

  const str = gap.trim().toUpperCase();
  if (str === '' || str === '-') return Number.POSITIVE_INFINITY;

  // Handle lapped cars (e.g. "+1 LAP", "2 LAPS", "+1 L")
  const lapMatch = str.match(/\+?(\d+)\s*L(?:AP|APS)?/);
  if (lapMatch) {
    const lapsBehind = parseInt(lapMatch[1], 10);
    return 10_000 * lapsBehind;
  }

  const numeric = parseFloat(str.replace(/^\+/, ''));
  return Number.isNaN(numeric) ? Number.POSITIVE_INFINITY : numeric;
}

function formatGapToLeader(
  position: number,
  rawGap: number | string | null | undefined
): string {
  if (position === 1) return 'LEADER';
  if (rawGap === null || rawGap === undefined) return '-';

  if (typeof rawGap === 'number') {
    return rawGap === 0 ? 'LEADER' : `+${rawGap.toFixed(3)}`;
  }

  const trimmed = rawGap.trim().toUpperCase();
  if (trimmed === '0' || trimmed === '0.0' || trimmed === '0.000') {
    return 'LEADER';
  }

  const lapMatch = trimmed.match(/\+?(\d+)\s*L(?:AP|APS)?/);
  if (lapMatch) {
    const count = parseInt(lapMatch[1], 10);
    return `${count} ${count === 1 ? 'LAP' : 'LAPS'}`;
  }

  const parsed = parseFloat(trimmed.replace(/^\+/, ''));
  if (!Number.isNaN(parsed)) {
    return `+${parsed.toFixed(3)}`;
  }

  return trimmed;
}

function formatIntervalToAhead(
  position: number,
  rawInterval: number | string | null | undefined
): string {
  if (position === 1) return '-';
  if (rawInterval === null || rawInterval === undefined) return '-';

  if (typeof rawInterval === 'number') {
    return rawInterval > 0 ? `+${rawInterval.toFixed(3)}` : '-';
  }

  const trimmed = rawInterval.trim().toUpperCase();
  if (trimmed === '' || trimmed === '-') return '-';

  const lapMatch = trimmed.match(/\+?(\d+)\s*L(?:AP|APS)?/);
  if (lapMatch) {
    const count = parseInt(lapMatch[1], 10);
    return `+${count} ${count === 1 ? 'LAP' : 'LAPS'}`;
  }

  const parsed = parseFloat(trimmed.replace(/^\+/, ''));
  if (!Number.isNaN(parsed)) {
    return `+${parsed.toFixed(3)}`;
  }

  return trimmed;
}

/**
 * Pure normalization reducer: joins drivers, intervals, laps, and stints on `driver_number`,
 * computes personal & session-best laps, determines pit status, and sorts positions 1-20.
 */
export function buildTimingTowerRows(
  drivers: Driver[],
  intervals: Interval[],
  laps: Lap[],
  stints: Stint[],
  driverPitCounts: Map<number, number> = new Map(),
  driverBestPitDuration: Map<number, number> = new Map(),
  fastestPitDriverNumber: number | null = null,
  drsStatus: 'ENABLED' | 'DISABLED' = 'ENABLED'
): DriverTimingRow[] {
  // 1. Deduplicate drivers by driver_number
  const driverMap = new Map<number, Driver>();
  for (const d of drivers) {
    if (!driverMap.has(d.driver_number)) {
      driverMap.set(d.driver_number, d);
    }
  }

  // 2. Group latest interval per driver_number (including the leader whose gaps are null)
  const latestIntervalMap = new Map<number, Interval>();
  const latestIntervalTimestampMap = new Map<number, number>();

  for (const item of intervals) {
    const itemTime = new Date(item.date).getTime();
    const prevTime = latestIntervalTimestampMap.get(item.driver_number) ?? -1;

    if (itemTime >= prevTime) {
      latestIntervalMap.set(item.driver_number, item);
      latestIntervalTimestampMap.set(item.driver_number, itemTime);
    }
  }

  // 3. Group laps by driver_number & find overall fastest lap of the session
  const lapsByDriver = new Map<number, Lap[]>();
  let overallFastestLapTime = Number.POSITIVE_INFINITY;
  let overallFastestDriverNumber: number | null = null;

  for (const lap of laps) {
    const list = lapsByDriver.get(lap.driver_number) ?? [];
    list.push(lap);
    lapsByDriver.set(lap.driver_number, list);

    if (
      lap.lap_duration !== null &&
      lap.lap_duration > 0 &&
      lap.lap_duration < overallFastestLapTime
    ) {
      overallFastestLapTime = lap.lap_duration;
      overallFastestDriverNumber = lap.driver_number;
    }
  }

  // Sort each driver's laps ascending by lap_number
  for (const [driverNum, driverLaps] of lapsByDriver.entries()) {
    driverLaps.sort((a, b) => a.lap_number - b.lap_number);
    lapsByDriver.set(driverNum, driverLaps);
  }

  // 4. Find latest stint per driver_number
  const latestStintMap = new Map<number, Stint>();
  for (const stint of stints) {
    const existing = latestStintMap.get(stint.driver_number);
    if (!existing || stint.stint_number >= existing.stint_number) {
      latestStintMap.set(stint.driver_number, stint);
    }
  }

  // 5. Build intermediate metrics for sorting and display
  interface IntermediateDriverMetrics {
    driver: Driver;
    latestInterval: Interval | undefined;
    lastCompletedLap: Lap | null;
    latestLapEntry: Lap | null;
    personalBestLapTime: number | null;
    maxLapNumber: number;
    latestStint: Stint | undefined;
  }

  const intermediateList: IntermediateDriverMetrics[] = [];

  for (const driver of driverMap.values()) {
    const dNum = driver.driver_number;
    const driverLaps = lapsByDriver.get(dNum) ?? [];

    let lastCompletedLap: Lap | null = null;
    let personalBestLapTime: number | null = null;
    let maxLapNumber = 0;

    for (const l of driverLaps) {
      if (l.lap_number > maxLapNumber) {
        maxLapNumber = l.lap_number;
      }
      if (l.lap_duration !== null && l.lap_duration > 0) {
        lastCompletedLap = l;
        if (personalBestLapTime === null || l.lap_duration < personalBestLapTime) {
          personalBestLapTime = l.lap_duration;
        }
      }
    }

    const latestLapEntry =
      driverLaps.length > 0 ? driverLaps[driverLaps.length - 1] : null;

    intermediateList.push({
      driver,
      latestInterval: latestIntervalMap.get(dNum),
      lastCompletedLap,
      latestLapEntry,
      personalBestLapTime,
      maxLapNumber,
      latestStint: latestStintMap.get(dNum),
    });
  }

  const hasIntervalData = latestIntervalMap.size > 0;

  // 6. Sort drivers into race/session order (Positions 1 to 20)
  intermediateList.sort((a, b) => {
    if (hasIntervalData) {
      const isLeaderA =
        Boolean(a.latestInterval) &&
        (a.latestInterval?.gap_to_leader === null || a.latestInterval?.gap_to_leader === 0) &&
        (a.latestInterval?.interval === null || a.latestInterval?.interval === 0);

      const isLeaderB =
        Boolean(b.latestInterval) &&
        (b.latestInterval?.gap_to_leader === null || b.latestInterval?.gap_to_leader === 0) &&
        (b.latestInterval?.interval === null || b.latestInterval?.interval === 0);

      const gapA = parseGapForSorting(a.latestInterval?.gap_to_leader, isLeaderA);
      const gapB = parseGapForSorting(b.latestInterval?.gap_to_leader, isLeaderB);

      if (gapA !== gapB) {
        return gapA - gapB;
      }

      // Tie-breaker: total laps completed descending
      if (a.maxLapNumber !== b.maxLapNumber) {
        return b.maxLapNumber - a.maxLapNumber;
      }
    } else {
      // Qualifying / Practice fallback sort: fastest personal lap ascending
      const bestA = a.personalBestLapTime ?? Number.POSITIVE_INFINITY;
      const bestB = b.personalBestLapTime ?? Number.POSITIVE_INFINITY;
      if (bestA !== bestB) {
        return bestA - bestB;
      }
    }

    return a.driver.driver_number - b.driver.driver_number;
  });

  // 7. Map sorted records into final DriverTimingRow[] (supports full dynamic grid: 20 or 22 cars)
  const leaderBestTime = intermediateList[0]?.personalBestLapTime ?? null;

  return intermediateList.map((item, index): DriverTimingRow => {
    const position = index + 1;
    const {
      driver,
      latestInterval,
      lastCompletedLap,
      latestLapEntry,
      personalBestLapTime,
      maxLapNumber,
      latestStint,
    } = item;

    const lastLapTime = lastCompletedLap?.lap_duration ?? null;

    const isFastestLap =
      overallFastestDriverNumber === driver.driver_number &&
      personalBestLapTime !== null &&
      personalBestLapTime === overallFastestLapTime;

    const isPersonalBest =
      lastLapTime !== null &&
      personalBestLapTime !== null &&
      Math.abs(lastLapTime - personalBestLapTime) < 1e-4;

    // Calculate tyre compound and cumulative tyre age in laps
    const tyreCompound = normalizeCompound(latestStint?.compound);
    let tyreAgeLaps = 0;
    if (latestStint) {
      const ageAtStart = latestStint.tyre_age_at_start ?? 0;
      const stintStartLap = latestStint.lap_start ?? 1;
      const stintEndLap = latestStint.lap_end ?? maxLapNumber;
      const effectiveCurrentLap = Math.max(stintStartLap, stintEndLap, maxLapNumber);
      tyreAgeLaps = Math.max(0, ageAtStart + (effectiveCurrentLap - stintStartLap + 1));
    }

    // Determine pit status from latest lap telemetry or active stint boundary
    const inPit = Boolean(
      latestLapEntry &&
        (latestLapEntry.is_pit_out_lap ||
          (latestLapEntry.lap_duration === null &&
            latestStint?.lap_end !== null &&
            latestStint?.lap_end === latestLapEntry.lap_number))
    );

    const pitStopCount = driverPitCounts.get(driver.driver_number) ?? 0;
    const bestPitStopDuration = driverBestPitDuration.get(driver.driver_number) ?? null;
    const isFastestPitStop =
      fastestPitDriverNumber !== null && driver.driver_number === fastestPitDriverNumber;

    // Determine DRS state:
    // If Race Control disables DRS (wet, safety car, red flag, or neutralized): DISABLED
    // If P1 (leader): OFF (no car ahead)
    // If interval to car ahead <= 1.000s: ELIGIBLE (in detection range)
    let drsState: DriverDrsState = 'OFF';
    if (drsStatus === 'DISABLED') {
      drsState = 'DISABLED';
    } else if (position === 1) {
      drsState = 'OFF';
    } else {
      const rawIntervalVal = latestInterval?.interval;
      let gapSec: number | null = null;
      if (typeof rawIntervalVal === 'number') {
        gapSec = rawIntervalVal;
      } else if (typeof rawIntervalVal === 'string') {
        const parsed = parseFloat(rawIntervalVal.replace(/^\+/, ''));
        if (!Number.isNaN(parsed)) gapSec = parsed;
      }
      if (gapSec !== null && gapSec <= 1.000 && gapSec >= 0) {
        drsState = 'ELIGIBLE';
      } else {
        drsState = 'OFF';
      }
    }

    // Format gaps (with fallback to lap-time delta during Practice/Qualifying)
    let gapToLeader = formatGapToLeader(position, latestInterval?.gap_to_leader);
    let intervalToAhead = formatIntervalToAhead(position, latestInterval?.interval);

    if (!hasIntervalData && position > 1) {
      if (personalBestLapTime !== null && leaderBestTime !== null) {
        gapToLeader = `+${(personalBestLapTime - leaderBestTime).toFixed(3)}`;
      }
      const aheadBest = intermediateList[index - 1]?.personalBestLapTime ?? null;
      if (personalBestLapTime !== null && aheadBest !== null) {
        intervalToAhead = `+${(personalBestLapTime - aheadBest).toFixed(3)}`;
      }
    }

    return {
      position,
      driverNumber: driver.driver_number,
      nameAcronym: driver.name_acronym || driver.broadcast_name.slice(0, 3).toUpperCase(),
      teamName: driver.team_name ?? 'Independent',
      teamColor: getTeamColor(driver.team_name, driver.team_colour),
      gapToLeader,
      intervalToAhead,
      lastLapTime,
      isFastestLap,
      isPersonalBest,
      tyreCompound,
      tyreAgeLaps,
      inPit,
      pitStopCount,
      isFastestPitStop,
      bestPitStopDuration,
      drsState,
      headshotUrl: driver.headshot_url || null,
    };
  });
}

/**
 * Parses raw OpenF1 race control messages and extracts active flag / safety car status.
 */
export function parseActiveRaceControlStatus(
  messages: RaceControlMessage[]
): ActiveRaceControlStatus {
  if (!messages || messages.length === 0) {
    return {
      type: 'GREEN',
      label: 'TRACK CLEAR',
      message: 'All sectors green',
    };
  }

  // Sort messages descending by date
  const sorted = [...messages].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const msg of sorted) {
    const rawMsg = (msg.message || '').toUpperCase();
    const rawFlag = (msg.flag || '').toUpperCase();

    // 1. Red Flag / Session Suspended
    if (rawFlag === 'RED' || rawMsg.includes('RED FLAG') || rawMsg.includes('SESSION SUSPENDED')) {
      return {
        type: 'RED',
        label: 'SESSION SUSPENDED',
        message: msg.message,
        timestamp: msg.date,
      };
    }

    // 2. Safety Car & VSC
    if (
      msg.category === 'SafetyCar' ||
      rawMsg.includes('SAFETY CAR') ||
      rawMsg.includes('VIRTUAL SAFETY CAR') ||
      rawMsg.includes('VSC')
    ) {
      if (rawMsg.includes('VIRTUAL SAFETY CAR') || rawMsg.includes('VSC')) {
        if (rawMsg.includes('ENDING') || rawMsg.includes('CLEAR')) {
          continue;
        }
        return {
          type: 'VIRTUAL SAFETY CAR',
          label: 'VIRTUAL SAFETY CAR',
          message: msg.message,
          timestamp: msg.date,
        };
      }

      if (rawMsg.includes('ENDING') || rawMsg.includes('IN THIS LAP') || rawMsg.includes('CLEAR')) {
        continue;
      }

      return {
        type: 'SAFETY CAR',
        label: 'SAFETY CAR',
        message: msg.message,
        timestamp: msg.date,
      };
    }

    // 3. Yellow Flag
    if (rawFlag.includes('YELLOW')) {
      return {
        type: 'YELLOW',
        label: msg.sector ? `YELLOW FLAG - SECTOR ${msg.sector}` : 'YELLOW FLAG',
        message: msg.message,
        sector: msg.sector,
        timestamp: msg.date,
      };
    }

    // 4. Green / Clear
    if (rawFlag === 'CLEAR' || rawFlag === 'GREEN' || rawMsg.includes('TRACK CLEAR') || rawMsg.includes('GREEN LIGHT')) {
      return {
        type: 'GREEN',
        label: 'TRACK CLEAR',
        message: msg.message,
        timestamp: msg.date,
      };
    }
  }

  return {
    type: 'GREEN',
    label: 'TRACK CLEAR',
    message: sorted[0]?.message || 'All sectors green',
    timestamp: sorted[0]?.date,
  };
}

/**
 * Parses track weather and race control messages into unified TrackState.
 */
export function parseTrackState(
  weatherRecords: TrackWeather[],
  raceControl: RaceControlMessage[],
  activeRaceControl: ActiveRaceControlStatus
): TrackState {
  const latestWeather =
    weatherRecords && weatherRecords.length > 0 ? weatherRecords[weatherRecords.length - 1] : null;

  const sortedRC = [...(raceControl || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let drsStatus: 'ENABLED' | 'DISABLED' = 'ENABLED';
  for (const msg of sortedRC) {
    const text = (msg.message || '').toUpperCase();
    if (text.includes('DRS ENABLED')) {
      drsStatus = 'ENABLED';
      break;
    }
    if (text.includes('DRS DISABLED')) {
      drsStatus = 'DISABLED';
      break;
    }
  }

  // Safety Car, VSC, or Red Flag always disables DRS by regulation
  if (
    activeRaceControl.type === 'SAFETY CAR' ||
    activeRaceControl.type === 'VIRTUAL SAFETY CAR' ||
    activeRaceControl.type === 'RED'
  ) {
    drsStatus = 'DISABLED';
  }

  let safetyCarStatus: 'DEPLOYED' | 'VSC' | 'IN_THIS_LAP' | 'OFF' = 'OFF';
  for (const msg of sortedRC) {
    const text = (msg.message || '').toUpperCase();
    if (text.includes('SAFETY CAR IN THIS LAP') || text.includes('VSC ENDING')) {
      safetyCarStatus = 'IN_THIS_LAP';
      break;
    }
    if (text.includes('VIRTUAL SAFETY CAR') || text.includes('VSC')) {
      safetyCarStatus = 'VSC';
      break;
    }
    if (text.includes('SAFETY CAR') && !text.includes('CLEAR')) {
      safetyCarStatus = 'DEPLOYED';
      break;
    }
    if (text.includes('TRACK CLEAR') || text.includes('GREEN LIGHT')) {
      safetyCarStatus = 'OFF';
      break;
    }
  }

  if (activeRaceControl.type === 'SAFETY CAR' && safetyCarStatus !== 'IN_THIS_LAP') {
    safetyCarStatus = 'DEPLOYED';
  } else if (activeRaceControl.type === 'VIRTUAL SAFETY CAR' && safetyCarStatus !== 'IN_THIS_LAP') {
    safetyCarStatus = 'VSC';
  } else if (activeRaceControl.type === 'GREEN' && safetyCarStatus !== 'IN_THIS_LAP') {
    safetyCarStatus = 'OFF';
  }

  const isWet = Boolean(latestWeather && latestWeather.rainfall === 1);

  return {
    condition: isWet ? 'WET' : 'DRY',
    trackTemp: latestWeather?.track_temperature ?? null,
    airTemp: latestWeather?.air_temperature ?? null,
    humidity: latestWeather?.humidity ?? null,
    windSpeed: latestWeather?.wind_speed ?? null,
    rainfall: isWet,
    drsStatus,
    safetyCarStatus,
    flag: activeRaceControl.type,
    flagLabel: activeRaceControl.label,
  };
}

/**
 * Finds the most recent session with recorded data or the latest completed race
 * within the given year's sessions list.
 */
function findMostRecentSessionWithData(sessions: Session[]): Session | null {
  if (!sessions || sessions.length === 0) return null;
  const now = Date.now();
  // Filter sessions that have already started (date_start <= now)
  const pastSessions = sessions.filter(
    (s) => new Date(s.date_start).getTime() <= now
  );

  if (pastSessions.length > 0) {
    // Prefer the latest completed Race session
    const pastRace = pastSessions.find((s) =>
      s.session_name.toLowerCase().includes('race')
    );
    return pastRace || pastSessions[0];
  }

  // If all sessions in the year are in the future, pick the first in the calendar
  return sessions[sessions.length - 1] || sessions[0];
}

/**
 * Custom React Hook that polls OpenF1 endpoints and returns normalized,
 * sorted Timing Tower state with dynamic season and session selection.
 */
export function useTimingTower(refreshIntervalMs: number = 5000): UseTimingTowerResult {
  const [drivers, setDrivers] = useState<DriverTimingRow[]>([]);
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);
  const [raceControlStatus, setRaceControlStatus] = useState<ActiveRaceControlStatus>({
    type: 'GREEN',
    label: 'TRACK CLEAR',
    message: 'All sectors green',
  });
  const [trackState, setTrackState] = useState<TrackState>({
    condition: 'DRY',
    trackTemp: null,
    airTemp: null,
    humidity: null,
    windSpeed: null,
    rainfall: false,
    drsStatus: 'ENABLED',
    safetyCarStatus: 'OFF',
    flag: 'GREEN',
    flagLabel: 'TRACK CLEAR',
  });
  const [fastestPitStop, setFastestPitStop] = useState<FastestPitStop | null>(null);
  const [pitStops, setPitStops] = useState<PitStopSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(null);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);

  const isMountedRef = useRef<boolean>(true);

  // Load available sessions whenever selectedYear changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    getSessionsByYear(selectedYear)
      .then((sessions) => {
        if (!isSubscribed) return;
        setAvailableSessions(sessions);

        // Auto-select the most recent session with recorded data (or latest completed race)
        const initialSession = findMostRecentSessionWithData(sessions);
        if (initialSession) {
          setSelectedSessionKey(initialSession.session_key);
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn(`Failed to load sessions for year ${selectedYear}:`, err);
        setError(`Unable to load ${selectedYear} sessions calendar.`);
        setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedYear]);

  const fetchAndNormalizeTowerData = useCallback(async (isInitialLoad: boolean) => {
    if (!selectedSessionKey) return;

    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      const currentSession = await getSessionByKey(selectedSessionKey);

      const sessionKey = currentSession.session_key;
      const liveStatus = isSessionCurrentlyActive(currentSession);

      // Sequential throttled fetch with 250ms staggered delays between calls
      // to avoid triggering OpenF1 rate-limit (HTTP 429) thresholds
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const rawDrivers = await getDrivers(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawIntervals = await getIntervals(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawLaps = await getLaps(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawStints = await getStints(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawRaceControl = await getRaceControl(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawPitStops = await getPitStops(sessionKey);
      if (!isMountedRef.current) return;
      await delay(250);
      if (!isMountedRef.current) return;

      const rawWeather = await getTrackWeather(sessionKey);
      if (!isMountedRef.current) return;

      const currentRaceControl = parseActiveRaceControlStatus(rawRaceControl);
      setRaceControlStatus(currentRaceControl);

      const currentTrackState = parseTrackState(rawWeather, rawRaceControl, currentRaceControl);
      setTrackState(currentTrackState);

      const parsedPit = parsePitStops(rawPitStops, rawDrivers);
      setFastestPitStop(parsedPit.fastestPitStop);
      setPitStops(parsedPit.sortedPitStops);

      // Upcoming / Empty Session State check:
      // If a chosen session returns empty arrays for laps or intervals (e.g. future or unstarted session),
      // gracefully display a broadcast placeholder instead of throwing an error.
      const hasTelemetry = (rawLaps.length > 0 || rawIntervals.length > 0) && rawDrivers.length > 0;
      const isUpcomingSession = !hasTelemetry;
      setIsUpcoming(isUpcomingSession);

      if (isUpcomingSession) {
        setSessionInfo(currentSession);
        setDrivers([]);
        setFastestPitStop(null);
        setPitStops([]);
        setIsLive(liveStatus);
        setRaceControlStatus({
          type: 'GREEN',
          label: 'SESSION SCHEDULED',
          message: 'Waiting for green flag & live telemetry',
        });
        setError(null);
        return;
      }

      const normalizedRows = buildTimingTowerRows(
        rawDrivers,
        rawIntervals,
        rawLaps,
        rawStints,
        parsedPit.driverPitCounts,
        parsedPit.driverBestPitDuration,
        parsedPit.fastestDriverNumber,
        currentTrackState.drsStatus
      );

      setSessionInfo(currentSession);
      setDrivers(normalizedRows);
      setIsLive(liveStatus);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error
          ? err.message
          : 'Unknown error occurred while fetching OpenF1 telemetry.';
      setError(message);
    } finally {
      if (isMountedRef.current && isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [selectedSessionKey]);

  useEffect(() => {
    isMountedRef.current = true;

    if (selectedSessionKey) {
      fetchAndNormalizeTowerData(true);
    }

    // Set up polling interval
    const safeIntervalMs = Math.max(1000, refreshIntervalMs);
    const intervalId = setInterval(() => {
      fetchAndNormalizeTowerData(false);
    }, safeIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [refreshIntervalMs, selectedSessionKey, fetchAndNormalizeTowerData]);

  return {
    drivers,
    sessionInfo,
    isLoading,
    error,
    isLive,
    isUpcoming,
    raceControlStatus,
    trackState,
    selectedYear,
    setSelectedYear,
    selectedSessionKey,
    setSelectedSessionKey,
    availableSessions,
    fastestPitStop,
    pitStops,
  };
}