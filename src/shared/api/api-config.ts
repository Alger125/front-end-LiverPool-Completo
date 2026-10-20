export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export function apiUrl(path: `/${string}`): string {
  return new URL(path.replace(/^\//, ''), `${API_BASE_URL}/`).href;
}
