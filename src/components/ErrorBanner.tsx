import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className={styles.banner} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
