import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404 - Not Found</h1>
        <p className={styles.text}>The page you are looking for does not exist.</p>
        <div className={styles.links}>
          <Link to="/" className={styles.link}>Market Dashboard</Link>
          <Link to="/request" className={styles.link}>Submit Trade Request</Link>
        </div>
      </div>
    </div>
  );
}
