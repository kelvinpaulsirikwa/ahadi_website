/**
 * Direct messages API – POST /api/v1/direct-messages/
 * Send DM, get conversation with a user, mark conversation as read.
 */

import { get, getWithAuth, post } from './client'
import { getDirectMessagesPrefix } from '@/api/env'

const dmPath = (suffix: string) => `${getDirectMessagesPrefix()}/${suffix}`

// --- Payload types (from spec) ---

export interface SendDirectMessagePayload {
  recipient_id: number
  title: string
  content: string
  event_id?: number
  [key: string]: unknown
}

// --- Endpoints ---

/**
 * POST /api/v1/direct-messages/
 * Send a direct message to another user.
 * Body: { recipient_id, title, content, event_id? }
 * Returns: 201
 */
export function sendDirectMessage(payload: SendDirectMessagePayload): Promise<unknown> {
  return post<unknown>(dmPath(''), payload)
}

/**
 * GET /api/v1/direct-messages/conversation/{user_id}/
 * Get conversation history with a user (messages where current user is sender/recipient and user_id is the other party).
 */
export function fetchConversation(userId: number | string): Promise<unknown> {
  return getWithAuth<unknown>(dmPath(`conversation/${encodeURIComponent(String(userId))}/`))
}

/**
 * POST /api/v1/direct-messages/conversation/{user_id}/read/
 * Mark all messages from a user as read.
 */
export function markConversationRead(userId: number | string): Promise<unknown> {
  return post<unknown>(dmPath(`conversation/${encodeURIComponent(String(userId))}/read/`), {})
}
