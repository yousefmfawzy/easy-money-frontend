export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
