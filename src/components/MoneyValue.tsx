import { formatDecimal } from '../lib/money';
import styles from './MoneyValue.module.css';

interface MoneyValueProps {
  value: string;
  currency?: string;
  size?: 'normal' | 'display';
}

export default function MoneyValue({ value, currency, size = 'normal' }: MoneyValueProps) {
  const formatted = formatDecimal(value);
  const sizeClass = size === 'display' ? styles.display : styles.normal;
  
  return (
    <span className={`${styles.wrapper} ${sizeClass}`}>
      {formatted}
      {currency && (
        <span className={styles.currency}>
          <bdi>{currency}</bdi>
        </span>
      )}
    </span>
  );
}
