import { get } from './client'
import { getEventTypesPrefix } from '@/api/env'
import type { EventType } from '@/types/events'
import type { PaginatedResponse } from '@/types/events'

const eventTypesPath = (suffix: string) => `${getEventTypesPrefix()}/${suffix}`

/**
 * GET /api/v1/event-types/
 * List available event types (paginated).
 * @param params.page - Page number (1-based) within the paginated result set.
 */
export function fetchEventTypes(params?: { page?: number }): Promise<PaginatedResponse<EventType>> {
  const search: Record<string, string> = {}
  if (params?.page != null) search.page = String(params.page)
  return get<PaginatedResponse<EventType>>(
    eventTypesPath(''),
    Object.keys(search).length ? search : undefined
  )
}

/**
 * GET /api/v1/event-types/{id}/
 * Retrieve a single event type by id.
 */
export function fetchEventTypeById(id: number): Promise<EventType> {
  return get<EventType>(eventTypesPath(`${id}/`))
}
