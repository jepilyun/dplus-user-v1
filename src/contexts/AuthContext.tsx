"use client";

/**
 * Auth Context
 * Global authentication state management with React Context
 */

import React, { createContext, useCallback, useEffect, useState } from "react";

import type { AuthContextValue, User } from "@/types/auth.types";
import * as authService from "@/services/auth.service";
import { hasAccessToken } from "@/lib/apiClient";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Check authentication status on mount
   */
  const checkAuth = useCallback(async () => {
    // Prevent duplicate calls
    if (isCheckingAuth && user !== null) {
      return;
    }

    // If no access token, user is not authenticated
    if (!hasAccessToken()) {
      setUser(null);
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(true);

    try {
      const result = await authService.getCurrentUser();

      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check auth:", error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isCheckingAuth, user]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Prevent duplicate calls
    if (isSubmitting) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.login({ email, password });

      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }

      console.error("Login failed:", result.error);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  /**
   * Login with Google
   */
  const googleLogin = useCallback(async (idToken: string): Promise<boolean> => {
    // Prevent duplicate calls
    if (isSubmitting) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.googleLogin({ idToken });

      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }

      console.error("Google login failed:", result.error);
      return false;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      // Prevent duplicate calls
      if (isSubmitting) {
        return false;
      }

      setIsSubmitting(true);

      try {
        const result = await authService.register({ email, password, name });

        if (result.success && result.user) {
          setUser(result.user);
          return true;
        }

        console.error("Registration failed:", result.error);
        return false;
      } catch (error) {
        console.error("Registration error:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting],
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    // Prevent duplicate calls
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  /**
   * Check auth on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading: isCheckingAuth || isSubmitting,
    isCheckingAuth,
    isSubmitting,
    login,
    googleLogin,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
