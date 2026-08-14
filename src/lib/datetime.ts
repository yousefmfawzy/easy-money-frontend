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
