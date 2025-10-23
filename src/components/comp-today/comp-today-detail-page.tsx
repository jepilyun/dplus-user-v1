"use client";

import { reqGetTodayList } from "@/actions/action";
import { TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";

/** ---------- KST 문자열 유틸 (날짜 비교는 문자열만) ---------- **/
const KST_TZ = "Asia/Seoul";
const pad2 = (n: number) => String(n).padStart(2, "0");

function ymdFromDateKST(d: Date): string {
  const kst = new Date(d.toLocaleString("en-US", { timeZone: KST_TZ }));
  return `${kst.getFullYear()}-${pad2(kst.getMonth() + 1)}-${pad2(kst.getDate())}`;
}
function todayKstYmd(): string {
  return ymdFromDateKST(new Date());
}
function getIsoWeekBoundsYmd(nowYmd: string) {
  const base = new Date(`${nowYmd}T12:00:00+09:00`);
  const jsDay = base.getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const start = new Date(base);
  start.setDate(base.getDate() - (isoDay - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startYmd: ymdFromDateKST(start), endYmd: ymdFromDateKST(end) };
}
function getMonthBoundsYmd(nowYmd: string) {
  const base = new Date(`${nowYmd}T12:00:00+09:00`);
  const y = base.getFullYear();
  const m = base.getMonth();
  const monthStart = new Date(`${y}-${pad2(m + 1)}-01T00:00:00+09:00`);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthStart.getMonth() + 1);
  monthEnd.setDate(0);
  return { startYmd: ymdFromDateKST(monthStart), endYmd: ymdFromDateKST(monthEnd) };
}
function inRangeYmd(targetYmd: string, startYmd: string, endYmd: string) {
  return targetYmd >= startYmd && targetYmd <= endYmd;
}
function fmtShortRange(startYmd: string, endYmd: string) {
  const s = new Date(`${startYmd}T00:00:00+09:00`);
  const e = new Date(`${endYmd}T00:00:00+09:00`);
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const left = `${m[s.getMonth()]} ${s.getDate()}`;
  const right = s.getMonth() === e.getMonth() ? `${e.getDate()}` : `${m[e.getMonth()]} ${e.getDate()}`;
  return `${left}–${right}`;
}
function getSectionForDate(ymd: string, nowYmd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return { key: "later", label: "LATER", sub: "" };

  const { startYmd: thisWStart, endYmd: thisWEnd } = getIsoWeekBoundsYmd(nowYmd);
  const nextWeekBase = new Date(`${thisWStart}T12:00:00+09:00`);
  nextWeekBase.setDate(nextWeekBase.getDate() + 7);
  const { startYmd: nextWStart, endYmd: nextWEnd } = getIsoWeekBoundsYmd(ymdFromDateKST(nextWeekBase));

  if (inRangeYmd(ymd, thisWStart, thisWEnd)) {
    return { key: "this-week", label: "THIS WEEK", sub: `(${fmtShortRange(thisWStart, thisWEnd)})` };
  }
  if (inRangeYmd(ymd, nextWStart, nextWEnd)) {
    return { key: "next-week", label: "NEXT WEEK", sub: `(${fmtShortRange(nextWStart, nextWEnd)})` };
  }

  const { startYmd: thisMStart, endYmd: thisMEnd } = getMonthBoundsYmd(nowYmd);
  const nextMonthBase = new Date(`${thisMStart}T12:00:00+09:00`);
  nextMonthBase.setMonth(nextMonthBase.getMonth() + 1);
  const { startYmd: nextMStart, endYmd: nextMEnd } = getMonthBoundsYmd(ymdFromDateKST(nextMonthBase));

  if (inRangeYmd(ymd, thisMStart, thisMEnd)) {
    return {
      key: "this-month",
      label: "THIS MONTH",
      sub: `(${new Date(`${thisMStart}T00:00:00+09:00`).toLocaleString("en-US",{ month:"short" }).toUpperCase()})`,
    };
  }
  if (inRangeYmd(ymd, nextMStart, nextMEnd)) {
    return {
      key: "next-month",
      label: "NEXT MONTH",
      sub: `(${new Date(`${nextMStart}T00:00:00+09:00`).toLocaleString("en-US",{ month:"short" }).toUpperCase()})`,
    };
  }

  const thisYear = nowYmd.slice(0, 4);
  const y = ymd.slice(0, 4);
  if (y === thisYear) return { key: "this-year", label: "THIS YEAR", sub: `(${thisYear})` };
  if (+y === +thisYear + 1) return { key: "next-year", label: "NEXT YEAR", sub: `(${+thisYear + 1})` };

  return { key: "later", label: "LATER", sub: "" };
}

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

export default function CompTodayDetailPage({
  countryCode,
  langCode,
  fullLocale,
}: {
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState<TEventCardForDateDetail[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ remount에도 유지되도록 ref 사용
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const requestIdRef = useRef(0);

  const EVENTS_LIMIT = 10;

  const fetchTodayList = async () => {
    const reqId = ++requestIdRef.current; // 최신 요청 id
    try {
      const res = await reqGetTodayList(countryCode, 0, EVENTS_LIMIT);
      // 최신 요청만 반영
      if (reqId !== requestIdRef.current) return;

      // 응답은 있지만 데이터가 없는 경우 (404)
      if (!res?.dbResponse || !res?.dbResponse?.items) {
        setError('not-found');
        setLoading(false);
        return;
      }

      const raw: unknown[] = res?.dbResponse?.items ?? [];
      const initItems = raw.filter(isValidEvent);

      // 중복 제거
      const seen = seenEventCodesRef.current;
      const deduped: TEventCardForDateDetail[] = [];
      for (const it of initItems) {
        if (!seen.has(it.event_code)) {
          seen.add(it.event_code);
          deduped.push(it);
        }
      }

      setEvents(deduped);
      setEventsStart(deduped.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
      setError(null);
    } catch (error) {
      // 네트워크 에러나 서버 에러
      console.error('[today] fetch error', error);
      setError('network');
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
      const res = await reqGetTodayList(countryCode, eventsStart, EVENTS_LIMIT);
      if (reqId !== requestIdRef.current) return;

      const raw: unknown[] = res?.dbResponse?.items ?? [];
      const pageItems = raw.filter(isValidEvent);

      const seen = seenEventCodesRef.current;
      const deduped: TEventCardForDateDetail[] = [];
      for (const it of pageItems) {
        if (!seen.has(it.event_code)) {
          seen.add(it.event_code);
          deduped.push(it);
        }
      }

      setEvents((prev) => prev.concat(deduped));
      setEventsStart((prev) => prev + deduped.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      if (reqId === requestIdRef.current) setEventsLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    // countryCode 바뀌면 목록/셋 초기화
    seenEventCodesRef.current = new Set();
    setEvents([]);
    setEventsStart(0);
    setEventsHasMore(false);

    (async () => {
      await fetchTodayList();
      if (!alive) return;
    })();

    return () => {
      alive = false;
      // 이후 들어오는 응답은 무시되도록 id 증가
      requestIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  const nowYmd = todayKstYmd();

  // ✅ 섹션별 그룹화 - 메모이제이션
  const groupedEvents = useMemo(() => {
    console.log('🔄 Grouping events:', events.length); // 재계산 횟수 확인용
    
    const groups: Array<{
      section: { key: string; label: string; sub: string };
      items: TEventCardForDateDetail[];
    }> = [];

    let currentSection: { key: string; label: string; sub: string } | null = null;
    let currentItems: TEventCardForDateDetail[] = [];

    for (const item of events) {
      const section = getSectionForDate(item.date ?? "", nowYmd);
      
      if (!currentSection || section.key !== currentSection.key) {
        if (currentSection && currentItems.length > 0) {
          groups.push({ section: currentSection, items: [...currentItems] });
        }
        currentSection = section;
        currentItems = [item];
      } else {
        currentItems.push(item);
      }
    }

    if (currentSection && currentItems.length > 0) {
      groups.push({ section: currentSection, items: currentItems });
    }

    return groups;
  }, [events, nowYmd]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 데이터를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Events Found</h2>
          <p className="text-gray-600 mb-6">
            오늘의 이벤트를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => router.push(`/${langCode}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            홈 화면으로 이동
          </button>
        </div>
      </div>
    );
  }

  // 네트워크 에러 - 재시도 옵션 제공
  if (error === 'network') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ERROR</h2>
          <p className="text-gray-600 mb-6">
            Failed to load today&apos;s events. Please try again.
          </p>
          <button
            onClick={() => fetchTodayList()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-center font-extrabold">
          <div className="text-3xl">Upcoming Events</div>
        </div>
      </div>

      {groupedEvents.length > 0 ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {(() => {
            let lastKey = "";
            const blocks: JSX.Element[] = [];

            for (const item of events) {
              const section = getSectionForDate(item.date ?? "", nowYmd);
              if (section.key !== lastKey) {
                lastKey = section.key;

                blocks.push(
                  <div 
                    key={`sec-${section.key}`}
                    className="sticky top-[80px]"
                  >
                    <div
                      className="
                        px-4 lg:px-8 py-3
                        text-gray-800 bg-gray-100 rounded-sm border border-gray-200
                      "
                    >
                      <div className="text-sm sm:text-md md:text-lg uppercase tracking-wide text-gray-600 font-semibold">
                        {section.label} <span className="text-gray-400">{section.sub}</span>
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
          No events found for this date.
        </div>
      )}
    </div>
  );
}
