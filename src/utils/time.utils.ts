/**
 * Time utility functions for journey time management
 */

/**
 * Convert time string (HH:mm) to minutes since midnight for comparison
 */
export const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Compare two time strings
 * @returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export const compareTimes = (time1: string, time2: string): number => {
  const mins1 = timeToMinutes(time1);
  const mins2 = timeToMinutes(time2);
  if (mins1 < mins2) return -1;
  if (mins1 > mins2) return 1;
  return 0;
};

/**
 * Validate that start time is before end time
 */
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return true; // Allow empty times
  return compareTimes(startTime, endTime) < 0;
};

/**
 * Add minutes to a time string
 */
export const addMinutesToTime = (time: string, minutes: number): string => {
  const totalMinutes = timeToMinutes(time) + minutes;
  return minutesToTime(totalMinutes);
};

/**
 * Format time string to ensure HH:mm format
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  // Remove any non-digit characters except colon
  const cleaned = time.replace(/[^\d:]/g, '');
  // Ensure format is HH:mm
  const parts = cleaned.split(':');
  if (parts.length === 2) {
    const hours = parts[0].padStart(2, '0').slice(0, 2);
    const mins = parts[1].padStart(2, '0').slice(0, 2);
    return `${hours}:${mins}`;
  }
  return time;
};









