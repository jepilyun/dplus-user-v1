"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10분 (밀리초)

interface PageState<T = unknown> {
  scrollY: number;
  timestamp: number;
  data?: T;
  dataVersion?: string;   // ✅ 추가: 데이터 버전 관리
}

interface ScrollRestorationContextType {
  savePage: <T = unknown>(key: string, data?: T, version?: string) => void;  // ✅ version 추가
  restorePage: <T = unknown>(key: string, currentVersion?: string) => T | null;  // ✅ currentVersion 추가
  clearPage: (key: string) => void;
}

const ScrollRestorationContext = createContext<ScrollRestorationContextType | null>(null);

export function ScrollRestorationProvider({ children }: { children: ReactNode }) {
  const pageStates = useRef<Map<string, PageState>>(new Map());

  /**
   * 페이지 상태 저장
   * @param key - 페이지 식별자
   * @param data - 저장할 커스텀 데이터
   * @param version - 데이터 버전 (예: 첫 이벤트의 created_at)
   */
  const savePage = <T = unknown>(key: string, data?: T, version?: string) => {
    if (typeof window === "undefined") return;
    
    let existingState = pageStates.current.get(key);
    
    if (!existingState) {
      try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
          existingState = JSON.parse(saved) as PageState<T>;
        }
      } catch (error) {
        console.warn("sessionStorage 로드 실패:", error);
      }
    }
    
    const state: PageState<T> = {
      scrollY: window.scrollY,
      timestamp: existingState?.timestamp ?? Date.now(),
      data,
      dataVersion: version,  // ✅ 버전 저장
    };
    
    console.log(`[Save] 페이지 상태 저장 - ${key}:`, {
      scrollY: state.scrollY,
      dataVersion: version,
      hadExisting: !!existingState,
      ageInSeconds: existingState ? Math.floor((Date.now() - state.timestamp) / 1000) : 0,
    });
    
    pageStates.current.set(key, state);
    
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn("sessionStorage 저장 실패:", error);
    }
  };

  /**
   * 페이지 상태 복원
   * @param key - 페이지 식별자
   * @param currentVersion - 현재 데이터 버전 (비교용)
   * @returns 저장된 커스텀 데이터 (만료되었거나 버전 불일치 시 null)
   */
  const restorePage = <T = unknown>(key: string, currentVersion?: string): T | null => {
    let state = pageStates.current.get(key);
    
    if (!state && typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
          state = JSON.parse(saved) as PageState<T>;
          console.log(`[Restore] sessionStorage에서 상태 로드: ${key}`);
        }
      } catch (error) {
        console.warn("sessionStorage 복원 실패:", error);
      }
    }
    
    if (!state) {
      console.log(`[Restore] 저장된 상태 없음: ${key}`);
      return null;
    }

    // ✅ 버전 체크 완화 (2시간 블록이 달라도 캐시 만료 시간 내면 복원)
    if (currentVersion && state.dataVersion && state.dataVersion !== currentVersion) {
      console.log(`[Restore] ⚠️ 데이터 버전 불일치 (저장: ${state.dataVersion}, 현재: ${currentVersion})`);
      
      // ✅ 하지만 캐시 만료 전이면 복원 허용
      const now = Date.now();
      const age = now - state.timestamp;
      
      if (age > CACHE_EXPIRY_TIME) {
        console.log(`[Restore] ❌ 버전 불일치 + 캐시 만료, 복원 중단`);
        clearPage(key);
        return null;
      }
      
      console.log(`[Restore] ✅ 버전 불일치지만 캐시 유효, 복원 진행`);
    }

    // 캐시 만료 체크
    const now = Date.now();
    const age = now - state.timestamp;
    const ageInSeconds = Math.floor(age / 1000);
    
    console.log(`[Restore] 캐시 만료 체크 - ${key}:`, {
      timestamp: state.timestamp,
      age: ageInSeconds,
      isExpired: age > CACHE_EXPIRY_TIME,
      dataVersion: state.dataVersion,
    });

    if (age > CACHE_EXPIRY_TIME) {
      console.log(`[Restore] ❌ 데이터 만료됨 (${key}), age: ${ageInSeconds}초`);
      clearPage(key);
      return null;
    }

    console.log(`[Restore] ✅ 유효한 데이터 (${key}), age: ${ageInSeconds}초, 복원 중...`);

    // 스크롤 위치 복원
    if (typeof window !== "undefined") {
      const scrollToPosition = () => {
        window.scrollTo({
          top: state.scrollY,
          behavior: 'instant'
        });
      };

      scrollToPosition();
      setTimeout(scrollToPosition, 100);
      setTimeout(scrollToPosition, 300);
      
      console.log(`[Restore] 스크롤 위치로 이동 시도: ${state.scrollY}px`);
    }

    return state.data as T ?? null;
  };

  const clearPage = (key: string) => {
    pageStates.current.delete(key);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(key);
      console.log(`[Clear] 페이지 상태 삭제: ${key}`);
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

// ✅ 모든 페이지별 훅에 version 파라미터 추가
export function useCountryPageRestoration(countryCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `country-${countryCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useCategoryPageRestoration(categoryCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `category-${categoryCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useCityPageRestoration(cityCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `city-${cityCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useDatePageRestoration(date: string, countryCode?: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `date-${countryCode ? `${countryCode}-` : 'no-country-'}${date}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useFolderPageRestoration(folderCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `folder-${folderCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useGroupPageRestoration(groupCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `group-${groupCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useStagPageRestoration(stagCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `stag-${stagCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useTagPageRestoration(tagCode: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `tag-${tagCode}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function usePlacePageRestoration(placeId: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `folder-${placeId}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}

export function useTodayPageRestoration(countryCode?: string) {
  const { savePage, restorePage, clearPage } = useScrollRestoration();
  const key = `today-${countryCode ? `${countryCode}-` : 'no-country-'}`;
  
  return {
    save: <T = unknown>(data: T, version?: string) => savePage(key, data, version),
    restore: <T = unknown>(currentVersion?: string) => restorePage<T>(key, currentVersion),
    clear: () => clearPage(key),
  };
}