import { getAuthPrefix } from '@/api/client'
import { get, post, patch, del } from '@/api/client'

const authPath = (suffix: string) => `${getAuthPrefix()}/${suffix}`

// --- Request / response types ---

export interface LoginPayload {
  phone: string
  password: string
}

export interface AuthTokenResponse {
  access?: string
  refresh?: string
  user?: unknown
  [key: string]: unknown
}

/** Response from POST /auth/social/google/ (shape may vary by backend) */
export interface GoogleAuthResponse extends AuthTokenResponse {}

export interface TokenRefreshPayload {
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
  refresh?: string
  [key: string]: unknown
}

export interface TokenVerifyPayload {
  token: string
}

export interface SocialLinkPhonePayload {
  phone: string
  code: string
}

/** Response from POST verify-otp (data may contain access, refresh, user) */
export interface VerifyOtpResponse {
  success?: boolean
  message?: string
  data?: {
    access?: string
    access_token?: string
    refresh?: string
    refresh_token?: string
    user?: unknown
    requires_phone_link?: boolean
  }
}

// --- Login / token ---

/**
 * POST /api/v1/auth/login/
 * Login with phone and password. Returns access and refresh JWT pair.
 */
export function login(payload: LoginPayload): Promise<AuthTokenResponse> {
  return post<AuthTokenResponse>(authPath('login/'), payload)
}

/**
 * POST /api/v1/auth/token/
 * Obtain JWT pair with phone and password (same as login).
 */
export function obtainToken(payload: LoginPayload): Promise<AuthTokenResponse> {
  return post<AuthTokenResponse>(authPath('token/'), payload)
}

/**
 * POST /api/v1/auth/token/refresh/
 * Exchange refresh token for new access (and optionally refresh) token.
 */
export function refreshToken(payload: TokenRefreshPayload): Promise<TokenRefreshResponse> {
  return post<TokenRefreshResponse>(authPath('token/refresh/'), payload)
}

/**
 * POST /api/v1/auth/token/verify/
 * Verify a token is valid.
 */
export function verifyToken(payload: TokenVerifyPayload): Promise<unknown> {
  return post<unknown>(authPath('token/verify/'), payload)
}

/**
 * POST /api/v1/auth/token/blacklist/
 * Blacklist a refresh token (requires token_blacklist app).
 */
export function blacklistToken(payload: TokenRefreshPayload): Promise<unknown> {
  return post<unknown>(authPath('token/blacklist/'), payload)
}

// --- Logout ---

/**
 * POST /api/v1/auth/logout/
 * Logout by blacklisting refresh token.
 */
export async function logoutApi(refreshToken: string): Promise<void> {
  await post<void>(authPath('logout/'), { refresh: refreshToken })
}

// --- Current user (me) ---

/**
 * GET /api/v1/auth/me/
 * Get current user profile.
 */
export function getMe(): Promise<unknown> {
  return get<unknown>(authPath('me/'))
}

/**
 * PATCH /api/v1/auth/me/
 * Update current user profile (supports multipart for profile picture).
 */
export function patchMe(payload: unknown): Promise<unknown> {
  return patch<unknown>(authPath('me/'), payload)
}

/**
 * DELETE /api/v1/auth/me/
 * Delete current user account (204).
 */
export function deleteMe(): Promise<void> {
  return del<void>(authPath('me/'))
}

// --- OTP ---

/**
 * POST /api/v1/auth/request-otp/
 * Request OTP for phone verification.
 */
export async function requestOtp(phone: string): Promise<void> {
  await post(authPath('request-otp/'), { phone: phone.trim() })
}

/**
 * POST /api/v1/auth/verify-otp/
 * Verify OTP and get tokens.
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  return post<VerifyOtpResponse>(authPath('verify-otp/'), { phone: phone.trim(), code: code.trim() })
}

// --- Social auth ---

/**
 * POST /api/v1/auth/social/google/
 * Google Sign-In. Accepts id_token or access_token. Returns JWT tokens.
 */
export async function signInWithGoogle(params: {
  id_token?: string
  access_token?: string
}): Promise<GoogleAuthResponse> {
  const body =
    params.id_token != null
      ? { id_token: params.id_token }
      : params.access_token != null
        ? { access_token: params.access_token }
        : null
  if (!body) throw new Error('Either id_token or access_token is required')
  return post<GoogleAuthResponse>(authPath('social/google/'), body)
}

/**
 * POST /api/v1/auth/social/facebook/
 * Facebook Sign-In. Accepts access_token. Returns JWT tokens.
 */
export function signInWithFacebook(accessToken: string): Promise<AuthTokenResponse> {
  return post<AuthTokenResponse>(authPath('social/facebook/'), { access_token: accessToken })
}

/**
 * POST /api/v1/auth/social/apple/
 * Apple Sign-In. Accepts id_token, optional user (first sign-in). Returns JWT tokens.
 */
export function signInWithApple(params: { id_token: string; user?: unknown }): Promise<AuthTokenResponse> {
  return post<AuthTokenResponse>(authPath('social/apple/'), params)
}

/**
 * POST /api/v1/auth/social/link-phone/
 * Link phone to social auth account (after OTP verification).
 */
export function linkPhone(payload: SocialLinkPhonePayload): Promise<unknown> {
  return post<unknown>(authPath('social/link-phone/'), payload)
}
