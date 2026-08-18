import { useEffect, useState } from 'react';
import { formatRelativeSeconds } from '../lib/datetime';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  error: unknown | null;
  lastUpdated: Date | null;
  /**
   * 'projector' renders the artboard's under-clock readout in cqw units.
   * Default keeps the plain rem-sized banner used by non-projector views.
   */
  variant?: 'default' | 'projector';
}

export default function ConnectionStatus({ error, lastUpdated, variant = 'default' }: ConnectionStatusProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (variant === 'projector') {
    // A failed poll never blanks the board — it degrades to a subtle warning.
    if (error) {
      return (
        <div className={`${styles.projector} ${styles.projectorStale}`} role="status">
          <span className={styles.staleDot} />
          <span>RECONNECTING · {formatRelativeSeconds(lastUpdated)}</span>
        </div>
      );
    }

    return (
      <div className={`${styles.projector} ${styles.projectorLive}`} role="status">
        <span>{formatRelativeSeconds(lastUpdated)}</span>
      </div>
    );
  }

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
