import styles from './Spinner.module.css';

export default function Spinner() {
  return (
    <div className={styles.spinner} role="status">
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
}
