"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5분 (밀리초)
// const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10분
// const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30분

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
    
    pageStates.current.set(key, state);
    
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save to sessionStorage:", error);
    }
  };

  const restorePage = <T = unknown>(key: string): T | null => {
    let state = pageStates.current.get(key);
    
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

    // ✅ 수정: 5분 지났으면 무조건 null 반환 (데이터 무효화)
    if (Date.now() - state.timestamp > CACHE_EXPIRY_TIME) {
      console.log(`[Restore] Data expired (${key}), clearing and fetching fresh data`);
      clearPage(key); // sessionStorage에서 삭제
      return null; // null 반환 -> 서버에서 새로 받아옴
    }

    // 스크롤 위치 복원 (데이터가 유효한 경우에만)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollTo(0, state.scrollY);
      }, 100);
    }

    return state.data as T ?? null;
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

// ... 나머지 export 함수들은 동일
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
