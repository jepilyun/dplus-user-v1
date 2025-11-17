"use client";

import { createContext, useContext } from "react";

const NavigationSaveContext = createContext<(() => void) | null>(null);

export function useNavigationSave() {
  return useContext(NavigationSaveContext);
}

export { NavigationSaveContext };