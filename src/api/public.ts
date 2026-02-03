/**
 * Public API – GET /api/v1/public/
 * Public endpoints (no authentication): config, info, plans.
 */

import { get } from './client'

/**
 * GET /api/v1/public/config/
 * Get public app configuration. No auth required.
 */
export function fetchPublicConfig(): Promise<unknown> {
  return get<unknown>('public/config/')
}

/**
 * GET /api/v1/public/info/
 * Get basic app information for landing page. No auth required.
 */
export function fetchPublicInfo(): Promise<unknown> {
  return get<unknown>('public/info/')
}

/**
 * GET /api/v1/public/plans/
 * Get all active subscription plans. No auth required.
 */
export function fetchPublicPlans(): Promise<unknown> {
  return get<unknown>('public/plans/')
}
