import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authState';
import Spinner from '../components/Spinner';

export default function RequireAuth() {
  const { isChecking, isAuthenticated } = useAuth();

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
