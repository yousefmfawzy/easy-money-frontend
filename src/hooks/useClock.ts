import { useEffect, useState } from 'react';

/** Formats as the artboard's clock does: 12-hour, zero-padded, with AM/PM. */
function formatClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  return `${hours12}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${suffix}`;
}

/** Live wall clock for the projector header, ticking once a second. */
export function useClock(): string {
  const [now, setNow] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}
