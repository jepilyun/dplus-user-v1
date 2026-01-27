"use client";

import { reqGetTodayList } from "@/api/req-today";
import { DplusGetListDataResponse, LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import React, { useEffect, useRef, useState } from "react";
import { CompLoadMore } from "../button/comp-load-more";
import CompCommonDdayItemForDate from "../dday-card/comp-common-dday-item-for-date";
import {
  todayYmdInTz,
  getSectionForDate,
  detectBrowserTimeZone,
  Tz,
  detectBrowserLanguage,
} from "@/utils/date-ymd";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayCardForDate from "../dday-card/comp-common-dday-card-for-date";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

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

  // ===== 렌더 =====

  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Today Not Found"
        message="해당 오늘의 이벤트를 찾을 수 없습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load today's events. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-center font-extrabold">
        <div className="text-3xl">{lang === "ko" ? "다가오는 일정" : "Upcoming"}</div>
      </div>

      {eventsWithSections.length > 0 ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 gap-4 md:px-4 lg:px-6">
          {(() => {
            let lastKey = "";
            const blocks: React.ReactElement[] = [];

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
                    <CompCommonDdayCardForDate 
                      event={item} 
                      fullLocale={fullLocale} 
                      langCode={langCode}
                    />
                  </div>

                  {/* 데스크톱: CompCommonDdayItemForDate */}
                  <div className="hidden md:block">
                    <CompCommonDdayItemForDate event={item} fullLocale={fullLocale} langCode={langCode} />
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