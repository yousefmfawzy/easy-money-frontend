import { apiGet, apiPostJson } from './client';
import { AdminIdentity, TokenResponse } from '../types/api';

export function login(username: string, password: string): Promise<TokenResponse> {
  return apiPostJson<TokenResponse>('/api/auth/login', { username, password }, false);
}

export function me(): Promise<AdminIdentity> {
  return apiGet<AdminIdentity>('/api/auth/me', true);
}
