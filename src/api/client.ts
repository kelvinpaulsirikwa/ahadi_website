type Env = { API_BASE_URL?: string; API_AUTH_PREFIX?: string; VITE_AUTH_SCHEME?: string }

function getEnv(): Env {
  if (typeof import.meta === 'undefined') return {}
  return (import.meta as unknown as { env?: Env }).env ?? {}
}

function getBaseUrl(): string {
  return (getEnv().API_BASE_URL ?? '').replace(/\/$/, '')
}

export function getAuthPrefix(): string {
  const prefix = getEnv().API_AUTH_PREFIX ?? 'auth'
  return prefix.replace(/^\/|\/$/g, '')
}

export function apiUrl(path: string, searchParams?: Record<string, string>): string {
  const base = getBaseUrl()
  const pathNorm = path.replace(/^\//, '')
  const full = base ? `${base}/${pathNorm}` : (typeof window !== 'undefined' ? window.location.origin : '') + '/' + pathNorm
  const url = new URL(full)
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return url.toString()
}

export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = getBaseUrl()
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path
}

import { getAccessToken } from '@/api/token'

/** Auth scheme: "Bearer" (JWT, default) or "Token" (e.g. Django REST). Set VITE_AUTH_SCHEME in .env if needed. */
function getAuthScheme(): string {
  const env = getEnv()
  const scheme = env.VITE_AUTH_SCHEME?.trim()
  return scheme || 'Bearer'
}

/** Build headers for every request: Accept + Authorization when access token exists. */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `${getAuthScheme()} ${token}`
  }
  return headers
}

export async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = apiUrl(path, params)
  const res = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

/** GET request with Authorization Bearer token (for authenticated endpoints). */
export async function getWithAuth<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = apiUrl(path, params)
  const headers = getAuthHeaders()
  if (!headers['Authorization']) throw new Error('Not authenticated')
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

const jsonHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...getAuthHeaders(),
})

export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = apiUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const url = apiUrl(path)
  const res = await fetch(url, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const url = apiUrl(path)
  const res = await fetch(url, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

/** DELETE request; returns void on 204 or parsed JSON on 200. */
export async function del<T = void>(path: string): Promise<T> {
  const url = apiUrl(path)
  const res = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
