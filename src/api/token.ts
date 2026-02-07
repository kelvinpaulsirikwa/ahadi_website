/**
 * Single source of truth for the access token: stored at login, sent on every API request.
 * Key must match what the API client reads (client.ts uses this).
 */

const ACCESS_KEY = 'ahadi_access'
const REFRESH_KEY = 'ahadi_refresh'

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const t = localStorage.getItem(ACCESS_KEY)
  return t != null && t !== '' ? t : null
}

export function setAccessToken(token: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ACCESS_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const t = localStorage.getItem(REFRESH_KEY)
  return t != null && t !== '' ? t : null
}

export function setRefreshToken(token: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(REFRESH_KEY, token)
}

export function clearRefreshToken(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(REFRESH_KEY)
}

/** Wipe access and refresh tokens (e.g. on logout or after failed refresh). */
export function clearAllTokens(): void {
  clearAccessToken()
  clearRefreshToken()
}

/**
 * Extract access token from a login/verify response (handles various backend shapes).
 * Tries: access, access_token, token, key (top-level and under data).
 */
export function extractAccessTokenFromResponse(data: unknown): string | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const dataObj = o.data as Record<string, unknown> | undefined
  const candidates: unknown[] = [
    o.access,
    o.access_token,
    o.token,
    o.key,
    dataObj?.access,
    dataObj?.access_token,
    dataObj?.token,
    dataObj?.key,
  ]
  for (const v of candidates) {
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  return null
}
