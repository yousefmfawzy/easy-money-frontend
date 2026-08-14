import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RequestPage from './pages/RequestPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminEtfsPage from './pages/admin/AdminEtfsPage';
import AdminEtfDetailPage from './pages/admin/AdminEtfDetailPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './auth/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminEtfsPage />} />
          <Route path="etfs/:id" element={<AdminEtfDetailPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
