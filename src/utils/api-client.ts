/**
 * API Client Utility
 * Fetch wrapper with automatic token management and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL || "http://localhost:4000";

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Get access token from localStorage (client-side only)
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Save access token to localStorage (client-side only)
 */
export function saveAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
}

/**
 * Remove access token from localStorage (client-side only)
 */
export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
}

/**
 * Build request headers with authentication
 */
function buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Type": "web", // User frontend always uses "web"
  };

  // Merge custom headers
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Handle API response and token refresh
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Check for new access token in response headers
  const newAccessToken = response.headers.get("x-new-access-token");
  if (newAccessToken) {
    console.log("🔄 Access token refreshed");
    saveAccessToken(newAccessToken);
  }

  // Parse JSON response
  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    console.error("❌ API Error:", data.error);
    return data;
  }

  return data;
}

/**
 * API Client - GET request
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: buildHeaders(options?.headers),
      credentials: "include", // Include cookies (refresh token)
      ...options,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("❌ API Request failed:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

/**
 * API Client - POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(options?.headers),
      credentials: "include", // Include cookies (refresh token)
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("❌ API Request failed:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

/**
 * API Client - PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(options?.headers),
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("❌ API Request failed:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

/**
 * API Client - DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: buildHeaders(options?.headers),
      credentials: "include",
      ...options,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("❌ API Request failed:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}
