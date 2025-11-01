"use client";

import { reqGetCountryDetail, reqGetCountryEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCountryDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapCountryEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ 수정: useRef 추가
import { getCountryImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselCountry } from "../comp-image/hero-background-carousel-country";
import Link from "next/link";
import { getCityBgUrl } from "@/utils/get-city-bg-image";
import { useCountryPageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 추가: 복원할 상태 타입
type CountryPageState = {
  events: TMapCountryEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCountryDetailPage({
  countryCode,
  fullLocale,
  langCode,
}: {
  countryCode: string;
  fullLocale: string;
  langCode: string;
}) {
  const router = useRouter();
  const { save, restore } = useCountryPageRestoration(countryCode); // ✅ 추가

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [countryDetail, setCountryDetail] = useState<ResponseCountryDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [hasCategories, setHasCategories] = useState(false);
  const [hasCities, setHasCities] = useState(false);

  // ✅ 수정: Set은 렌더링과 무관하므로 useRef가 더 적합 (불필요한 리렌더 방지)
  const seenEventCodesRef = useRef<Set<string>>(new Set());

  const [events, setEvents] = useState<TMapCountryEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 추가: 복원 여부 플래그
  const hydratedFromRestoreRef = useRef(false);

  const fetchCountryDetail = async () => {
    try {
      const res = await reqGetCountryDetail(countryCode, langCode, 0, LIST_LIMIT.default);
      console.log("res", res);
      
      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" && !Array.isArray(res?.dbResponse) && Object.keys(res?.dbResponse).length === 0);
  
      if (!res?.success || isEmptyObj || !res?.dbResponse?.country) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCountryDetail(res.dbResponse);
      setImageUrls(getCountryImageUrls(res.dbResponse.country));
      setHasCategories((res.dbResponse.categories?.items?.length ?? 0) > 0);
      setHasCities((res.dbResponse.cities?.items?.length ?? 0) > 0);
  
      // ✅ 수정: 복원된 데이터가 없을 때만 이벤트 초기화
      if (!hydratedFromRestoreRef.current) {
        const initItems = res.dbResponse.mapCountryEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(res.dbResponse.mapCountryEvent?.hasMore));
        
        // 중복 방지 Set 채우기
        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }
      // ✅ 복원된 경우: 이벤트 데이터는 그대로 두고, hasMore만 업데이트
      else {
        // 서버에서 받은 total과 현재 events 개수를 비교해서 hasMore 재계산
        const serverTotal = res.dbResponse.mapCountryEvent?.total ?? 0;
        setEventsHasMore(events.length < serverTotal);
      }
  
      setError(null);
    } catch (e) {
      console.error("Failed to fetch country detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: countryDetail?.country.country_name || "이벤트 세트 공유",
      text: countryDetail?.country.country_name || "이벤트 세트 정보를 확인해보세요!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("공유 실패:", error);
      }
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareData.text
      )}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, "_blank", "width=600,height=400");
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);
    try {
      const res = await reqGetCountryEvents(countryCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapCountryEventWithEventInfo) => {
        const code = it?.event_info?.event_code ?? it?.event_code;
        if (!code || seenEventCodesRef.current.has(code)) return false;
        seenEventCodesRef.current.add(code);
        return true;
      });
      setEvents((prev) => prev.concat(newItems));
      setEventsStart((prev) => prev + newItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  // ✅ 추가: ① 마운트 시 즉시 복원(있으면 로딩 플래시 없이 바로 그려주기)
  useEffect(() => {
    const saved = restore<CountryPageState>();
    if (saved && saved.events && saved.events.length > 0) {  // ✅ 빈 배열 체크 추가
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    // saved 유무와 무관하게 최신화 시도
    fetchCountryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // ✅ 추가: ② 라우팅 직전(링크 클릭) 상태 저장 — pointerdown 캡처 단계가 가장 안전
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      save<CountryPageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, save]);

  // ✅ 추가: ③ 새로고침/탭 숨김 시에도 저장 (선택이지만 추천)
  useEffect(() => {
    const persist = () =>
      save<CountryPageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });

    window.addEventListener("beforeunload", persist);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [events, eventsStart, eventsHasMore, save]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 국가를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Country Not Found</h2>
          <p className="text-gray-600 mb-6">
            해당 국가는 존재하지 않습니다.
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
            Failed to load country details. Please try again.
          </p>
          <button
            onClick={() => fetchCountryDetail()}
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
      <HeroImageBackgroundCarouselCountry
        bucket="countries"
        imageUrls={imageUrls}
        interval={5000}
        countryDetail={countryDetail?.country || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      {hasCategories && (
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {countryDetail?.categories?.items.map((item) => (
              <Link
                key={item.category_code}
                href={`/category/${item.category_code}`}
                className="block"
              >
                <div className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-xs border border-gray-200 px-4 py-2 transition hover:bg-gray-50">
                  <div className="text-md font-medium text-center">
                    {item.name_i18n ?? item.name}
                  </div>
                  {/* <div className="text-xs text-muted-foreground text-center">{item.name}</div> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasCities && (
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 min-h-[120px]">
            {countryDetail?.cities?.items.map((item) => {
              const bg = getCityBgUrl(item);
              return (
                <Link
                  key={item.city_code}
                  href={`/city/${item.city_code}`}
                  className={[
                    "relative flex flex-col items-center justify-center gap-1",
                    "h-full min-h-[120px] w-full rounded-xs border border-gray-200 p-4",
                    "transition-all duration-200 overflow-hidden",
                    "group", // ← 중요: group으로 설정
                    bg 
                      ? "bg-gray-900" 
                      : "bg-gray-50 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {/* 배경 이미지 레이어 */}
                  {bg && (
                    <>
                      <div
                        className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${bg})` }}
                        aria-hidden="true"
                      />
                      
                      {/* 검은 반투명 오버레이 - hover 시 더 투명하게 */}
                      <div 
                        className="absolute inset-0 bg-black/60 transition-opacity duration-200 group-hover:bg-black/40" 
                        aria-hidden="true"
                      />
                    </>
                  )}

                  {/* 내용 */}
                  <div className="relative z-10 w-full">
                    <div
                      className={[
                        "text-xl font-bold text-center transition-transform duration-200",
                        bg 
                          ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-105" 
                          : "text-gray-900",
                      ].join(" ")}
                    >
                      {item.name_native ?? item.name}
                    </div>
                    <div
                      className={[
                        "text-sm text-center transition-transform duration-200",
                        bg
                          ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:scale-105"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {item.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* {countryDetail?.stags?.items.map(item => (
        <div key={item.stag_code}>
          <div>{item.stag}</div>
        </div>
      ))} */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItem key={item.event_info?.event_code} event={item} fullLocale={fullLocale} />
          ))}

          {/* 더보기 버튼 */}
          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : null}

      {/* 
      {folderDetail?.mapStagFolder?.map(item => (
        <div key={item.stag_info?.stag_code}>
          <div>{item.stag_native}</div>
          <div>{item.stag_name_i18n}</div>
        </div>
      ))}
      {folderDetail?.mapTagFolder?.map(item => (
        <div key={item.tag_code}>
          <div>{item.tag_code}</div>
        </div>
      ))}
      <div className="m-auto w-full max-w-[1280px]">
        <div className="rounded-xl bg-white/70 p-8 sm:p-12">
          <ul
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-x-6 gap-y-6
            "
            aria-label="event contact & links"
          >
          {folderDetail?.content.phone && (
            <InfoItem
              icon={<IconPhoneRound className="h-12 w-12 text-gray-700" />}
              text={`+${folderDetail.content.phone_country_code} ${folderDetail.content.phone}`}
              href={toTelUrl(folderDetail.content.phone)}
            />
          )}
          {folderDetail?.content.homepage && (
            <InfoItem
              icon={<IconHomepageRound className="h-12 w-12 text-gray-700" />}
              text={folderDetail.content.homepage.replace(/^https?:\/\//i, "")}
              href={toAbsoluteUrl(folderDetail.content.homepage)}
            />
          )}
          {folderDetail?.content.email && (
            <InfoItem
              icon={<IconEmailRound className="h-12 w-12 text-gray-700" />}
              text={folderDetail.content.email}
              href={toMailUrl(folderDetail.content.email)}
            />
          )}
          {folderDetail?.content.youtube_ch_id && (
            <InfoItem
              icon={<IconYoutubeRound className="h-12 w-12 text-gray-700" />}
              text="Youtube"
              href={toYoutubeChannelUrl(folderDetail.content.youtube_ch_id)}
            />
          )}
          {folderDetail?.content.instagram_id && (
            <InfoItem
              icon={<IconInstagramRound className="h-12 w-12 text-gray-700" />}
              text="Instagram"
              href={toInstagramUrl(folderDetail.content.instagram_id)}
            />
          )}
          {/* 기존 LinkForDetail도 리스트 아이템로 포함 */}
          {/* {folderDetail?.content.url && (
            <InfoItem
              icon={<IconWebsiteRound className="h-12 w-12 text-gray-700" />}
              text="URL"
              href={folderDetail.content.url}
            />
          )}
          </ul> */}
        {/* </div> */}
      {/* </div> */}
      {/* <div>Profile Image:{folderDetail?.content.profile}</div> */}
      {/* <CompDatesInDetail createdAt={folderDetail?.content.created_at} updatedAt={folderDetail?.content.updated_at} fullLocale={fullLocale} /> */}
    </div>
  );
}