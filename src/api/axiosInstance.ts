/**
 * Single reusable Axios instance:
 * - Base URL from .env (API_BASE_URL)
 * - Request interceptor: adds Authorization header when access token exists
 * - Response interceptor: on 401, tries refresh once then retries; on refresh failure, runs logout and wipes tokens
 *
 * Set logout handler from app so store state is updated: setLogoutHandler(() => useAuthStore().logout())
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl, getAuthPrefix, getAuthScheme, getApiTimeoutMs } from '@/api/env'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from '@/api/token'

const baseURL = getApiBaseUrl()

export const axiosInstance = axios.create({
  baseURL: baseURL || undefined,
  headers: { Accept: 'application/json' },
  timeout: getApiTimeoutMs(),
})

type LogoutHandler = () => void
let logoutHandler: LogoutHandler | null = null

export function setLogoutHandler(handler: LogoutHandler): void {
  logoutHandler = handler
}

function doLogout(): void {
  clearAllTokens()
  if (logoutHandler) logoutHandler()
}

/** Refresh access token using fetch to avoid 401 loop in axios. */
async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  const prefix = getAuthPrefix()
  const path = `${baseURL}/${prefix}/token/refresh/`.replace(/([^:]\/)\/+/g, '$1')
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { access?: string; refresh?: string }
    if (data.access) setAccessToken(data.access)
    if (data.refresh) setRefreshToken(data.refresh)
    return true
  } catch {
    return false
  }
}

// Request: add Authorization for every request when we have a token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      const scheme = getAuthScheme()
      config.headers.Authorization = `${scheme} ${token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// Response: on 401, try refresh once then retry; on refresh failure or second 401, logout and wipe tokens
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status !== 401) return Promise.reject(err)
    if (config._retry) {
      doLogout()
      return Promise.reject(err)
    }
    config._retry = true
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      doLogout()
      return Promise.reject(err)
    }
    const token = getAccessToken()
    if (token) {
      const scheme = getAuthScheme()
      config.headers.Authorization = `${scheme} ${token}`
    }
    return axiosInstance.request(config)
  }
)
