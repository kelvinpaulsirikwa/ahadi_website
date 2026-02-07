/**
 * Inbox API – GET /api/v1/inbox/
 * User's inbox messages: list, get, create, update, delete, mark read, unread count, conversations, mark all read.
 */

import { getWithAuth, post, put, patch, del } from './client'
import { getInboxPrefix } from '@/api/env'

const inboxPath = (suffix: string) => `${getInboxPrefix()}/${suffix}`

// --- Types (from Swagger schema) ---

export interface InboxMessage {
  id: number
  sender: number
  sender_id: number
  sender_name: string
  recipient: number
  recipient_id: number
  recipient_name: string
  event: number
  event_title: string
  message_type: string
  message_type_display: string
  title: string
  content: string
  card_image_url: string
  card_pdf_url: string
  media_url: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface PaginatedInboxResponse {
  count: number
  next: string | null
  previous: string | null
  results: InboxMessage[]
}

export interface InboxCreatePayload {
  event?: number
  message_type?: string
  title?: string
  content?: string
  media_url?: string
  is_read?: boolean
  read_at?: string
  [key: string]: unknown
}

export interface InboxUpdatePayload extends Partial<InboxCreatePayload> {}

/** GET /api/v1/inbox/unread_count/ – Get count of unread messages. Typically { count: number }. */
export interface InboxUnreadCountResponse {
  count: number
  [key: string]: unknown
}

// --- List & CRUD ---

/** GET /api/v1/inbox/ – List all inbox messages for current user. Params: page. */
export function fetchInbox(params?: { page?: number }): Promise<PaginatedInboxResponse> {
  const search: Record<string, string> = {}
  if (params?.page != null) search.page = String(params.page)
  return getWithAuth<PaginatedInboxResponse>(
    inboxPath(''),
    Object.keys(search).length ? search : undefined
  )
}

/** POST /api/v1/inbox/ – Create inbox message (201). */
export function createInbox(payload: InboxCreatePayload): Promise<InboxMessage> {
  return post<InboxMessage>(inboxPath(''), payload)
}

/** GET /api/v1/inbox/{id}/ – Get specific message. */
export function fetchInboxById(id: number): Promise<InboxMessage> {
  return getWithAuth<InboxMessage>(inboxPath(`${id}/`))
}

/** PUT /api/v1/inbox/{id}/ – Full update. */
export function updateInbox(id: number, payload: InboxUpdatePayload): Promise<InboxMessage> {
  return put<InboxMessage>(inboxPath(`${id}/`), payload)
}

/** PATCH /api/v1/inbox/{id}/ – Partial update. */
export function patchInbox(id: number, payload: InboxUpdatePayload): Promise<InboxMessage> {
  return patch<InboxMessage>(inboxPath(`${id}/`), payload)
}

/** DELETE /api/v1/inbox/{id}/ – Delete message (204). */
export function deleteInbox(id: number): Promise<void> {
  return del<void>(inboxPath(`${id}/`))
}

// --- Mark read ---

/** POST /api/v1/inbox/{id}/mark_read/ – Mark message as read. */
export function markInboxRead(id: number, body?: InboxUpdatePayload): Promise<InboxMessage> {
  return post<InboxMessage>(inboxPath(`${id}/mark_read/`), body ?? {})
}

/**
 * GET /api/v1/inbox/unread_count/
 * Get count of unread messages. No parameters. Returns 200 application/json.
 */
export function fetchInboxUnreadCount(): Promise<InboxUnreadCountResponse> {
  return getWithAuth<InboxUnreadCountResponse>(inboxPath('unread_count/'))
}

/** GET /api/v1/inbox/conversations/ – Get all conversations for current user (messages grouped by conversation partner). */
export function fetchInboxConversations(): Promise<unknown> {
  return getWithAuth<unknown>(inboxPath('conversations/'))
}

/** POST /api/v1/inbox/mark_all_read/ – Mark all messages as read. */
export function markAllInboxRead(body?: InboxUpdatePayload): Promise<unknown> {
  return post<unknown>(inboxPath('mark_all_read/'), body ?? {})
}
