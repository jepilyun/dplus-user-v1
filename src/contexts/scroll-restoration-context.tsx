"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

interface PageState<T = unknown> {
  scrollY: number;
  timestamp: number;
  data?: T;
}

interface ScrollRestorationContextType {
  savePage: <T = unknown>(key: string, data?: T) => void;
  restorePage: <T = unknown>(key: string) => T | null;
  clearPage: (key: string) => void;
}

const ScrollRestorationContext = createContext<ScrollRestorationContextType | null>(null);

export function ScrollRestorationProvider({ children }: { children: ReactNode }) {
  const pageStates = useRef<Map<string, PageState>>(new Map());

  const savePage = <T = unknown>(key: string, data?: T) => {
    if (typeof window === "undefined") return;
    
    const state: PageState<T> = {
      scrollY: window.scrollY,
      timestamp: Date.now(),
      data,
    };
    
    // 메모리에 저장
    pageStates.current.set(key, state);
    
    // SessionStorage에도 저장
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save to sessionStorage:", error);
    }
  };

  const restorePage = <T = unknown>(key: string): (T & { timestamp?: number }) | null => {
    // 먼저 메모리에서 찾기
    let state = pageStates.current.get(key);
    
    // 메모리에 없으면 SessionStorage에서 찾기
    if (!state && typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
          state = JSON.parse(saved) as PageState<T>;
        }
      } catch (error) {
        console.warn("Failed to restore from sessionStorage:", error);
      }
    }
    
    if (!state) return null;

    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollTo(0, state.scrollY);
      }, 100);
    }

    // ✅ timestamp도 함께 반환
    return { ...state.data as T, timestamp: state.timestamp };
  };

  const clearPage = (key: string) => {
    pageStates.current.delete(key);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(key);
    }
  };

  return (
    <ScrollRestorationContext.Provider value={{ savePage, restorePage, clearPage }}>
      {children}
    </ScrollRestorationContext.Provider>
  );
}

export function useScrollRestoration() {
  const context = useContext(ScrollRestorationContext);
  if (!context) {
    throw new Error("useScrollRestoration must be used within ScrollRestorationProvider");
  }
  return context;
}

export function useCountryPageRestoration(countryCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `country-${countryCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useCategoryPageRestoration(categoryCode: string, countryCode?: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `category-${countryCode ? `${countryCode}-` : 'no-country-'}${categoryCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useCityPageRestoration(cityCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `city-${cityCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useDatePageRestoration(date: string, countryCode?: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `date-${countryCode ? `${countryCode}-` : 'no-country-'}${date}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useFolderPageRestoration(folderCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `folder-${folderCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useGroupPageRestoration(groupCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `group-${groupCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useStagPageRestoration(stagCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `stag-${stagCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useTagPageRestoration(tagCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `tag-${tagCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useTodayPageRestoration(countryCode?: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `today-${countryCode ? `${countryCode}-` : 'no-country-'}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}
