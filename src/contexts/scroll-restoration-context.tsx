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

  const restorePage = <T = unknown>(key: string): T | null => {
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

    // 5분 이상 지난 데이터는 무시
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (Date.now() - state.timestamp > FIVE_MINUTES) {
      pageStates.current.delete(key);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(key);
      }
      return null;
    }

    // 스크롤 복원
    if (typeof window !== "undefined") {
      // 약간의 지연을 두고 스크롤 (DOM 렌더링 대기)
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

export function useScrollRestoration() {
  const context = useContext(ScrollRestorationContext);
  if (!context) {
    throw new Error("useScrollRestoration must be used within ScrollRestorationProvider");
  }
  return context;
}

// 각 페이지 타입별 커스텀 훅
export function useCityPageRestoration(cityCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `city-${cityCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useCategoryPageRestoration(cityCode: string, categoryCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `category-${cityCode}-${categoryCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useStreetPageRestoration(cityCode: string, streetCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `street-${cityCode}-${streetCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useStagPageRestoration(cityCode: string, stagCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `stag-${cityCode}-${stagCode}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}

export function useTagPageRestoration(cityCode: string, tagValue: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `tag-${cityCode}-${tagValue}`;
  
  return {
    save: <T = unknown>(data: T) => savePage(key, data),
    restore: <T = unknown>() => restorePage<T>(key),
    clear: () => clearPage(key),
  };
}