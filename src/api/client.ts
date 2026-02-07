/**
 * API client: all requests go through axiosInstance (single place for base URL from .env,
 * Authorization header, and 401 refresh + logout). Helpers here keep the same API for the rest of the app.
 */

import { getApiBaseUrl } from '@/api/env'
import { getAccessToken } from '@/api/token'
import { axiosInstance } from '@/api/axiosInstance'

export { getAuthPrefix } from '@/api/env'

function getBaseUrl(): string {
  return getApiBaseUrl()
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

function getMediaBaseUrl(): string {
  const base = getBaseUrl()
  if (!base) return typeof window !== 'undefined' ? window.location.origin : ''
  try {
    return new URL(base).origin
  } catch {
    return base
  }
}

/** Full URL for a media path. Uses API host from .env. */
export function mediaUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getMediaBaseUrl()
  return origin ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : path
}

// --- HTTP methods via axiosInstance (Authorization added by interceptor when token exists) ---

function normPath(path: string): string {
  return path.replace(/^\//, '')
}

export async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await axiosInstance.get<T>(normPath(path), { params })
  return res.data
}

/** GET with auth required (throws if no token; interceptor still adds it when present). */
export async function getWithAuth<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!getAccessToken()) throw new Error('Not authenticated')
  const res = await axiosInstance.get<T>(normPath(path), { params })
  return res.data
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.post<T>(normPath(path), body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.put<T>(normPath(path), body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.patch<T>(normPath(path), body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data
}

/** PATCH with FormData (e.g. file upload). Do not set Content-Type; browser sets multipart boundary. */
export async function patchMultipart<T>(path: string, formData: FormData): Promise<T> {
  const res = await axiosInstance.patch<T>(normPath(path), formData)
  return res.data
}

export async function del<T = void>(path: string): Promise<T> {
  const res = await axiosInstance.delete<T>(normPath(path))
  return res.data as T
}
