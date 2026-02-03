/**
 * WhatsApp API – POST /api/v1/whatsapp/auth/
 * Request OTP, resend OTP, verify OTP and authenticate via WhatsApp.
 */

import { post } from './client'

// --- Payload types ---

export interface WhatsAppRequestOtpPayload {
  phone_number: string
}

export interface WhatsAppResendOtpPayload {
  phone_number: string
}

export interface WhatsAppVerifyOtpPayload {
  phone_number: string
  otp_code: string
}

// --- Response types (from spec) ---

export interface WhatsAppRequestOtpResponse {
  success: boolean
  message: string
  expires_in?: number
  phone_number?: string
  [key: string]: unknown
}

export interface WhatsAppVerifyOtpResponse {
  success: boolean
  message: string
  user?: unknown
  access?: string
  refresh?: string
  is_new_user?: boolean
  [key: string]: unknown
}

// --- Endpoints ---

/**
 * POST /api/v1/whatsapp/auth/request-otp/
 * Request OTP to be sent via WhatsApp.
 * Body: { phone_number: "255765551397" }
 * Returns: { success, message, expires_in, phone_number }
 */
export function requestWhatsAppOtp(payload: WhatsAppRequestOtpPayload): Promise<WhatsAppRequestOtpResponse> {
  return post<WhatsAppRequestOtpResponse>('whatsapp/auth/request-otp/', payload)
}

/**
 * POST /api/v1/whatsapp/auth/resend-otp/
 * Resend OTP via WhatsApp.
 * Body: { phone_number: "255765551397" }
 */
export function resendWhatsAppOtp(payload: WhatsAppResendOtpPayload): Promise<unknown> {
  return post<unknown>('whatsapp/auth/resend-otp/', payload)
}

/**
 * POST /api/v1/whatsapp/auth/verify-otp/
 * Verify OTP and authenticate user.
 * Body: { phone_number, otp_code }
 * Returns: { success, message, user, access, refresh, is_new_user }
 */
export function verifyWhatsAppOtp(payload: WhatsAppVerifyOtpPayload): Promise<WhatsAppVerifyOtpResponse> {
  return post<WhatsAppVerifyOtpResponse>('whatsapp/auth/verify-otp/', payload)
}
