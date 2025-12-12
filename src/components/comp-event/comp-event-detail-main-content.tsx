import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1";
import { HeadlineTagsDetail } from "../headline-tags-detail";
import CompEventContactLinks from "./comp-event-contact-links";

/**
 * 이벤트 상세 페이지 메인 컨텐츠
 * @param eventDetail - 이벤트 상세 정보
 * @param langCode - 언어 코드
 * @returns 이벤트 상세 페이지 메인 컨텐츠
 */
export const CompEventDetailMainContent = ({ eventDetail, langCode }: { eventDetail: ResponseEventDetailForUserFront | null, langCode: (typeof SUPPORT_LANG_CODES)[number] }) => {
  if (!eventDetail) return null;
  
  return (
    <div className="py-16 flex flex-col gap-4">
      <HeadlineTagsDetail
        targetCountryCode={eventDetail?.event.target_country_code || null}
        targetCountryName={eventDetail?.event.target_country_native || null}
        targetCityCode={eventDetail?.event.target_city_code || null}
        targetCityName={eventDetail?.event.target_city_native || null}
        categories={eventDetail?.mapCategoryEvent?.items ?? null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
        showCountry={false}
      /> 
      <div
        id="event-title"
        className="px-12 text-center md:px-8 lg:px-10 font-black text-3xl md:text-4xl xl:text-5xl leading-[1.6]"
        data-event-code={eventDetail?.event.event_code}
      >
        {eventDetail?.event.title}
      </div>
        
      {eventDetail?.event.description && (
        <div className="m-auto p-4 px-8 text-center w-full text-lg max-w-[1024px] whitespace-pre-line">{eventDetail?.event.description}</div>
      )}
      {eventDetail?.mapStagEvent?.items.map(item => (
        <div key={item.stag_info?.stag_code}>
          <div>{item.stag_info?.stag_native}</div>
        </div>
      ))}
      {eventDetail?.mapTagEvent?.items.map(item => (
        <div key={item.tag_info?.tag_code}>
          <div>{item.tag_info?.tag_code}</div>
        </div>
      ))}
      <CompEventContactLinks event={eventDetail?.event} langCode={langCode} />
    </div>
  )
}