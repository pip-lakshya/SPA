import { API_BASE_URL } from "../config/env"

/**
 * Build an API URL that works in dev (same-origin proxy) and production (absolute URL).
 * Pass paths like "/api/auth/login" (must start with "/").
 */
export function apiUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`apiUrl(): path must start with "/", got "${path}"`)
  }
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

