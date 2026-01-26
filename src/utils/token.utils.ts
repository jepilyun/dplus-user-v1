/**
 * Token Management Utilities
 * Client-side token storage and retrieval
 */

const ACCESS_TOKEN_KEY = "accessToken";

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get access token from localStorage
 * Returns null if not in browser or token doesn't exist
 */
export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Save access token to localStorage
 */
export function saveAccessToken(token: string): void {
  if (!isBrowser()) {
    console.warn("Cannot save token: not in browser environment");
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  console.log("✅ Access token saved");
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (!isBrowser()) {
    console.warn("Cannot remove token: not in browser environment");
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  console.log("🗑️ Access token removed");
}

/**
 * Check if user has access token
 */
export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

/**
 * Decode JWT token payload (without verification)
 * This is for client-side inspection only - server will verify
 */
export function decodeJWT<T = any>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if JWT token is expired (client-side check only)
 * Server will perform actual verification
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT<{ exp?: number }>(token);
    if (!payload?.exp) return true;

    // Check if token is expired (with 10 second buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + 10;
  } catch {
    return true;
  }
}

/**
 * Get user ID from access token
 */
export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT<{ user_id?: string }>(token);
  return payload?.user_id || null;
}
