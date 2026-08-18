import { API_BASE_URL } from '../lib/media';
import { ApiErrorEnvelope } from '../types/api';

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message: string, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

async function handleResponse<T>(res: Response, authenticated: boolean): Promise<T> {
  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unknown error occurred';
    let details: unknown = null;
    try {
      const body = await res.json() as ApiErrorEnvelope;
      if (body.error && body.error.code) {
        code = body.error.code;
        message = body.error.message || message;
        details = body.error.details ?? null;
      }
    } catch {
      // Ignored
    }
    
    if (res.status === 401 && authenticated && unauthorizedHandler) {
      unauthorizedHandler();
    }
    
    throw new ApiError(res.status, code, message, details);
  }
  
  if (res.status === 204) return null as unknown as T;
  
  return res.json() as Promise<T>;
}

async function fetchWrapper<T>(path: string, options: RequestInit, authenticated: boolean): Promise<T> {
  const headers = new Headers(options.headers);
  if (authenticated && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
    return await handleResponse<T>(res, authenticated);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Network error', null);
  }
}

export function apiGet<T>(path: string, authenticated = false): Promise<T> {
  return fetchWrapper<T>(path, { method: 'GET' }, authenticated);
}

export function apiPostJson<T>(path: string, body: unknown, authenticated = false): Promise<T> {
  return fetchWrapper<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, authenticated);
}

export function apiPatchJson<T>(path: string, body: unknown, authenticated = false): Promise<T> {
  return fetchWrapper<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, authenticated);
}

export function apiPostForm<T>(path: string, body: FormData, authenticated = false): Promise<T> {
  return fetchWrapper<T>(path, {
    method: 'POST',
    body
  }, authenticated);
}
