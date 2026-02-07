/**
 * Announcements API – GET /api/v1/announcements/
 * Announcement CRUD: list, get, create, update, delete.
 */

import { get, post, put, patch, del } from './client'
import { getAnnouncementsPrefix } from '@/api/env'

const announcementsPath = (suffix: string) => `${getAnnouncementsPrefix()}/${suffix}`

// --- Types (from Swagger schema) ---

export interface Announcement {
  id: number
  event: number
  author: number
  author_name: string
  title: string
  content: string
  is_pinned: boolean
  send_notification: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedAnnouncementsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Announcement[]
}

export interface AnnouncementCreatePayload {
  event?: number
  title?: string
  content?: string
  is_pinned?: boolean
  send_notification?: boolean
  [key: string]: unknown
}

export interface AnnouncementUpdatePayload extends Partial<AnnouncementCreatePayload> {}

// --- Endpoints ---

/**
 * GET /api/v1/announcements/
 * List announcements. Params: page.
 */
export function fetchAnnouncements(params?: { page?: number }): Promise<PaginatedAnnouncementsResponse> {
  const search: Record<string, string> = {}
  if (params?.page != null) search.page = String(params.page)
  return get<PaginatedAnnouncementsResponse>(
    announcementsPath(''),
    Object.keys(search).length ? search : undefined
  )
}

/**
 * POST /api/v1/announcements/
 * Create announcement (201).
 */
export function createAnnouncement(payload: AnnouncementCreatePayload): Promise<Announcement> {
  return post<Announcement>(announcementsPath(''), payload)
}

/**
 * GET /api/v1/announcements/{id}/
 * Get announcement by id.
 */
export function fetchAnnouncementById(id: number): Promise<Announcement> {
  return get<Announcement>(announcementsPath(`${id}/`))
}

/**
 * PUT /api/v1/announcements/{id}/
 * Full update.
 */
export function updateAnnouncement(id: number, payload: AnnouncementUpdatePayload): Promise<Announcement> {
  return put<Announcement>(announcementsPath(`${id}/`), payload)
}

/**
 * PATCH /api/v1/announcements/{id}/
 * Partial update.
 */
export function patchAnnouncement(id: number, payload: AnnouncementUpdatePayload): Promise<Announcement> {
  return patch<Announcement>(`announcements/${id}/`, payload)
}

/**
 * DELETE /api/v1/announcements/{id}/
 * Delete announcement (204).
 */
export function deleteAnnouncement(id: number): Promise<void> {
  return del<void>(announcementsPath(`${id}/`))
}
