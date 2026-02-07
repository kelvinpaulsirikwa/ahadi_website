/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_BASE_URL: string
  readonly API_AUTH_PREFIX?: string
  readonly API_EVENTS_PREFIX?: string
  readonly API_PUBLIC_PREFIX?: string
  readonly API_PAYMENTS_PREFIX?: string
  readonly API_CHAT_PREFIX?: string
  readonly API_INBOX_PREFIX?: string
  readonly API_DIRECT_MESSAGES_PREFIX?: string
  readonly API_INVITATIONS_PREFIX?: string
  readonly API_INVITATION_TEMPLATES_PREFIX?: string
  readonly API_ANNOUNCEMENTS_PREFIX?: string
  readonly API_PARTICIPANTS_PREFIX?: string
  readonly API_EVENT_TYPES_PREFIX?: string
  readonly API_WHATSAPP_PREFIX?: string
  readonly API_RECEIVE_TIMEOUT?: string
  readonly GOOGLE_CLIENT_ID?: string
  readonly VITE_AUTH_SCHEME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
