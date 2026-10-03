import { format, formatDistanceToNow } from 'date-fns';

export function formatValue(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '--';
  return Number(value).toFixed(decimals);
}

export function formatTime(dateString: string): string {
  try {
    return format(new Date(dateString), 'HH:mm');
  } catch (e) {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString;
  }
}
