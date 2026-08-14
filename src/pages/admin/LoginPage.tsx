import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/authState';
import { friendlyMessage } from '../../api/errorMessages';
import ErrorBanner from '../../components/ErrorBanner';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(friendlyMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Sign In</h1>
        
        {error && (
          <div role="alert" className={styles.errorContainer}>
            <ErrorBanner message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input 
              id="username"
              type="text"
              autoComplete="username"
              required
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={isSubmitting || !username.trim() || !password}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
