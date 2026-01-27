"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ============================================
// Token Storage Helper
// ============================================
export const TokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("accessToken", token);
  },
  removeAccessToken: (): void => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("accessToken");
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
// Axios Instance
// ============================================
const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly 쿠키 (refreshToken) 전송용
});

// ============================================
// Request Interceptor
// ============================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = TokenStorage.getAccessToken();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

      // 이미 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청 (refreshToken은 httpOnly 쿠키로 자동 전송)
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.dbResponse?.accessToken;

        if (newAccessToken) {
          TokenStorage.setAccessToken(newAccessToken);
          dispatchAuthEvent("tokenRefreshed");

          // 대기 중인 요청들 처리
          processQueue(null, newAccessToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        TokenStorage.removeAccessToken();
        dispatchAuthEvent("logout");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
