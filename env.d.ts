/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_BASE_URL: string
  readonly API_AUTH_PREFIX?: string
  readonly GOOGLE_CLIENT_ID?: string
  /** Auth header scheme: "Bearer" (default) or "Token" (e.g. Django REST). */
  readonly VITE_AUTH_SCHEME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
