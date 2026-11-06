/**
 * OpenF1 REST API Payload Interfaces
 * Documentation: https://openf1.org/#api-endpoints
 */

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: 'Practice' | 'Qualifying' | 'Sprint' | 'Race' | string;
  year: number;
}

export interface Driver {
  broadcast_name: string;
  country_code: string | null;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string | null;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string | null;
  team_name: string | null;
}

export interface Lap {
  date_start: string | null;
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  session_key: number;
  st_speed: number | null;
}

export interface Interval {
  date: string;
  driver_number: number;
  /**
   * Numeric delta in seconds (e.g. 1.42) or lapped string (e.g. "+1 LAP", "1 L")
   */
  gap_to_leader: number | string | null;
  /**
   * Numeric delta in seconds (e.g. 0.312) or lapped string (e.g. "+1 LAP")
   */
  interval: number | string | null;
  meeting_key: number;
  session_key: number;
}

export type TyreCompound =
  | 'SOFT'
  | 'MEDIUM'
  | 'HARD'
  | 'INTERMEDIATE'
  | 'WET'
  | 'UNKNOWN';

export interface Stint {
  compound: string | null;
  driver_number: number;
  lap_end: number | null;
  lap_start: number | null;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number | null;
}

export interface PitStop {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  lap_number: number;
  stop_duration: number | null;
  lane_duration?: number | null;
  pit_duration?: number | null;
}

export interface FastestPitStop {
  sessionKey: number;
  driverNumber: number;
  nameAcronym: string;
  driverFullName: string;
  teamName: string;
  teamColor: string;
  headshotUrl?: string | null;
  lapNumber: number;
  duration: number;
  isStationary: boolean;
}

export interface PitStopSummary {
  sessionKey: number;
  driverNumber: number;
  nameAcronym: string;
  driverFullName: string;
  teamName: string;
  teamColor: string;
  headshotUrl?: string | null;
  lapNumber: number;
  duration: number;
  isStationary: boolean;
  date: string;
}

/**
 * Unified UI Model for the Timing Tower
 */
export interface DriverTimingRow {
  position: number;
  driverNumber: number;
  nameAcronym: string;
  teamName: string;
  teamColor: string;
  gapToLeader: string;
  intervalToAhead: string;
  lastLapTime: number | null;
  isFastestLap: boolean;
  isPersonalBest: boolean;
  tyreCompound: TyreCompound;
  tyreAgeLaps: number;
  inPit: boolean;
  pitStopCount: number;
  isFastestPitStop: boolean;
  bestPitStopDuration: number | null;
  headshotUrl?: string | null;
}

export interface RaceControlMessage {
  meeting_key: number;
  session_key: number;
  date: string;
  driver_number: number | null;
  lap_number: number | null;
  category: 'Flag' | 'SafetyCar' | 'Drs' | 'SessionStatus' | 'Other' | string;
  flag: string | null;
  scope: string | null;
  sector: number | null;
  qualifying_phase: string | null;
  message: string;
}

export type RaceControlFlagType =
  | 'GREEN'
  | 'YELLOW'
  | 'RED'
  | 'SAFETY CAR'
  | 'VIRTUAL SAFETY CAR';

export interface ActiveRaceControlStatus {
  type: RaceControlFlagType;
  label: string;
  message?: string;
  sector?: number | null;
  timestamp?: string;
}