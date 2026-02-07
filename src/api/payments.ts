/**
 * Payments API – GET /api/v1/payments/
 * Bill Pay lookup, checkout (bank/MNO), contributions, disbursements, events payout/transactions, subscriptions, wallet.
 */

import { get, getWithAuth, post, patch } from './client'
import { getPaymentsPrefix } from '@/api/env'

const paymentsPath = (suffix: string) => `${getPaymentsPrefix()}/${suffix}`

// --- Payload types (from spec) ---

export interface SubscriptionCheckoutBankPayload {
  plan_id: number
  billing_cycle: string
  provider: string
  [key: string]: unknown
}

export interface SubscriptionCheckoutMnoPayload {
  plan_id: number
  billing_cycle: string
  provider: string
  account_number: string
  [key: string]: unknown
}

// --- Bill Pay / Lookup (public) ---

/**
 * GET /api/v1/payments/billpay/lookup/{bill_identifier}/
 * Get event info by Bill Pay identifier (public). Verify before payment via USSD.
 */
export function fetchBillPayLookup(billIdentifier: string): Promise<unknown> {
  return get<unknown>(paymentsPath(`billpay/lookup/${encodeURIComponent(billIdentifier)}/`))
}

// --- Callback (webhook – typically server-to-server) ---

/**
 * POST /api/v1/payments/callback/
 * AzamPay webhook; handle payment notifications. Usually called by provider, not from frontend.
 */
export function paymentsCallback(payload: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('callback/'), payload)
}

// --- Checkout ---

/**
 * POST /api/v1/payments/checkout/bank/
 * Bank checkout (CRDB, NMB). Initiates bank payment for contribution; requires OTP.
 */
export function checkoutBank(body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('checkout/bank/'), body ?? {})
}

/**
 * GET /api/v1/payments/checkout/mno/fee/
 * Get transaction fee for amount and provider. Query: amount, provider.
 */
export function getCheckoutMnoFee(amount: number, provider: string): Promise<unknown> {
  return get<unknown>(paymentsPath('checkout/mno/fee/'), {
    amount: String(amount),
    provider,
  })
}

/**
 * POST /api/v1/payments/checkout/mno/
 * Mobile money checkout. User gets USSD prompt to confirm.
 * Body: event_id, amount, phone_number, provider, payer_name? (optional).
 */
export function checkoutMno(body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('checkout/mno/'), body ?? {})
}

// --- Contributions ---

/**
 * POST /api/v1/payments/contributions/manual/
 * Manual contribution entry by admin/organizer (cash, bank transfer, M-Pesa to personal number, items).
 */
export function createManualContribution(body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('contributions/manual/'), body ?? {})
}

// --- Disbursements (auth) ---

/**
 * GET /api/v1/payments/disbursements/
 * Disbursements received by the current user.
 */
export function fetchDisbursements(): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath('disbursements/'))
}

/**
 * GET /api/v1/payments/disbursements/{reference}/
 * Check status of a disbursement.
 */
export function fetchDisbursementByReference(reference: string): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`disbursements/${encodeURIComponent(reference)}/`))
}

// --- Event-specific (auth) ---

/**
 * GET /api/v1/payments/events/{event_id}/billpay/
 */
export function fetchEventBillPay(eventId: number): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`events/${eventId}/billpay/`))
}

/**
 * PATCH /api/v1/payments/events/{event_id}/billpay/
 * Toggle Bill Pay account active/inactive.
 */
export function patchEventBillPay(eventId: number, body?: unknown): Promise<unknown> {
  return patch<unknown>(paymentsPath(`events/${eventId}/billpay/`), body ?? {})
}

/**
 * GET /api/v1/payments/events/{event_id}/contributions/
 * List contributions for an event (owner, staff, or participants).
 */
export function fetchEventContributions(eventId: number): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`events/${eventId}/contributions/`))
}

/**
 * POST /api/v1/payments/events/{event_id}/disburse/
 * Initiate disbursement/payout to organizer (organizer or admin only).
 */
export function disburseEvent(eventId: number, body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath(`events/${eventId}/disburse/`), body ?? {})
}

/**
 * GET /api/v1/payments/events/{event_id}/disbursements/
 * List disbursements for an event.
 */
export function fetchEventDisbursements(eventId: number): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`events/${eventId}/disbursements/`))
}

/**
 * GET /api/v1/payments/events/{event_id}/payout/
 * Payout summary: gross_amount, total_fees, net_payout, fee_breakdown (organizer/admin only).
 */
export function fetchEventPayout(eventId: number): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`events/${eventId}/payout/`))
}

/**
 * GET /api/v1/payments/events/{event_id}/transactions/
 * Transactions for event (owner/admin only).
 */
export function fetchEventTransactions(eventId: number): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`events/${eventId}/transactions/`))
}

// --- Manual update (sandbox) ---

/**
 * POST /api/v1/payments/manual-update/{reference}/
 * Manually mark transaction completed (sandbox when callbacks are not sent).
 */
export function manualUpdateTransaction(reference: string, body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath(`manual-update/${encodeURIComponent(reference)}/`), body ?? {})
}

// --- Providers ---

/**
 * GET /api/v1/payments/providers/
 * List available payment providers by type.
 */
export function fetchPaymentProviders(): Promise<unknown> {
  return get<unknown>(paymentsPath('providers/'))
}

// --- Subscriptions ---

/**
 * POST /api/v1/payments/subscriptions/billpay/lookup/
 * Bill Pay name lookup for subscriptions (reference: AHADI-SUB-{user_id} or email).
 */
export function subscriptionBillPayLookup(body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('subscriptions/billpay/lookup/'), body ?? {})
}

/**
 * POST /api/v1/payments/subscriptions/billpay/payment/
 * Bill Pay payment notification for subscriptions.
 */
export function subscriptionBillPayPayment(body?: unknown): Promise<unknown> {
  return post<unknown>(paymentsPath('subscriptions/billpay/payment/'), body ?? {})
}

/**
 * POST /api/v1/payments/subscriptions/checkout/bank/
 * Pay for subscription via bank. Body: { plan_id, billing_cycle, provider }.
 */
export function subscriptionCheckoutBank(payload: SubscriptionCheckoutBankPayload): Promise<unknown> {
  return post<unknown>(paymentsPath('subscriptions/checkout/bank/'), payload)
}

/**
 * POST /api/v1/payments/subscriptions/checkout/mno/
 * Pay for subscription via mobile money. Body: { plan_id, billing_cycle, provider, account_number }.
 */
export function subscriptionCheckoutMno(payload: SubscriptionCheckoutMnoPayload): Promise<unknown> {
  return post<unknown>(paymentsPath('subscriptions/checkout/mno/'), payload)
}

/**
 * GET /api/v1/payments/subscriptions/my/
 * Current user's subscription status.
 */
export function fetchMySubscription(): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath('subscriptions/my/'))
}

/**
 * GET /api/v1/payments/subscriptions/plans/
 * All available subscription plans.
 */
export function fetchSubscriptionPlans(): Promise<unknown> {
  return get<unknown>(paymentsPath('subscriptions/plans/'))
}

// --- Transactions (auth) ---

/**
 * GET /api/v1/payments/transactions/
 * Transactions for the authenticated user. Optional status filter: SUCCESS, PENDING, FAILED.
 */
export function fetchMyTransactions(params?: { status?: string }): Promise<unknown> {
  const query = params?.status ? { status: params.status } : undefined
  return getWithAuth<unknown>(paymentsPath('transactions/'), query as Record<string, string> | undefined)
}

/**
 * GET /api/v1/payments/transactions/{reference}/
 * Transaction status by reference.
 */
export function fetchTransactionByReference(reference: string): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath(`transactions/${encodeURIComponent(reference)}/`))
}

// --- Wallet (auth) ---

/**
 * GET /api/v1/payments/wallet/
 * Organizer wallet summary – balance across events, withdrawable funds.
 */
export function fetchWallet(): Promise<unknown> {
  return getWithAuth<unknown>(paymentsPath('wallet/'))
}
