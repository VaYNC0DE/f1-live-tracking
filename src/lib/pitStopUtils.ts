import { Driver, FastestPitStop, PitStop, PitStopSummary } from './types';
import { getTeamColor } from './teamColors';

export interface ParsedPitStopData {
  fastestPitStop: FastestPitStop | null;
  sortedPitStops: PitStopSummary[];
  driverPitCounts: Map<number, number>;
  driverBestPitDuration: Map<number, number>;
  fastestDriverNumber: number | null;
}

/**
 * Normalizes OpenF1 /pit records into typed summaries, calculates pit counts per driver,
 * and determines the fastest pit stop of the session (prioritizing stationary stop_duration).
 */
export function parsePitStops(
  rawPitStops: PitStop[],
  drivers: Driver[]
): ParsedPitStopData {
  const driverMap = new Map<number, Driver>();
  for (const d of drivers) {
    if (!driverMap.has(d.driver_number)) {
      driverMap.set(d.driver_number, d);
    }
  }

  const driverPitCounts = new Map<number, number>();
  const driverBestPitDuration = new Map<number, number>();
  const validSummaries: PitStopSummary[] = [];

  for (const stop of rawPitStops) {
    const dNum = stop.driver_number;
    const driver = driverMap.get(dNum);

    // Track total pit entries
    driverPitCounts.set(dNum, (driverPitCounts.get(dNum) || 0) + 1);

    // Determine stop duration:
    // Prefer stationary stop_duration (time in box, available from late 2024+).
    // Fall back to lane_duration or pit_duration if stop_duration is null (e.g. 2023 races).
    let duration: number | null = null;
    let isStationary = false;

    if (
      typeof stop.stop_duration === 'number' &&
      stop.stop_duration > 0 &&
      Number.isFinite(stop.stop_duration)
    ) {
      duration = stop.stop_duration;
      isStationary = true;
    } else if (
      typeof stop.lane_duration === 'number' &&
      stop.lane_duration > 0 &&
      Number.isFinite(stop.lane_duration)
    ) {
      duration = stop.lane_duration;
      isStationary = false;
    } else if (
      typeof stop.pit_duration === 'number' &&
      stop.pit_duration > 0 &&
      Number.isFinite(stop.pit_duration)
    ) {
      duration = stop.pit_duration;
      isStationary = false;
    }

    if (duration !== null) {
      // Track driver's personal fastest pit stop
      const currentBest = driverBestPitDuration.get(dNum);
      if (currentBest === undefined || duration < currentBest) {
        driverBestPitDuration.set(dNum, duration);
      }

      validSummaries.push({
        sessionKey: stop.session_key,
        driverNumber: dNum,
        nameAcronym:
          driver?.name_acronym ||
          (driver?.broadcast_name ? driver.broadcast_name.slice(0, 3).toUpperCase() : `D${dNum}`),
        driverFullName: driver?.full_name || driver?.broadcast_name || `Driver #${dNum}`,
        teamName: driver?.team_name || 'Independent',
        teamColor: getTeamColor(driver?.team_name, driver?.team_colour),
        headshotUrl: driver?.headshot_url || null,
        lapNumber: stop.lap_number,
        duration,
        isStationary,
        date: stop.date,
      });
    }
  }

  // Determine fastest pit stop:
  // If any stationary stops exist, compare among stationary stops.
  // Otherwise, compare among lane duration stops.
  const stationaryStops = validSummaries.filter((s) => s.isStationary);
  const pool = stationaryStops.length > 0 ? stationaryStops : validSummaries;

  let fastestPitStop: FastestPitStop | null = null;
  let fastestDriverNumber: number | null = null;

  if (pool.length > 0) {
    const sortedPool = [...pool].sort((a, b) => a.duration - b.duration);
    const top = sortedPool[0];
    fastestPitStop = {
      sessionKey: top.sessionKey,
      driverNumber: top.driverNumber,
      nameAcronym: top.nameAcronym,
      driverFullName: top.driverFullName,
      teamName: top.teamName,
      teamColor: top.teamColor,
      headshotUrl: top.headshotUrl,
      lapNumber: top.lapNumber,
      duration: top.duration,
      isStationary: top.isStationary,
    };
    fastestDriverNumber = top.driverNumber;
  }

  // Sort all valid pit stops by duration ascending for the leaderboard
  const sortedPitStops = [...validSummaries].sort((a, b) => {
    // If mixed, prioritize stationary stops first
    if (a.isStationary !== b.isStationary) {
      return a.isStationary ? -1 : 1;
    }
    return a.duration - b.duration;
  });

  return {
    fastestPitStop,
    sortedPitStops,
    driverPitCounts,
    driverBestPitDuration,
    fastestDriverNumber,
  };
}
