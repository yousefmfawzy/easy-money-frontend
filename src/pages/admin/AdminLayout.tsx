import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../auth/authState';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <span className={styles.appName}>Easy Money Admin</span>
          </div>
          
          <nav className={styles.nav}>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            >
              ETFs
            </NavLink>
            <NavLink 
              to="/admin/requests" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            >
              Requests
            </NavLink>
          </nav>
          
          <div className={styles.userSection}>
            <span className={styles.username}>Signed in as <bdi>{admin?.username}</bdi></span>
            <button type="button" onClick={logout} className={styles.logoutButton}>
              Log out
            </button>
            <Link to="/" className={styles.publicLink} target="_blank" rel="noopener noreferrer">
              Public Dashboard ↗
            </Link>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
