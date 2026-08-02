export const msToSeconds = (ms: number) => Math.floor(ms / 1000);
export const msToMinutes = (ms: number) => Math.floor(msToSeconds(ms) / 60);
export const msToRemainingSeconds = (ms: number) => Math.floor(msToSeconds(ms) % 60);
export const msToHours = (ms: number) => Math.floor(msToSeconds(ms) / 3600);

export function msToTime(ms: number): string {
  if (ms < 0) return '0:00';

  const hours = msToHours(ms);
  const minutes = msToMinutes(ms);
  const seconds = msToRemainingSeconds(ms).toString().padStart(2, '0');

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}}`;
  else return `${minutes}:${seconds}`;
}

export function msToDuration(ms: number): string {
  const hours = msToHours(ms);
  const minutes = msToMinutes(ms);
  const seconds = msToRemainingSeconds(ms);

  let output = '';
  if (hours > 0) output += `${hours} hours${minutes > 0 || seconds > 0 ? ', ' : ''}`;
  if (minutes > 0) output += `${minutes} minutes${seconds > 0 ? ', ' : ''}`;
  if (seconds > 0) output += `${seconds} seconds`;
  return output;
}

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
