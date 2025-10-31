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
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

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
  defaultTz = "Asia/Seoul",
}: {
  countryCode: string;
  langCode: string;
  fullLocale: string;
  defaultTz?: Tz;
}) {
  const router = useRouter();

  // ✅ 스크롤/상태 복원 훅
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:today:${countryCode}`; // 국가별 분리 저장

  // 브라우저 TZ & 언어 감지
  const [tz, setTz] = useState<Tz>(defaultTz);
  const [lang, setLang] = useState<"en" | "ko">("en");

  useEffect(() => {
    setTz(detectBrowserTimeZone() || defaultTz);
    const browserLang = detectBrowserLanguage();
    setLang(browserLang === "ko" ? "ko" : "en");
  }, [defaultTz]);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 렌더용(섹션 포함) 상태
  const [eventsWithSections, setEventsWithSections] = useState<EventWithSection[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 복원/중복 제어
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const requestIdRef = useRef(0);
  const nowYmdRef = useRef<string>("");
  const hydratedFromRestoreRef = useRef(false); // 복원 여부

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

      // 중복 제거
      seenEventCodesRef.current.clear();
      const deduped: TEventCardForDateDetail[] = [];
      for (const it of initItems) {
        if (!seenEventCodesRef.current.has(it.event_code)) {
          seenEventCodesRef.current.add(it.event_code);
          deduped.push(it);
        }
      }

      // ✅ 복원으로 이미 채워졌으면 섹션만 최신 TZ/Lang으로 재계산해서 교체,
      // 아니면 새로 계산
      const nextWithSections = attachSections(deduped);
      setEventsWithSections(nextWithSections);
      setEventsStart(nextWithSections.length);
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

  // ✅ ① 마운트 시 상태 복원 → 있으면 즉시 렌더
  useEffect(() => {
    const saved = restorePage<TodayPageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      // TZ/Lang이 바뀌었을 수 있으므로 섹션은 현 TZ/Lang으로 재계산
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setEventsWithSections(attachSections(saved.rawEvents ?? []));
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));

      // 복원된 TZ/Lang이 있으면 우선 적용(브라우저 감지 전 임시 일관성)
      if (saved.tz) setTz(saved.tz);
      if (saved.lang) setLang(saved.lang);
      setLoading(false);
    }
    // 서버 최신화(복원 여부와 무관)
    fetchTodayList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // ✅ ② 라우팅 직전/링크 클릭 직전 저장(pointerdown capture)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      // 저장은 raw 기준으로(섹션은 복원 시 재계산)
      const rawEvents: TEventCardForDateDetail[] = eventsWithSections.map((it) => {
        const { section, ...rest } = it;
        return rest;
      });

      savePage<TodayPageState>(STATE_KEY, {
        rawEvents,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
        tz,
        lang,
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [eventsWithSections, eventsStart, eventsHasMore, tz, lang, savePage]);

  // ✅ ③ 새로고침/탭 숨김 시 상태 저장
  useEffect(() => {
    const persist = () => {
      const rawEvents: TEventCardForDateDetail[] = eventsWithSections.map((it) => {
        const { section, ...rest } = it;
        return rest;
      });
      savePage<TodayPageState>(STATE_KEY, {
        rawEvents,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
        tz,
        lang,
      });
    };

    window.addEventListener("beforeunload", persist);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [eventsWithSections, eventsStart, eventsHasMore, tz, lang, savePage]);

  // ✅ ④ TZ/Lang이 변하면 섹션만 재계산하여 화면 업데이트(데이터 재요청 불필요)
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
      <div className="text-center font-extrabold">
        <div className="text-3xl">{lang === "ko" ? "다가오는 일정" : "Upcoming"}</div>
      </div>

      {eventsWithSections.length > 0 ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {(() => {
            let lastKey = "";
            const blocks: JSX.Element[] = [];

            for (const item of eventsWithSections) {
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
          {lang === "ko" ? "이 날짜에 해당하는 이벤트가 없습니다." : "No events found for this date."}
        </div>
      )}
    </div>
  );
}
