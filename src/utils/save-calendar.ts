import { ICalendarEvent, ISODateInput } from "@/types";
import { TEventDetail } from "dplus_common_v1";
import {
  addDaysToDate,
  addMinutes,
  formatDateAllDay,
  toDate,
} from "./date-utils";
import { detectDevice, DeviceType } from "./device-detector";


/**
 * 날짜를 Google Calendar 형식으로 변환 (YYYYMMDD 또는 YYYYMMDDTHHMMSSZ)
 * @param date 날짜 (ISODateInput 또는 Date)
 * @param allDay 종일 이벤트 여부
 * @returns Google Calendar 형식의 날짜 문자열
 * * @example
 * // 종일 이벤트
 * toGoogleDate('2025-12-25', true) // => "20251225"
 * * // 시간 이벤트 (UTC 기준)
 * toGoogleDate(new Date('2025-12-25T10:30:00Z'), false) // => "20251225T103000Z"
 */
const toGoogleDate = (date: ISODateInput, allDay = false): string => {
  const d = toDate(date); // 안전하게 Date 객체로 변환
  if (allDay) {
    return formatDateAllDay(d); // date-utils의 formatDateAllDay 재사용
  }
  // YYYYMMDDTHHMMSSZ (UTC)
  return d.toISOString().replace(/-|:|\.\d+/g, "");
};

/**
 * TEventDetail 객체로부터 Google Calendar Event 형식의 객체를 생성합니다.
 * @param eventDetail - 원본 이벤트 상세 정보
 * @returns Google Calendar Event 객체
 * @throws {Error} 이벤트 정보가 없는 경우
 * * @example
 * const detail = {
 * title: "팀 미팅",
 * date: "2025-08-28",
 * time: "14:00:00",
 * duration: 60, // 60분
 * description: "주간 업무 보고",
 * address_native: "사무실 101호",
 * tz: "Asia/Seoul",
 * url: "http://example.com/meeting",
 * url_label: "미팅 링크"
 * };
 * const googleEvent = generateGoogleCalendarEvent(detail);
 * // => { title: "팀 미팅", startDate: Date 객체, endDate: Date 객체, ... }
 */
export const generateGoogleCalendarEvent = (
  eventDetail: TEventDetail | null,
): ICalendarEvent => {
  if (!eventDetail) throw new Error("이벤트 정보가 없습니다.");

  let startDate: Date;
  if (eventDetail.time) {
    // 날짜와 시간을 합쳐 Date 객체 생성
    startDate = toDate(`${eventDetail.date} ${eventDetail.time}`);
  } else {
    // 날짜만 사용하여 Date 객체 생성
    startDate = toDate(eventDetail.date);
  }

  const event: ICalendarEvent = {
    title: eventDetail.title,
    startDate: startDate, // 이제 항상 Date 객체
    allDay: !eventDetail.time, // 시간이 없으면 종일 이벤트
  };

  if (eventDetail.duration) {
    // startDate가 Date 객체임을 보장 후 addMinutes 호출
    event.endDate = addMinutes(toDate(event.startDate), eventDetail.duration);
  }
  if (eventDetail.description) event.description = eventDetail.description;
  if (eventDetail.address_native) event.location = eventDetail.address_native;
  if (eventDetail.tz) event.timezone = eventDetail.tz;
  if (eventDetail.url) {
    event.website = { name: eventDetail.url_label ?? "", url: eventDetail.url };
  }
  return event;
};

/**
 * Google Calendar 이벤트 추가 URL을 생성합니다.
 * endDate가 명시되지 않은 경우, 종일 이벤트는 익일로, 시간 이벤트는 30분 후로 자동 설정됩니다.
 * @param event - Google Calendar Event 객체
 * @returns Google Calendar 이벤트 추가 URL 문자열
 * * @example
 * const event = {
 * title: "점심 식사",
 * startDate: new Date('2025-08-28T12:00:00'),
 * allDay: false
 * };
 * createGoogleCalendarUrl(event);
 * // => "https://www.google.com/calendar/render?action=TEMPLATE&text=%EC%A0%90%EC%8B%AC+%EC%8B%9D%EC%82%AC&dates=20250828T030000Z/20250828T033000Z"
 */
export const createGoogleCalendarUrl = (event: ICalendarEvent): string => {
  const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";

  const start = toDate(event.startDate); // startDate가 ISODateInput 타입이므로 toDate로 변환
  const effectiveEnd =
    event.endDate != null
      ? toDate(event.endDate) // endDate도 ISODateInput 타입일 수 있으므로 toDate로 변환
      : event.allDay
        ? addDaysToDate(start, 1) // 종일 이벤트는 구글 규격상 종료일 '익일'
        : addMinutes(start, 30); // 시간 이벤트 기본 30분 후

  const startDateStr = toGoogleDate(start, !!event.allDay);
  const endDateStr = toGoogleDate(effectiveEnd, !!event.allDay);

  const params = new URLSearchParams({
    text: event.title,
    dates: `${startDateStr}/${endDateStr}`,
  });

  if (event.description) params.set("details", event.description);
  if (event.location) params.set("location", event.location);
  if (event.timezone) params.set("ctz", event.timezone);
  if (event.busy === false) params.set("trp", "false"); // 기본 바쁨(true)로 가정, false일 때만 명시

  if (event.guests?.length) {
    params.set("add", event.guests.join(","));
  }

  if (event.website) {
    params.set("sprop", `website:${event.website.url}`);
    params.append("sprop", `name:${event.website.name}`);
  }

  return `${baseUrl}&${params.toString()}`;
};

/**
 * 새 탭으로 Google Calendar 이벤트 추가 URL을 엽니다 (브라우저 전용).
 * @param event - Google Calendar Event 객체
 * * @example
 * const event = { ... }; // GoogleCalendarEvent 객체
 * addToGoogleCalendar(event); // 새 탭에 Google Calendar 추가 페이지가 열림
 */
export function addToGoogleCalendar(event: ICalendarEvent): void {
  const url = createGoogleCalendarUrl(event);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const formatLocalICS = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
  `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; // no 'Z'
const formatUtcICS = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z"); // YYYYMMDDTHHMMSSZ
const formatDateOnlyICS = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

const icsEscape = (v: string) =>
  (v ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

const foldLine = (line: string) => {
  // RFC5545: 75 octets soft wrap. 간단히 74자 기준으로 폴딩.
  const out: string[] = [];
  let s = line;
  while (s.length > 74) {
    out.push(s.slice(0, 74));
    s = " " + s.slice(74);
  }
  out.push(s);
  return out.join("\r\n");
};

const slugify = (s: string) =>
  (s || "event")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ── 공통 이벤트에서 ICS 라인 만들기 ─────────────────────────────────────────────
type GenerateICSOptions = {
  /**
   * TZID 사용 여부: true면 DTSTART;TZID=Asia/Seoul 형식(대부분 클라이언트에서 VTIMEZONE 없이도 동작),
   * false면 UTC(Z)로 기록.
   */
  useTZID?: boolean;
  /**
   * ICS 헤더에 넣을 PRODID
   */
  prodId?: string;
  /**
   * UID를 외부에서 고정하고 싶을 때 사용(없으면 자동 생성)
   */
  uid?: string;
  /**
   * RRULE (예: 'FREQ=YEARLY' 등)
   */
  rrule?: string;
  /**
   * GEO 좌표 (위도, 경도)
   */
  geo?: { lat: number; lon: number } | null;
};

const normalizeForICS = (event: ICalendarEvent) => {
  const start = toDate(event.startDate);
  const allDay = !!event.allDay;
  // end가 없으면: 종일 → 익일 0시, 시간 이벤트 → 기본 30분
  const end =
    event.endDate != null
      ? toDate(event.endDate)
      : allDay
        ? addDaysToDate(start, 1)
        : addMinutes(start, 30);
  return { start, end, allDay };
};

const buildICSFromICalendarEvent = (
  event: ICalendarEvent,
  {
    useTZID = false,
    prodId = "-//Trand//Calendar Export//KO",
    uid,
    rrule,
    geo,
  }: GenerateICSOptions = {},
) => {
  const { start, end, allDay } = normalizeForICS(event);
  const now = new Date();
  const tzid = useTZID ? event.timezone : undefined;

  // DTSTART / DTEND
  let dtStartLine = "";
  let dtEndLine = "";
  if (allDay) {
    dtStartLine = `DTSTART;VALUE=DATE:${formatDateOnlyICS(start)}`;
    dtEndLine = `DTEND;VALUE=DATE:${formatDateOnlyICS(end)}`; // 비포함 규칙
  } else {
    if (tzid) {
      dtStartLine = `DTSTART;TZID=${tzid}:${formatLocalICS(start)}`;
      dtEndLine = `DTEND;TZID=${tzid}:${formatLocalICS(end)}`;
    } else {
      dtStartLine = `DTSTART:${formatUtcICS(start)}`;
      dtEndLine = `DTEND:${formatUtcICS(end)}`;
    }
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsEscape(
      uid ||
        // 제목 + 시작시각 기반 fallback UID
        `${slugify(event.title)}-${formatUtcICS(start)}@trand.app`,
    )}`,
    `DTSTAMP:${formatUtcICS(now)}`,
    dtStartLine,
    dtEndLine,
    `SUMMARY:${icsEscape(event.title)}`,
    ...(event.description
      ? [foldLine(`DESCRIPTION:${icsEscape(event.description)}`)]
      : []),
    ...(event.location
      ? [foldLine(`LOCATION:${icsEscape(event.location)}`)]
      : []),
    ...(event.website?.url
      ? [`URL;VALUE=URI:${icsEscape(event.website.url)}`]
      : []),
    ...(rrule ? [`RRULE:${rrule}`] : []),
    ...(geo ? [`GEO:${geo.lat};${geo.lon}`] : []),
    // 투명도(=바쁨) 매핑: true(바쁨)=OPAQUE, false=TRANSPARENT
    ...(event.busy === false ? ["TRANSP:TRANSPARENT"] : ["TRANSP:OPAQUE"]),
    // 참석자: 단순 이메일 리스트 → ATTENDEE:mailto:
    ...(event.guests?.length
      ? event.guests.map((g) => `ATTENDEE:mailto:${g}`)
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n") + "\r\n";
};

function pickUid(d: TEventDetail, prefer?: string): string {
  if (prefer) return prefer;
  if ("event_id" in d && d.event_id) return d.event_id as string;
  if ("pevent_id" in d && d.pevent_id) return d.pevent_id as string;

  // 서버라면 node:crypto 권장
  // return randomUUID();

  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── Apple 전용 어댑터: TEventDetail → ICalendarEvent → ICS ─────────────────────
/**
 * TEventDetail을 받아 Apple Calendar(및 모든 ICS 지원 캘린더)에 추가 가능한
 * ICS 텍스트와 파일명을 생성합니다.
 *
 * 내부적으로 기존 generateGoogleCalendarEvent(detail)로 ICalendarEvent를 만들고,
 * 그 결과를 ICS로 직렬화합니다.
 */
export const generateAppleCalendarEvent = (
  detail: TEventDetail,
  opts?: Partial<GenerateICSOptions>,
): { icsText: string; filename: string } => {
  // 1) 기존 정규화 로직 재사용
  const baseEvent: ICalendarEvent = generateGoogleCalendarEvent(detail);

  // 2) RRULE/좌표 등 Apple-친화적 옵션 구성
  const rrule = detail.is_repeat_annually ? "FREQ=YEARLY" : undefined;
  const geo =
    typeof detail.latitude === "number" && typeof detail.longitude === "number"
      ? { lat: detail.latitude, lon: detail.longitude }
      : null;

  // 3) ICS 생성
  const uid = pickUid(detail, opts?.uid);

  const icsText = buildICSFromICalendarEvent(baseEvent, {
    rrule,
    geo,
    useTZID: !!baseEvent.timezone && (opts?.useTZID ?? false),
    prodId: opts?.prodId,
    uid,
  });

  // 4) 파일명
  const filename = `${slugify(detail.title)}.ics`;
  return { icsText, filename };
};

// export const addToAppleCalendarFromDetail = (detail: TEventDetail | null) => {
//   if (!detail) return;

//   const { icsText, filename } = generateAppleCalendarEvent(detail, {
//     useTZID: true,
//   });
//   const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
//   const url = URL.createObjectURL(blob);

//   if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
//     window.open(url, "_blank");
//   } else {
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   }

//   setTimeout(() => URL.revokeObjectURL(url), 1500);
// };

export const addToAndroidCalendar = (event: ICalendarEvent) => {
  // Android Google Calendar 앱 딥링크
  const url = createGoogleCalendarUrl(event);
  
  // intent:// 스킴으로 변경하여 앱으로 직접 연결
  const intentUrl = url.replace(
    'https://www.google.com/calendar',
    'intent://www.google.com/calendar'
  ) + '#Intent;scheme=https;package=com.google.android.calendar;end';
  
  window.location.href = intentUrl;
};


// 기존 addToAppleCalendarFromDetail 함수를 수정
export const addToCalendar = (detail: TEventDetail | null, platform?: DeviceType) => {
  if (!detail) return;

  const detectedPlatform = platform || detectDevice();
  const { icsText, filename } = generateAppleCalendarEvent(detail, {
    useTZID: true,
  });

  const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  switch (detectedPlatform) {
    case 'ios':
      // iOS: 새 탭에서 열기
      window.open(url, "_blank");
      break;
      
    case 'android':
      try {
        // 먼저 Google Calendar 앱으로 시도
        addToAndroidCalendar(generateGoogleCalendarEvent(detail));
      } catch {
        // 실패하면 ICS 다운로드로 폴백
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      break;
      
    case 'desktop':

    default:
      // Desktop: ICS 파일 다운로드
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
  }

  setTimeout(() => URL.revokeObjectURL(url), 1500);
};