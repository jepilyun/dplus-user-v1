/**
 * Auth Types
 * Type definitions for authentication system matching backend API
 */

/**
 * Device Type - matches backend DeviceType
 */
export type DeviceType = "web" | "mobile_app";

/**
 * User Role
 */
export type UserRole = "user" | "premium";

/**
 * User Interface
 */
export interface User {
  user_id: string;
  email: string | null;
  name?: string | null;
  is_active: boolean;
  role?: UserRole;
  google_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Login Input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register Input
 */
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

/**
 * Google Auth Input
 */
export interface GoogleAuthInput {
  idToken: string;
}

/**
 * Login Response Data
 */
export interface LoginResponseData {
  user: {
    user_id: string;
    email: string;
    name?: string;
  };
  accessToken: string;
  isNewUser?: boolean; // Google 로그인 시
}

/**
 * Auth Response
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: LoginResponseData;
}

/**
 * User Token Payload (from JWT)
 */
export interface UserTokenPayload {
  user_id: string;
  email: string | null;
  name?: string | null;
  is_active: boolean;
  deviceType: DeviceType;
  iat?: number;
  exp?: number;
}

/**
 * Auth Context State
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Combined loading state (isCheckingAuth || isSubmitting)
  isCheckingAuth: boolean; // Loading state for checkAuth
  isSubmitting: boolean; // Loading state for login/register/logout actions
}

/**
 * Auth Context Value
 */
export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
