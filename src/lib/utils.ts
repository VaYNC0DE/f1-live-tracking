import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format lap duration in seconds to M:SS.mmm (e.g. 1:35.842)
 */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '--:--.---';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);

  const formattedMins = mins > 0 ? `${mins}:` : '';
  const formattedSecs = mins > 0 ? secs.toString().padStart(2, '0') : secs.toString();
  const formattedMillis = millis.toString().padStart(3, '0');

  return `${formattedMins}${formattedSecs}.${formattedMillis}`;
}
