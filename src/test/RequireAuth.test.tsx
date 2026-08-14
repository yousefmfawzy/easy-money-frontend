import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RequireAuth from '../auth/RequireAuth';
import { AuthProvider } from '../auth/AuthContext';

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  const TestApp = () => (
    <AuthProvider>
      <Routes>
        <Route path="/admin/login" element={<div>Login Screen</div>} />
        <Route path="/admin" element={<RequireAuth />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );

  it('renders login screen when localStorage is empty, never mounts protected content', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <TestApp />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Screen')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('removes token and renders login screen when me() rejects with 401', async () => {
    localStorage.setItem('em_admin_token', 'stale-token');
    
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'UNAUTHORIZED', message: 'Token expired', details: null }
      })
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <TestApp />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Screen')).toBeInTheDocument();
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(localStorage.getItem('em_admin_token')).toBeNull();
  });
});
