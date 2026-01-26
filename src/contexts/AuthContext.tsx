"use client";

/**
 * Auth Context
 * Global authentication state management with React Context
 */

import React, { createContext, useCallback, useEffect, useState } from "react";

import type { AuthContextValue, User } from "@/types/auth.types";
import * as authService from "@/services/auth.service";
import { hasAccessToken } from "@/utils/token.utils";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status on mount
   */
  const checkAuth = useCallback(async () => {
    // If no access token, user is not authenticated
    if (!hasAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

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
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

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
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with Google
   */
  const googleLogin = useCallback(async (idToken: string): Promise<boolean> => {
    setIsLoading(true);

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
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      setIsLoading(true);

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
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Check auth on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
