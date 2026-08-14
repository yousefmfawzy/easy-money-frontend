import { useEffect, useState } from 'react';
import { formatRelativeSeconds } from '../lib/datetime';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  error: unknown | null;
  lastUpdated: Date | null;
}

export default function ConnectionStatus({ error, lastUpdated }: ConnectionStatusProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return (
      <div className={styles.errorBanner} role="status">
        Can't reach the market right now — showing the last known prices.
      </div>
    );
  }

  return (
    <div className={styles.liveIndicator} role="status">
      Live &middot; {formatRelativeSeconds(lastUpdated)}
    </div>
  );
}
