/**
 * API origin for auth and other calls.
 * - Leave `VITE_API_URL` unset or empty in dev → use same-origin `/api/...` (Vite proxies to backend).
 * - In production, set `VITE_API_URL` to your deployed API (no trailing slash).
 */
const trimmed = import.meta.env.VITE_API_URL?.trim() ?? ""

export const API_BASE_URL = trimmed.length > 0 ? trimmed.replace(/\/$/, "") : ""

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ""
