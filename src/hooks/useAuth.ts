"use client";

/**
 * useAuth Hook
 * Access authentication context from components
 */

import { useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import type { AuthContextValue } from "@/types/auth.types";

/**
 * useAuth hook to access authentication state and methods
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
