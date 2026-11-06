import { Driver, Interval, Lap, PitStop, RaceControlMessage, Session, Stint } from './types';

const BASE_URL = 'https://api.openf1.org/v1';

/**
 * Fallback session key: 2023 Singapore Grand Prix Race (9158).
 * Contains complete telemetry, intervals, stints, and lap histories.
 */
export const FALLBACK_SESSION_KEY = 9158;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const SUPPORTED_SEASONS = [2026, 2025, 2024, 2023] as const;
export type SupportedSeason = (typeof SUPPORTED_SEASONS)[number];

const DEFAULT_CACHE_TTL_MS = 5000;
const STATIC_CACHE_TTL_MS = 600_000; // 10 minutes cache for session lists and driver rosters
const DEBOUNCE_WINDOW_MS = 250;
const MAX_429_RETRIES = 2;
const RETRY_BACKOFF_BASE_MS = 1200;

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Generic fetcher with in-memory TTL caching, in-flight promise deduplication,
 * request debouncing, and exponential backoff retry on HTTP 429 rate limits.
 */
async function fetchWithCacheAndDebounce<T>(
  endpoint: string,
  params: Record<string, string | number>,
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<T> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;
  const now = Date.now();

  // 1. Return fresh cached response if still within TTL
  const cached = responseCache.get(url) as CacheEntry<T> | undefined;
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  // 2. Deduplicate identical concurrent in-flight requests
  const existingRequest = inFlightRequests.get(url) as Promise<T> | undefined;
  if (existingRequest) {
    return existingRequest;
  }

  // 3. Debounce and execute network request with HTTP 429 retry backoff
  const requestPromise = new Promise<T>((resolve, reject) => {
    const existingTimer = debounceTimers.get(url);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      debounceTimers.delete(url);
      try {
        let attempts = 0;
        while (true) {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (response.status === 429) {
            if (attempts < MAX_429_RETRIES) {
              attempts++;
              const backoffMs = RETRY_BACKOFF_BASE_MS * attempts;
              await new Promise((r) => setTimeout(r, backoffMs));
              continue;
            }
            if (cached) {
              resolve(cached.data);
              return;
            }
            throw new Error('OpenF1 API rate limit exceeded (HTTP 429).');
          }

          if (response.status === 404) {
            // OpenF1 returns HTTP 404 {"detail": "No results found."} when a query yields no records
            resolve([] as unknown as T);
            return;
          }

          if (!response.ok) {
            throw new Error(
              `OpenF1 API error: HTTP ${response.status} (${response.statusText})`
            );
          }

          const data = (await response.json()) as T;
          responseCache.set(url, { data, timestamp: Date.now() });
          resolve(data);
          break;
        }
      } catch (err) {
        if (cached) {
          // Graceful fallback to stale cache on transient network errors or rate limit
          resolve(cached.data);
        } else {
          reject(err);
        }
      } finally {
        inFlightRequests.delete(url);
      }
    }, DEBOUNCE_WINDOW_MS);

    debounceTimers.set(url, timer);
  });

  inFlightRequests.set(url, requestPromise);
  return requestPromise;
}

/**
 * Checks if a session is currently active based on its start and end timestamps.
 */
export function isSessionCurrentlyActive(session: Session): boolean {
  const now = Date.now();
  const start = new Date(session.date_start).getTime();
  const end = new Date(session.date_end).getTime();
  // 15-minute post-session buffer for final classification updates
  const postSessionBufferMs = 15 * 60 * 1000;
  return now >= start && now <= end + postSessionBufferMs;
}

/**
 * Fetches metadata for a specific session key.
 */
export async function getSessionByKey(sessionKey: number): Promise<Session> {
  const sessions = await fetchWithCacheAndDebounce<Session[]>(
    '/sessions',
    { session_key: sessionKey },
    STATIC_CACHE_TTL_MS
  );

  if (!sessions || sessions.length === 0) {
    throw new Error(`Session ${sessionKey} not found.`);
  }

  return sessions[0];
}

/**
 * Fetches all sessions for a given year (defaults to 2026).
 * Caches in memory per year and sorts reverse-chronologically so the latest events
 * (e.g. Mexico 2026, upcoming Brazil 2026) appear at the top.
 */
export async function getSessionsByYear(year: number = 2026): Promise<Session[]> {
  const sessions = await fetchWithCacheAndDebounce<Session[]>(
    '/sessions',
    { year },
    STATIC_CACHE_TTL_MS
  );

  if (!sessions || !Array.isArray(sessions)) {
    return [];
  }

  // Sort reverse-chronologically so the latest events appear at the top
  return [...sessions].sort(
    (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
  );
}

/**
 * Fetches the latest session from OpenF1.
 * Automatically falls back to session_key 9158 if the latest session is inactive
 * or returns empty driver/lap arrays so the app works reliably in playback mode.
 */
export async function getLatestSession(): Promise<Session> {
  try {
    const latestSessions = await fetchWithCacheAndDebounce<Session[]>(
      '/sessions',
      { session_key: 'latest' },
      STATIC_CACHE_TTL_MS
    );

    const candidate = latestSessions?.[0];

    if (candidate && isSessionCurrentlyActive(candidate)) {
      const drivers = await getDrivers(candidate.session_key);
      await new Promise((r) => setTimeout(r, 250));
      const laps = await getLaps(candidate.session_key);

      if (drivers.length > 0 && laps.length > 0) {
        return candidate;
      }
    }
  } catch {
    // Fall through to fallback session if querying 'latest' fails
  }

  return getSessionByKey(FALLBACK_SESSION_KEY);
}

/**
 * Fetches all participating drivers for a given session.
 */
export async function getDrivers(sessionKey: number): Promise<Driver[]> {
  return fetchWithCacheAndDebounce<Driver[]>(
    '/drivers',
    { session_key: sessionKey },
    STATIC_CACHE_TTL_MS
  );
}

/**
 * Fetches interval and gap-to-leader data for a given session.
 */
export async function getIntervals(sessionKey: number): Promise<Interval[]> {
  return fetchWithCacheAndDebounce<Interval[]>(
    '/intervals',
    { session_key: sessionKey },
    DEFAULT_CACHE_TTL_MS
  );
}

/**
 * Fetches all lap timing records for a given session.
 */
export async function getLaps(sessionKey: number): Promise<Lap[]> {
  return fetchWithCacheAndDebounce<Lap[]>(
    '/laps',
    { session_key: sessionKey },
    DEFAULT_CACHE_TTL_MS
  );
}

/**
 * Fetches tyre stint records for a given session.
 */
export async function getStints(sessionKey: number): Promise<Stint[]> {
  return fetchWithCacheAndDebounce<Stint[]>(
    '/stints',
    { session_key: sessionKey },
    DEFAULT_CACHE_TTL_MS
  );
}

/**
 * Fetches live race control telemetry (flags, safety car status, sectors).
 */
export async function getRaceControl(sessionKey: number): Promise<RaceControlMessage[]> {
  return fetchWithCacheAndDebounce<RaceControlMessage[]>(
    '/race_control',
    { session_key: sessionKey },
    DEFAULT_CACHE_TTL_MS
  );
}

/**
 * Fetches pit stop records for a given session.
 */
export async function getPitStops(sessionKey: number): Promise<PitStop[]> {
  return fetchWithCacheAndDebounce<PitStop[]>(
    '/pit',
    { session_key: sessionKey },
    DEFAULT_CACHE_TTL_MS
  );
}