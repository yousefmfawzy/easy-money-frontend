import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className={styles.banner} role="alert">
      <span>{message}</span>
      <div className={styles.actions}>
        {onRetry && (
          <button className={styles.retryButton} onClick={onRetry} type="button">
            Retry
          </button>
        )}
        {onDismiss && (
          <button className={styles.retryButton} onClick={onDismiss} type="button">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
