import { createContext, useContext } from 'react';
import { AdminIdentity } from '../types/api';

export interface AuthContextType {
  token: string | null;
  admin: AdminIdentity | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
