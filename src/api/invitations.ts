/**
 * Invitations API – GET /api/v1/invitations/
 * Invitation CRUD: list, get, create, update, delete, send.
 */

import { get, post, put, patch, del } from './client'

// --- Types (from Swagger schema) ---

export interface Invitation {
  id: number
  event: number
  participant: number
  participant_name: string
  participant_phone: string
  message: string
  template: string
  status: string
  sent_via: string
  sent_at: string | null
  viewed_at: string | null
  pdf_url: string
  share_link: string
  short_code: string
  created_at: string
}

export interface PaginatedInvitationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Invitation[]
}

export interface InvitationCreatePayload {
  event?: number
  participant?: number
  message?: string
  template?: string
  status?: string
  sent_via?: string
  sent_at?: string
  viewed_at?: string
  pdf_url?: string
  share_link?: string
  short_code?: string
  [key: string]: unknown
}

export interface InvitationUpdatePayload extends Partial<InvitationCreatePayload> {}

// --- Endpoints ---

/**
 * GET /api/v1/invitations/
 * List invitations. Params: page.
 */
export function fetchInvitations(params?: { page?: number }): Promise<PaginatedInvitationsResponse> {
  const search: Record<string, string> = {}
  if (params?.page != null) search.page = String(params.page)
  return get<PaginatedInvitationsResponse>(
    'invitations/',
    Object.keys(search).length ? search : undefined
  )
}

/**
 * POST /api/v1/invitations/
 * Create invitation (201).
 */
export function createInvitation(payload: InvitationCreatePayload): Promise<Invitation> {
  return post<Invitation>('invitations/', payload)
}

/**
 * GET /api/v1/invitations/{id}/
 * Get invitation by id.
 */
export function fetchInvitationById(id: number): Promise<Invitation> {
  return get<Invitation>(`invitations/${id}/`)
}

/**
 * PUT /api/v1/invitations/{id}/
 * Full update.
 */
export function updateInvitation(id: number, payload: InvitationUpdatePayload): Promise<Invitation> {
  return put<Invitation>(`invitations/${id}/`, payload)
}

/**
 * PATCH /api/v1/invitations/{id}/
 * Partial update.
 */
export function patchInvitation(id: number, payload: InvitationUpdatePayload): Promise<Invitation> {
  return patch<Invitation>(`invitations/${id}/`, payload)
}

/**
 * DELETE /api/v1/invitations/{id}/
 * Delete invitation (204).
 */
export function deleteInvitation(id: number): Promise<void> {
  return del<void>(`invitations/${id}/`)
}

/**
 * POST /api/v1/invitations/{id}/send/
 * Send invitation via specified channel.
 */
export function sendInvitation(id: number, body?: InvitationUpdatePayload): Promise<Invitation> {
  return post<Invitation>(`invitations/${id}/send/`, body ?? {})
}
