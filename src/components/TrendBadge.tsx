import { trendPresentation } from '../lib/trend';
import { formatSignedAmount, formatPercentage } from '../lib/money';
import styles from './TrendBadge.module.css';

interface TrendBadgeProps {
  trend: string;
  amount?: string;
  percentage?: string;
}

export default function TrendBadge({ trend, amount, percentage }: TrendBadgeProps) {
  const presentation = trendPresentation(trend);
  
  const hasDetails = amount !== undefined && percentage !== undefined;
  
  let ariaLabel = presentation.label;
  if (hasDetails) {
    ariaLabel = `${presentation.label} ${amount}, ${percentage} percent`;
  }
  
  return (
    <span 
      className={styles.badge} 
      style={{ color: presentation.colorVar }}
      aria-label={ariaLabel}
    >
      <span aria-hidden="true" className={styles.icon}>{presentation.icon}</span>
      {hasDetails && (
        <span aria-hidden="true">
          {formatSignedAmount(amount)} ({formatPercentage(percentage)})
        </span>
      )}
    </span>
  );
}
