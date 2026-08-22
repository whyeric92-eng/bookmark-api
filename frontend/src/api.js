export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  } 

  return res
}

export function parseErrorDetail(data) {
  return Array.isArray(data.detail)
    ? data.detail.map((item) => item.msg).join(', ')
    : data.detail
}
