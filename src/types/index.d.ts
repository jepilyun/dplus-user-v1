export type ISODateInput = Date | string; // string은 ISO 형식 권장

/**
 * 캘린더 이벤트의 공통 타입 (Google Calendar & Apple Calendar 호환)
 * - startDate/endDate: Date | string(ISO) 등 프로젝트 내 ISODateInput을 그대로 사용
 * - allDay: true면 종일 이벤트로 처리 (ICS는 DTEND 비포함 규칙)
 * - timezone: IANA(예: "Asia/Seoul"). 제공 시 로컬타임 DTSTART/DTEND로 직렬화 가능
 * - website: Apple(Calendar)에서는 URL, Google에서는 description/attachments와 함께 노출 가능
 * - guests: Google 참석자, Apple은 ICS(ATTENDEE)로 매핑 가능
 * - busy: Google의 transparency, ICS의 TRANSP:OPAQUE/TRANSPARENT로 매핑 가능
 * - uid: ICS의 UID로 활용(안 주면 생성)
 * - geo: ICS의 GEO(lat;lon)로 활용
 */
export interface ICalendarEvent {
  title: string;
  startDate: ISODateInput;
  endDate?: ISODateInput;

  description?: string;
  location?: string;
  allDay?: boolean;

  guests?: string[]; // Google: attendees, ICS: ATTENDEE
  busy?: boolean; // Google: default busy, ICS: TRANSP (true=OPAQUE, false=TRANSPARENT)

  website?: { name?: string; url: string }; // ICS: URL, Google: description/link 등으로 사용
  timezone?: string; // IANA tz (e.g. "Asia/Seoul")

  // 공통 확장 필드 (양쪽 매핑 가능)
  uid?: string; // ICS UID (없으면 생성)
  geo?: { lat: number; lon: number }; // ICS GEO
  status?: "tentative" | "confirmed" | "cancelled"; // ICS STATUS / Google eventStatus
}
