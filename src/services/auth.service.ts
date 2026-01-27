/**
 * Auth Service
 * Authentication API calls matching backend endpoints
 */

import type {
  GoogleAuthInput,
  LoginInput,
  LoginResponseData,
  RegisterInput,
  User,
} from "@/types/auth.types";
import { apiDelete, apiGet, apiPost, removeAccessToken, saveAccessToken } from "@/utils/api/apiClient";

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(input: RegisterInput): Promise<{
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
}> {
  const response = await apiPost<LoginResponseData>("/api/auth/register", input);

  if (response.success && response.data) {
    // Save access token to localStorage
    saveAccessToken(response.data.accessToken);

    return {
      success: true,
      user: response.data.user as User,
      accessToken: response.data.accessToken,
    };
  }

  return {
    success: false,
    error: response.error?.message || "Registration failed",
  };
}

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(input: LoginInput): Promise<{
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
}> {
  const response = await apiPost<LoginResponseData>("/api/auth/login", input);

  if (response.success && response.data) {
    // Save access token to localStorage
    saveAccessToken(response.data.accessToken);

    return {
      success: true,
      user: response.data.user as User,
      accessToken: response.data.accessToken,
    };
  }

  return {
    success: false,
    error: response.error?.message || "Login failed",
  };
}

/**
 * Login with Google
 * POST /api/auth/google
 */
export async function googleLogin(input: GoogleAuthInput): Promise<{
  success: boolean;
  user?: User;
  accessToken?: string;
  isNewUser?: boolean;
  error?: string;
}> {
  const response = await apiPost<LoginResponseData>("/api/auth/google", input);

  if (response.success && response.data) {
    // Save access token to localStorage
    saveAccessToken(response.data.accessToken);

    return {
      success: true,
      user: response.data.user as User,
      accessToken: response.data.accessToken,
      isNewUser: response.data.isNewUser,
    };
  }

  return {
    success: false,
    error: response.error?.message || "Google login failed",
  };
}

/**
 * Logout
 * POST /api/auth/logout
 * Clears access token from localStorage and refresh token cookie from server
 */
export async function logout(): Promise<{
  success: boolean;
  error?: string;
}> {
  const response = await apiPost("/api/auth/logout");

  // Always remove access token from localStorage, even if API call fails
  removeAccessToken();

  if (response.success) {
    return { success: true };
  }

  return {
    success: false,
    error: response.error?.message || "Logout failed",
  };
}

/**
 * Withdraw (Delete Account)
 * DELETE /api/auth/withdraw
 */
export async function withdraw(): Promise<{
  success: boolean;
  error?: string;
}> {
  const response = await apiDelete("/api/auth/withdraw");

  // Remove access token from localStorage
  removeAccessToken();

  if (response.success) {
    return { success: true };
  }

  return {
    success: false,
    error: response.error?.message || "Account deletion failed",
  };
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const response = await apiGet<{ user: User }>("/api/auth/me");

  if (response.success && response.data) {
    return {
      success: true,
      user: response.data.user,
    };
  }

  // If unauthorized, remove access token
  if (response.error?.code === "NO_ACCESS_TOKEN" ||
      response.error?.code === "TOKEN_EXPIRED" ||
      response.error?.code === "REFRESH_TOKEN_INVALID" ||
      response.error?.code === "REFRESH_TOKEN_EXPIRED") {
    removeAccessToken();
  }

  return {
    success: false,
    error: response.error?.message || "Failed to get user info",
  };
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 * Note: This is usually handled automatically by the API client
 * when X-New-Access-Token header is present
 */
export async function refreshAccessToken(): Promise<{
  success: boolean;
  accessToken?: string;
  error?: string;
}> {
  const response = await apiPost<{ accessToken: string }>("/api/auth/refresh");

  if (response.success && response.data) {
    saveAccessToken(response.data.accessToken);
    return {
      success: true,
      accessToken: response.data.accessToken,
    };
  }

  return {
    success: false,
    error: response.error?.message || "Token refresh failed",
  };
}
