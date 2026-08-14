import { Etf } from '../types/api';
import EtfLogo from './EtfLogo';
import MoneyValue from './MoneyValue';
import TrendBadge from './TrendBadge';
import { trendPresentation } from '../lib/trend';
import styles from './EtfCard.module.css';

interface EtfCardProps {
  etf: Etf;
}

export default function EtfCard({ etf }: EtfCardProps) {
  const presentation = trendPresentation(etf.trend);

  return (
    <article 
      className={styles.card} 
      style={{ 
        borderColor: presentation.colorVar,
        '--trend-color': presentation.colorVar
      } as React.CSSProperties}
      aria-labelledby={`etf-name-${etf.id}`}
    >
      <header className={styles.header}>
        <EtfLogo src={etf.logo_url} name={etf.name} size={48} />
        <h2 id={`etf-name-${etf.id}`} className={styles.name}>
          <bdi>{etf.name}</bdi>
        </h2>
      </header>
      
      <div className={styles.valueContainer}>
        <MoneyValue 
          value={etf.current_value} 
          currency={etf.currency} 
          size="display" 
        />
      </div>
      
      <footer className={styles.footer}>
        <TrendBadge 
          trend={etf.trend} 
          amount={etf.last_change_amount} 
          percentage={etf.last_change_percentage} 
        />
      </footer>
    </article>
  );
}
