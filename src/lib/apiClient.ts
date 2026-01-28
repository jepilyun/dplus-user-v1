"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ============================================
// Constants
// ============================================
const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

// ============================================
// Refresh 요청 동기화를 위한 상태
// ============================================
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshFailed = false; // refresh 실패 시 무한 재시도 방지

// ============================================
// Token Storage Helper
// ============================================
export const TokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("dplus-access-token-user");
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("dplus-access-token-user", token);
    // 토큰 설정 시 실패 플래그 초기화
    lastRefreshFailed = false;
  },
  removeAccessToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("dplus-access-token-user");
  },
};

// ============================================
// Auth Event Dispatcher (for logout handling)
// ============================================
export const dispatchAuthEvent = (type: "logout" | "tokenRefreshed") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth", { detail: { type } }));
};

// ============================================
// 토큰 만료 확인 함수
// ============================================
const isTokenExpiredOrExpiring = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    // 만료 시간 - 현재 시간 < 버퍼 시간이면 만료 임박
    return expiresAt - Date.now() < bufferSeconds * 1000;
  } catch {
    return true; // 파싱 실패 시 만료로 간주
  }
};

// ============================================
// 토큰 갱신 함수 (실제 API 호출)
// ============================================
const performTokenRefresh = async (): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const newAccessToken = response.data?.dbResponse?.accessToken;

    if (newAccessToken) {
      TokenStorage.setAccessToken(newAccessToken);
      dispatchAuthEvent("tokenRefreshed");
      lastRefreshFailed = false;
      return newAccessToken;
    }

    lastRefreshFailed = true;
    return null;
  } catch {
    lastRefreshFailed = true;
    TokenStorage.removeAccessToken();
    return null;
  }
};

// ============================================
// 갱신 필요 여부 확인 및 갱신 (동시 요청 시 Promise 공유)
// ============================================
const refreshTokenIfNeeded = async (): Promise<string | null> => {
  const token = TokenStorage.getAccessToken();

  // 토큰이 있고 유효하면 그대로 사용
  if (token && !isTokenExpiredOrExpiring(token)) {
    return token;
  }

  // refresh 실패 후 토큰 없으면 재시도 방지
  if (lastRefreshFailed && !token) {
    return null;
  }

  // 이미 갱신 중이면 같은 Promise 공유 (핵심!)
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // 새 갱신 시작
  isRefreshing = true;
  refreshPromise = performTokenRefresh().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
};

// ============================================
// Axios Instance
// ============================================
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly 쿠키 (refreshToken) 전송용
});

// ============================================
// Request Interceptor - 요청 전 토큰 갱신
// ============================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 인증이 필요 없는 경로들
    const excludePaths = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/google"];
    const isExcluded = excludePaths.some((path) => config.url?.includes(path));

    if (!isExcluded) {
      // 요청 전에 토큰 갱신 확인
      const token = await refreshTokenIfNeeded();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor - 401 에러 처리
// ============================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체가 실패한 경우 로그아웃
      if (originalRequest.url?.includes("/auth/refresh")) {
        TokenStorage.removeAccessToken();
        dispatchAuthEvent("logout");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 다른 요청이 이미 갱신했는지 확인
      const currentToken = TokenStorage.getAccessToken();
      const sentToken = originalRequest.headers?.Authorization?.toString().replace("Bearer ", "");

      // 토큰이 바뀌었으면 새 토큰으로 재시도
      if (currentToken && sentToken && currentToken !== sentToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${currentToken}`;
        }
        return apiClient(originalRequest);
      }

      // 토큰 갱신 시도
      try {
        const newToken = await refreshTokenIfNeeded();

        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed
      }

      // Refresh 실패 시 로그아웃
      TokenStorage.removeAccessToken();
      dispatchAuthEvent("logout");
    }

    return Promise.reject(error);
  }
);

// ============================================
// Response Type (for compatibility)
// ============================================
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// ============================================
// Helper Functions (for compatibility)
// ============================================

/**
 * Save access token (alias for TokenStorage.setAccessToken)
 */
export const saveAccessToken = TokenStorage.setAccessToken;

/**
 * Remove access token (alias for TokenStorage.removeAccessToken)
 */
export const removeAccessToken = TokenStorage.removeAccessToken;

/**
 * Check if access token exists
 */
export const hasAccessToken = (): boolean => {
  return TokenStorage.getAccessToken() !== null;
};

/**
 * API GET request wrapper
 */
export async function apiGet<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
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
 * API POST request wrapper
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
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
 * API PUT request wrapper
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.put<ApiResponse<T>>(endpoint, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
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
 * API DELETE request wrapper
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

export default apiClient;
