"use client";

import { reqGetTodayList } from "@/actions/action";
import { DplusGetListDataResponse, LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";
import {
  todayYmdInTz,
  getSectionForDate,
  detectBrowserTimeZone,
  Tz,
  detectBrowserLanguage,
} from "@/utils/date-ymd";
import { useTodayPageRestoration } from "@/contexts/scroll-restoration-context";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayItemCardForDate from "../comp-common/comp-common-dday-item-card-for-date";

// 최소 유효성 검사
function isValidEvent(v: unknown): v is TEventCardForDateDetail {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.event_code === "string" &&
    typeof o.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(o.date as string)
  );
}

// ✅ 섹션 정보를 함께 붙인 렌더용 타입
type EventWithSection = TEventCardForDateDetail & {
  section: { key: string; label: string; sub: string };
};

// ✅ 저장/복원용 상태 (섹션은 복원 시 재계산하므로 raw만 저장)
type TodayPageState = {
  rawEvents: TEventCardForDateDetail[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
  tz: Tz;
  lang: "en" | "ko";
};

export default function CompTodayDetailPage({
  countryCode,
  langCode,
  fullLocale,
  initialData,
  defaultTz = "Asia/Seoul",
}: {
  countryCode: string;
  langCode: string;
  fullLocale: string;
  initialData: DplusGetListDataResponse<TEventCardForDateDetail> | null;
  defaultTz?: Tz;
}) {
  const router = useRouter();
  const { save, restore } = useTodayPageRestoration(countryCode);

  // 브라우저 TZ & 언어 감지
  const [tz, setTz] = useState<Tz>(defaultTz);
  const [lang, setLang] = useState<"en" | "ko">("en");

  useEffect(() => {
    setTz(detectBrowserTimeZone() || defaultTz);
    const browserLang = detectBrowserLanguage();
    setLang(browserLang === "ko" ? "ko" : "en");
  }, [defaultTz]);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  // ✅ 데이터 버전: 2시간 블록
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  // ✅ 복원/중복 제어
  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.items?.map(item => item.event_code).filter(Boolean) ?? []
    )
  );
  const requestIdRef = useRef(0);
  const nowYmdRef = useRef<string>("");
  const restorationAttemptedRef = useRef(false);

  // ✅ 렌더용(섹션 포함) 상태
  const [eventsWithSections, setEventsWithSections] = useState<EventWithSection[]>(
    initialData?.items?.map(item => ({
      ...item,
      section: getSectionForDate(item.date ?? "", nowYmdRef.current, tz, lang)
    })) ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    nowYmdRef.current = todayYmdInTz(tz);
  }, [tz]);

  // ✅ 섹션 부착 헬퍼 (복원/패치 공통)
  const attachSections = (items: TEventCardForDateDetail[]): EventWithSection[] => {
    return items.map((it) => ({
      ...it,
      section: getSectionForDate(it.date ?? "", nowYmdRef.current, tz, lang),
    }));
  };

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredRawEvents?: TEventCardForDateDetail[]) => {
    if (initialData && !restoredRawEvents) {
      setLoading(false);
      return;
    }

    const reqId = ++requestIdRef.current;
    try {
      const res = await reqGetTodayList(countryCode, 0, LIST_LIMIT.default);
      if (reqId !== requestIdRef.current) return;
  
      if (!res?.dbResponse || !res?.dbResponse?.items) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      const raw: unknown[] = res?.dbResponse?.items ?? [];
      const serverEvents = raw.filter(isValidEvent);
      
      // ✅ 새 데이터 버전 업데이트
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[Today Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
  
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredRawEvents && restoredRawEvents.length > LIST_LIMIT.default) {
        console.log('[Today Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[Today Merge] Server events:', serverEvents.length);
        console.log('[Today Merge] Restored total:', restoredRawEvents.length);
        
        const serverCodes = new Set(serverEvents.map(item => item.event_code));
        
        const additionalEvents = restoredRawEvents
          .slice(LIST_LIMIT.default)
          .filter(item => !serverCodes.has(item.event_code));
        
        console.log('[Today Merge] Additional events from restore:', additionalEvents.length);
        
        // 오늘 이후 이벤트만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          const eventDate = new Date(item.date ?? "");
          return eventDate.getTime() >= todayTimestamp;
        });
        
        console.log('[Today Merge] Future events after filter:', futureEvents.length);
        
        // 중복 제거 후 병합
        seenEventCodesRef.current.clear();
        const merged: TEventCardForDateDetail[] = [];
        
        for (const it of serverEvents) {
          if (!seenEventCodesRef.current.has(it.event_code)) {
            seenEventCodesRef.current.add(it.event_code);
            merged.push(it);
          }
        }
        
        for (const it of futureEvents) {
          if (!seenEventCodesRef.current.has(it.event_code)) {
            seenEventCodesRef.current.add(it.event_code);
            merged.push(it);
          }
        }
        
        console.log('[Today Merge] ✅ Final merged:', {
          server: serverEvents.length,
          additional: futureEvents.length,
          total: merged.length
        });
        
        const finalWithSections = attachSections(merged);
        setEventsWithSections(finalWithSections);
        setEventsStart(finalWithSections.length);
      } else {
        console.log('[Today Merge] ✅ Using server data only');
        seenEventCodesRef.current.clear();
        const deduped: TEventCardForDateDetail[] = [];
        
        for (const it of serverEvents) {
          if (!seenEventCodesRef.current.has(it.event_code)) {
            seenEventCodesRef.current.add(it.event_code);
            deduped.push(it);
          }
        }
  
        const nextWithSections = attachSections(deduped);
        setEventsWithSections(nextWithSections);
        setEventsStart(nextWithSections.length);
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
      setError(null);
    } catch (error) {
      console.error("[today] fetch error", error);
      setError("network");
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };
  
  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);
    const reqId = ++requestIdRef.current;

    try {
      const res = await reqGetTodayList(countryCode, eventsStart, LIST_LIMIT.default);
      if (reqId !== requestIdRef.current) return;

      const newRaw = (res?.dbResponse?.items ?? []).filter(isValidEvent);

      const toAppend: TEventCardForDateDetail[] = [];
      for (const it of newRaw) {
        if (!seenEventCodesRef.current.has(it.event_code)) {
          seenEventCodesRef.current.add(it.event_code);
          toAppend.push(it);
        }
      }

      if (toAppend.length) {
        const withSections = attachSections(toAppend);
        setEventsWithSections((prev) => prev.concat(withSections));
        setEventsStart((prev) => prev + withSections.length);
      }
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      if (reqId === requestIdRef.current) setEventsLoading(false);
    }
  };

  // ✅ 초기 마운트 시 복원 시도
  useEffect(() => {
    if (restorationAttemptedRef.current) return;
    restorationAttemptedRef.current = true;

    console.log('[Today Mount] 🚀 Component mounted, attempting restore...');
    console.log('[Today Mount] Current data version:', dataVersion);
    
    const saved = restore<TodayPageState>(dataVersion);
    
    console.log('[Today Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.rawEvents?.length || 0,
    });
    
    if (saved && saved.rawEvents && saved.rawEvents.length > 0) {
      console.log('[Today Mount] ✅ Restoring state with', saved.rawEvents.length, 'events');
      
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      
      setEventsWithSections(attachSections(saved.rawEvents));
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
  
      if (saved.tz) setTz(saved.tz);
      if (saved.lang) setLang(saved.lang);
      setLoading(false);
      
      // ✅ 더보기를 했던 경우에만 백그라운드 병합
      if (saved.rawEvents.length > LIST_LIMIT.default) {
        console.log('[Today Mount] 📡 Fetching server data for merge...');
        fetchAndMergeData(saved.rawEvents);
      }
    } else {
      console.log('[Today Mount] ⚠️ No valid saved data found');
      if (!initialData) {
        fetchAndMergeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // ✅ 클릭 이벤트 감지하여 저장
  useEffect(() => {
    const saveCurrentState = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        console.log('[Today Save] ⚠️ 스크롤이 0이므로 저장 건너뜀');
        return;
      }
      
      console.log('[Today Save] 💾 현재 상태 저장:', {
        scrollY: currentScrollY,
        eventsCount: eventsWithSections.length,
        dataVersion,
      });

      // 저장은 raw 기준으로(섹션은 복원 시 재계산)
      const rawEvents: TEventCardForDateDetail[] = eventsWithSections.map((it) => {
        const { section, ...rest } = it;
        return rest;
      });

      const state: TodayPageState = {
        rawEvents,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
        tz,
        lang,
      };

      save<TodayPageState>(state, dataVersion);
    };

    // ✅ 모든 네비게이션 요소 클릭 감지
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const eventCard = target.closest('[data-event-code]');
      const link = target.closest('a');
      const button = target.closest('button, [role="button"]');
      
      if (eventCard || link || button) {
        if (link) {
          const href = link.getAttribute('href') || '';
          if (link.getAttribute('target') === '_blank' || href.startsWith('mailto:')) {
            return;
          }
        }
        
        console.log('[Today Click] 🎯 네비게이션 요소 클릭 감지, 저장 실행');
        saveCurrentState();
      }
    };

    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [eventsWithSections, eventsStart, eventsHasMore, tz, lang, dataVersion, save]);

  // ✅ 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) return;
      
      const rawEvents: TEventCardForDateDetail[] = eventsWithSections.map((it) => {
        const { section, ...rest } = it;
        return rest;
      });
      
      save<TodayPageState>({
        rawEvents,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
        tz,
        lang,
      }, dataVersion);
    };

    window.addEventListener("beforeunload", persist);
    
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onVisibility);
    
    return () => {
      window.removeEventListener("beforeunload", persist);
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [eventsWithSections, eventsStart, eventsHasMore, tz, lang, dataVersion, save]);

  // ✅ TZ/Lang이 변하면 섹션만 재계산하여 화면 업데이트
  useEffect(() => {
    if (!eventsWithSections.length) return;
    setEventsWithSections((prev) =>
      attachSections(prev.map(({ section, ...raw }) => raw))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tz, lang]);

  // ===== 렌더 =====

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {lang === "ko" ? "이벤트를 찾을 수 없습니다" : "No Events Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ko" ? "오늘의 이벤트를 찾을 수 없습니다." : "No events found for today."}
          </p>
          <button
            onClick={() => router.push(`/${langCode}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {lang === "ko" ? "홈으로 이동" : "Go to Home"}
          </button>
        </div>
      </div>
    );
  }

  if (error === "network") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{lang === "ko" ? "오류" : "ERROR"}</h2>
          <p className="text-gray-600 mb-6">
            {lang === "ko"
              ? "이벤트를 불러오는데 실패했습니다. 다시 시도해주세요."
              : "Failed to load today's events. Please try again."}
          </p>
          <button
            onClick={() => fetchAndMergeData()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {lang === "ko" ? "재시도" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="text-center font-extrabold">
        <div className="text-3xl">{lang === "ko" ? "다가오는 일정" : "Upcoming"}</div>
      </div>

      {eventsWithSections.length > 0 ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 gap-4 md:px-4 lg:px-6">
          {(() => {
            let lastKey = "";
            const blocks: JSX.Element[] = [];

            for (const item of eventsWithSections) {
              if (item.section.key !== lastKey) {
                lastKey = item.section.key;
                blocks.push(
                  <div key={`sec-${item.section.key}`}>
                    <div className="px-4 lg:px-8 pt-12 pb-4 text-gray-800 rounded-sm border-gray-200">
                      <div className="text-sm sm:text-md md:text-lg uppercase tracking-wide text-gray-600 font-semibold">
                        {item.section.label}{" "}
                        <span className="text-gray-400">{item.section.sub}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              blocks.push(
                <div key={`event-${item.event_code}`}>
                  {/* 모바일: CompCommonDdayItemCardForDate */}
                  <div className="md:hidden">
                    <CompCommonDdayItemCardForDate event={item} fullLocale={fullLocale} />
                  </div>

                  {/* 데스크톱: CompCommonDdayItemForDate */}
                  <div className="hidden md:block">
                    <CompCommonDdayItemForDate event={item} fullLocale={fullLocale} />
                  </div>
                </div>
              );
            }

            return blocks;
          })()}

          {eventsHasMore && (
            <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          {lang === "ko" ? "이 날짜에 해당하는 이벤트가 없습니다." : "No events found for this date."}
        </div>
      )}
    </div>
  );
}