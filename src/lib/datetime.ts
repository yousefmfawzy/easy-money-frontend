export function formatLocalDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return '—';
  }
}

export function formatRelativeSeconds(date: Date | null): string {
  if (!date) return '—';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 0) return 'updated 0s ago';
  return `updated ${seconds}s ago`;
}

/**
 * Compact axis label for a history point. Chart ticks sit a few pixels apart,
 * so repeating the full date on every tick (the same date, forty times over)
 * only crowds the axis: drop the date when the whole series is one day.
 */
export function formatChartTick(iso: string, withDate: boolean): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, {
      ...(withDate ? { month: 'short', day: 'numeric' } : {}),
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  } catch {
    return '—';
  }
}

/** True when the timestamps do not all fall on the same local calendar day. */
export function spansMultipleDays(isoList: string[]): boolean {
  const days = new Set<string>();
  for (const iso of isoList) {
    const date = new Date(iso);
    if (isNaN(date.getTime())) continue;
    days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    if (days.size > 1) return true;
  }
  return false;
}
