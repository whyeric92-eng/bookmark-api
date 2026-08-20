export const BASE_URL = 'http://127.0.0.1:8001'

export function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(`${BASE_URL}${path}`, { ...options, headers })
}
