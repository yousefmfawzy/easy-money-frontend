import { Link } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { getEtfs } from '../api/etfs';
import { friendlyMessage } from '../api/errorMessages';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import ConnectionStatus from '../components/ConnectionStatus';
import EtfCard from '../components/EtfCard';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { data: etfs, error, isLoading, lastUpdated, refresh } = usePolling(getEtfs, 5000);

  // First load showing Spinner
  if (isLoading && !etfs && !error) {
    return (
      <div className={styles.centerPage}>
        <Spinner />
      </div>
    );
  }

  // First load that fails shows ErrorBanner
  if (error && !etfs) {
    return (
      <div className={styles.centerPage}>
        <ErrorBanner message={friendlyMessage(error)} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Easy Money</h1>
          <ConnectionStatus error={error} lastUpdated={lastUpdated} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {etfs?.map(etf => (
            <EtfCard key={etf.id} etf={etf} />
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <Link to="/request" className={styles.requestLink}>Submit Trade Request</Link>
      </footer>
    </div>
  );
}
