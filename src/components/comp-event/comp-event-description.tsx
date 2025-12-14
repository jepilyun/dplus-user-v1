import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1";

/**
 * 이벤트 상세 페이지 메인 컨텐츠
 * @param eventDetail - 이벤트 상세 정보
 * @param langCode - 언어 코드
 * @returns 이벤트 상세 페이지 메인 컨텐츠
 */
export const CompEventDescription = ({ 
  eventDetail, 
  langCode 
}: { 
  eventDetail: ResponseEventDetailForUserFront | null;
  langCode: (typeof SUPPORT_LANG_CODES)[number];
}) => {
  if (!eventDetail) return null;

  // ✅ 렌더링할 콘텐츠가 있는지 체크
  const hasDescription = !!eventDetail.event.description;
  const hasStags = eventDetail.mapStagEvent?.items && eventDetail.mapStagEvent.items.length > 0;
  const hasTags = eventDetail.mapTagEvent?.items && eventDetail.mapTagEvent.items.length > 0;

  // ✅ 모든 콘텐츠가 없으면 null 반환
  if (!hasDescription && !hasStags && !hasTags) {
    return null;
  }
  
  return (
    <div className="p-4 flex flex-col gap-4 rounded-4xl bg-white border border-white text-gray-700">
      {hasDescription && (
        <div className="m-auto p-4 w-full text-base sm:text-lg max-w-[840px] whitespace-pre-line leading-relaxed">
          {eventDetail.event.description}
        </div>
      )}
      {hasStags && eventDetail.mapStagEvent?.items.map(item => (
        <div key={item.stag_info?.stag_code}>
          <div>{item.stag_info?.stag_native}</div>
        </div>
      ))}
      {hasTags && eventDetail.mapTagEvent?.items.map(item => (
        <div key={item.tag_info?.tag_code}>
          <div>{item.tag_info?.tag_code}</div>
        </div>
      ))}
    </div>
  )
}