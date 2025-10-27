"use client";

import { reqGetTodayList } from "@/actions/action";
import { LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
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

// 최소 유효성 검사 (unknown 사용)
function isValidEvent(v: unknown): v is TEventCardForDateDetail {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.event_code === "string" &&
    typeof o.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(o.date as string)
  );
}

// ✅ 이벤트 + 섹션 정보를 함께 저장하는 타입
type EventWithSection = TEventCardForDateDetail & {
  section: { key: string; label: string; sub: string };
};

export default function CompTodayDetailPage({
  countryCode,
  langCode,
  fullLocale,
  // 🔹 (선택) 서버/상위에서 기본 TZ를 내려줄 수도 있게 prop 추가
  defaultTz = "Asia/Seoul",
}: {
  countryCode: string;
  langCode: string;
  fullLocale: string;
  defaultTz?: Tz;
}) {
  const router = useRouter();

  // 브라우저 TZ & 언어 감지
  const [tz, setTz] = useState<Tz>(defaultTz);
  const [lang, setLang] = useState<"en" | "ko">("en");

  useEffect(() => {
    setTz(detectBrowserTimeZone() || defaultTz);
    const browserLang = detectBrowserLanguage();
    setLang(browserLang === "ko" ? "ko" : "en");
  }, [defaultTz]);

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 섹션 정보를 포함한 이벤트 배열
  const [eventsWithSections, setEventsWithSections] = useState<EventWithSection[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ remount에도 유지되도록 ref 사용
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const requestIdRef = useRef(0);

  // ✅ 오늘 날짜를 ref로 고정 (컴포넌트 마운트 시점 기준)
  const nowYmdRef = useRef<string>("");

  useEffect(() => {
    nowYmdRef.current = todayYmdInTz(tz);
  }, [tz]);

  const fetchTodayList = async () => {
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
      const initItems = raw.filter(isValidEvent);

      // ✅ 중복 제거 + 섹션 계산을 한 번에
      const seen = seenEventCodesRef.current;
      const dedupedWithSections: EventWithSection[] = [];
      
      for (const it of initItems) {
        if (!seen.has(it.event_code)) {
          seen.add(it.event_code);
          // 섹션 정보를 이벤트와 함께 저장
          const section = getSectionForDate(it.date ?? "", nowYmdRef.current, tz, lang);
          dedupedWithSections.push({
            ...it,
            section,
          });
        }
      }

      setEventsWithSections(dedupedWithSections);
      setEventsStart(dedupedWithSections.length);
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
    if (eventsLoading) return;
    setEventsLoading(true);
    const reqId = ++requestIdRef.current;
    
    try {
      const res = await reqGetTodayList(countryCode, eventsStart, LIST_LIMIT.default);
      if (reqId !== requestIdRef.current) return;

      const fetchedItems = res?.dbResponse?.items;
      const newItems = (fetchedItems ?? []).filter(isValidEvent);

      // ✅ 새로운 페이지의 아이템도 섹션 계산 후 추가
      const seen = seenEventCodesRef.current;
      const dedupedWithSections: EventWithSection[] = [];
      
      for (const it of newItems) {
        if (!seen.has(it.event_code)) {
          seen.add(it.event_code);
          const section = getSectionForDate(it.date ?? "", nowYmdRef.current, tz, lang);
          dedupedWithSections.push({
            ...it,
            section,
          });
        }
      }

      setEventsWithSections((prev) => prev.concat(dedupedWithSections));
      setEventsStart((prev) => prev + dedupedWithSections.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      if (reqId === requestIdRef.current) setEventsLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    seenEventCodesRef.current = new Set();
    setEventsWithSections([]);
    setEventsStart(0);
    setEventsHasMore(false);

    (async () => {
      await fetchTodayList();
      if (!alive) return;
    })();

    return () => {
      alive = false;
      requestIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, tz, lang]); // ✅ tz, lang 변경 시에도 재로딩

  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 에러 처리
  if (error === "not-found") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {lang === "ko" ? "이벤트를 찾을 수 없습니다" : "No Events Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ko" 
              ? "오늘의 이벤트를 찾을 수 없습니다." 
              : "No events found for today."}
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
          <h2 className="text-2xl font-bold mb-4">
            {lang === "ko" ? "오류" : "ERROR"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ko"
              ? "이벤트를 불러오는데 실패했습니다. 다시 시도해주세요."
              : "Failed to load today's events. Please try again."}
          </p>
          <button
            onClick={() => fetchTodayList()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {lang === "ko" ? "재시도" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-center font-extrabold">
          <div className="text-3xl">
            {lang === "ko" ? "다가오는 일정" : "Upcoming"}
          </div>
        </div>
      </div>

      {eventsWithSections.length > 0 ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {(() => {
            let lastKey = "";
            const blocks: JSX.Element[] = [];

            // ✅ 이미 계산된 섹션 정보 사용 - 재계산 불필요!
            for (const item of eventsWithSections) {
              // 섹션이 바뀔 때만 헤더 추가
              if (item.section.key !== lastKey) {
                lastKey = item.section.key;

                blocks.push(
                  <div key={`sec-${item.section.key}`} className="sticky top-[80px]">
                    <div className="px-4 lg:px-8 py-3 text-gray-800 bg-gray-100 rounded-sm border border-gray-200">
                      <div className="text-sm sm:text-md md:text-lg uppercase tracking-wide text-gray-600 font-semibold">
                        {item.section.label}{" "}
                        <span className="text-gray-400">{item.section.sub}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              blocks.push(
                <CompCommonDdayItemForDate
                  key={item.event_code}
                  event={item}
                  fullLocale={fullLocale}
                />
              );
            }

            return blocks;
          })()}

          {eventsHasMore && (
            <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          {lang === "ko" 
            ? "이 날짜에 해당하는 이벤트가 없습니다." 
            : "No events found for this date."}
        </div>
      )}
    </div>
  );
}

