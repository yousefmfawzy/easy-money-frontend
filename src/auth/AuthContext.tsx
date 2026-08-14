import { useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthContext } from './authState';
import { AdminIdentity } from '../types/api';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { login as apiLogin, me as apiMe } from '../api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('em_admin_token');
    setAuthToken(null);
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    
    const storedToken = localStorage.getItem('em_admin_token');
    if (storedToken) {
      setAuthToken(storedToken);
      apiMe()
        .then(identity => {
          setToken(storedToken);
          setAdmin(identity);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => {
          setIsChecking(false);
        });
    } else {
      setIsChecking(false);
    }
  }, [clearAuth]);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    localStorage.setItem('em_admin_token', res.access_token);
    setAuthToken(res.access_token);
    
    const identity = await apiMe();
    setToken(res.access_token);
    setAdmin(identity);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated: !!admin, isChecking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
