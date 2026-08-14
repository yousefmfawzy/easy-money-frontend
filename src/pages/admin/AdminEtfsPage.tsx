import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { getEtfs } from '../../api/etfs';
import { friendlyMessage } from '../../api/errorMessages';
import { formatLocalDateTime } from '../../lib/datetime';
import EtfLogo from '../../components/EtfLogo';
import MoneyValue from '../../components/MoneyValue';
import TrendBadge from '../../components/TrendBadge';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';
import styles from './AdminEtfsPage.module.css';

export default function AdminEtfsPage() {
  const { data: etfs, error, isLoading, run: fetchEtfs } = useAsync(getEtfs);

  useEffect(() => {
    fetchEtfs();
  }, [fetchEtfs]);

  if (isLoading && !etfs) {
    return (
      <div className={styles.centerPage}>
        <Spinner />
      </div>
    );
  }

  if (error && !etfs) {
    return (
      <div className={styles.centerPage}>
        <ErrorBanner message={friendlyMessage(error)} onRetry={fetchEtfs} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manage ETFs</h1>
      </header>

      <div className={styles.list}>
        {etfs?.map(etf => (
          <Link key={etf.id} to={`/admin/etfs/${etf.id}`} className={styles.row}>
            <div className={styles.rowMain}>
              <EtfLogo src={etf.logo_url} name={etf.name} size={40} />
              <div className={styles.rowIdentity}>
                <h2 className={styles.etfName}><bdi>{etf.name}</bdi></h2>
                <div className={styles.timestamp}>
                  Updated {formatLocalDateTime(etf.updated_at)}
                </div>
              </div>
            </div>
            
            <div className={styles.rowReadouts}>
              <div className={styles.readoutGroup}>
                <div className={styles.readoutLabel}>Current Value</div>
                <div className={styles.readoutValue}>
                  <MoneyValue value={etf.current_value} currency={etf.currency} />
                </div>
              </div>
              
              <div className={styles.readoutGroup}>
                <div className={styles.readoutLabel}>Previous Value</div>
                <div className={styles.readoutValue}>
                  <MoneyValue value={etf.previous_value} currency={etf.currency} />
                </div>
              </div>
              
              <div className={styles.trendGroup}>
                <TrendBadge 
                  trend={etf.trend}
                  amount={etf.last_change_amount}
                  percentage={etf.last_change_percentage}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
