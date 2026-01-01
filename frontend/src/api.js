// Shared fetch helper with residentId passthrough (dev-friendly)
export const API = 'http://localhost:8080';
const isDevToken = (t) => !t || t === 'demo-token' || t === 'null' || t === 'undefined';

export const authFetch = async (
  path,
  { method = 'GET', body, headers = {}, userId } = {}
) => {
  const token = localStorage.getItem('authToken');
  let url = `${API}${path}`;
  if (userId && !url.includes('residentId=')) {
    url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
  }
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token && !isDevToken(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  return fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
};