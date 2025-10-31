/**
 * API URL 옵션 파라미터 타입
 */
export type APIUrlOptionalParams = {
  dateString?: string | null;
  langCode?: string | null;
  categoryCode?: string | null;
  countryCode?: string | null;
  cityCode?: string | null;
  stagCode?: string | null;
  groupCode?: string | null;
  tagId?: number | null;
  tagCode?: string | null;
  eventCode?: string | null;
  folderCode?: string | null;
  keywordCode?: string | null;
  year?: number | null;
  weekNo?: number | null;
  date?: string | null;
  page?: number | null;
  size?: number | null;
  start?: number | null;
  limit?: number | null;
  tz?: string | null;
  backDays?: number | null;

  // langCode?: string | null;
  // categoryCode?: string | null;
  // countryCode?: string | null;
  // cityCode?: string | null;
  // streetCode?: string | null;
  // stagCode?: string | null;
  // contentCode?: string | null;
  // slugName?: string | null;
  // photoUri?: string | null;
  // keyword?: string | null;
  // page?: number | null;
  // size?: number | null;
  // videoId?: string | null;
  // channelId?: string | null;
  // primaryKey?: string | null;
  // tag?: string | null;
  // keywordCode?: string | null;
  // timeline?: string | null;
  // aid?: string | null;
  // id?: string | null;
  // hashCode?: string | null;
  // instaHashCode?: string | null;
};

/**
 * API Routes: Event Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { eventId, langCode }
 * @returns 경로
 */
export const apiUrlEvent = (
  type: "detailGet" | "upcomingCodeListGet" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.eventCode && optionalParams?.langCode) {
        path = `/api/event/detail/get/${optionalParams?.eventCode}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.eventCode] ${optionalParams?.eventCode}`,
        );
      }
      break;
    case "upcomingCodeListGet":
      const qp = new URLSearchParams();

      // limit: 숫자면 추가 (원하면 clampInt로 범위 제한)
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }

      // backDays: 숫자면 추가
      if (
        typeof optionalParams?.backDays === "number" &&
        Number.isFinite(optionalParams.backDays)
      ) {
        qp.set("backDays", String(optionalParams.backDays));
      }

      // countryCode: 문자열이면 2자 대문자만 허용
      if (typeof optionalParams?.countryCode === "string") {
        const cc = optionalParams.countryCode.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(cc)) qp.set("countryCode", cc);
      }

      // cityCode: 문자열이면 공백 아닌 경우만
      if (typeof optionalParams?.cityCode === "string") {
        const city = optionalParams.cityCode.trim();
        if (city) qp.set("cityCode", city);
      }

      const qs = qp.toString();
      path = `/api/event/get/codes/upcoming${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.eventCode && optionalParams?.langCode) {
        path = `/api/event/metadata/get/${optionalParams?.eventCode}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.eventCode] ${optionalParams?.eventCode}`,
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Folder Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { folderId, langCode }
 * @returns 경로
 */
export const apiUrlFolder = (
  type: "detailGet" | "eventsGet" | "recentCodeListGet" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.folderCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/folder/detail/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.folderCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/folder/events/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
        );
      }
      break;
    case "recentCodeListGet":
      const qp = new URLSearchParams();

      // limit: 숫자면 추가 (원하면 clampInt로 범위 제한)
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        // const lim = clampInt(optionalParams.limit, 100, 1, 1000); // 범위 제한이 필요하면 사용
        qp.set("limit", String(optionalParams.limit));
      }

      // countryCode: 2자 대문자만 허용
      if (typeof optionalParams?.countryCode === "string") {
        const cc = optionalParams.countryCode.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(cc)) qp.set("countryCode", cc);
      }

      // cityCode: 공백 아닌 문자열만
      if (typeof optionalParams?.cityCode === "string") {
        const city = optionalParams.cityCode.trim();
        if (city) qp.set("cityCode", city);
      }

      const qs = qp.toString();
      path = `/api/folder/get/codes/recent${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.folderCode && optionalParams?.langCode) {
        path = `/api/folder/metadata/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Date Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { dateString, start, limit }
 * @returns 경로
 */
export const apiUrlDate = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.dateString &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/date/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.dateString)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.dateString] ${optionalParams?.dateString}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: City Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { cityCode, start, limit }
 * @returns 경로
 */
export const apiUrlCity = (
  type: "detailGet" | "eventsGet" | "getCityCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.cityCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/city/detail/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.cityCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/city/events/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
        );
      }
      break;
    case "getCityCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/city/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.cityCode && optionalParams?.langCode) {
        path = `/api/city/metadata/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Stag Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { stagCode, start, limit }
 * @returns 경로
 */
export const apiUrlStag = (
  type: "detailGet" | "eventsGet" | "getStagCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.stagCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/stag/detail/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.stagCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/stag/events/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`,
        );
      }
      break;
    case "getStagCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/group/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.stagCode && optionalParams?.langCode) {
        path = `/api/stag/metadata/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Group Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { groupCode, start, limit }
 * @returns 경로
 */
export const apiUrlGroup = (
  type: "detailGet" | "eventsGet" | "getGroupCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.groupCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/group/detail/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.groupCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/group/events/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
      }
      break;
    case "getGroupCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/group/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.stagCode && optionalParams?.langCode) {
        path = `/api/group/metadata/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Tag Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { tagId, start, limit }
 * @returns 경로
 */
export const apiUrlTag = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.tagCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/tag/detail/get/${encodeURIComponent(optionalParams?.tagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.tagCode] ${optionalParams?.tagCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        typeof optionalParams?.tagId === "number" &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/tag/events/get/${optionalParams?.tagId}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.tagId] ${optionalParams?.tagId}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Category Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, categoryCode, start, limit }
 * @returns 경로
 */
export const apiUrlCategory = (
  type: "detailGet" | "eventsGet" | "getCategoryCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.categoryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/category/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.start}/${optionalParams?.limit}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.categoryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/category/events/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
        );
      }
      break;
    case "getCategoryCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/category/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.categoryCode && optionalParams?.langCode) {
        path = `/api/category/metadata/get/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Today Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, start, limit }
 * @returns 경로
 */
export const apiUrlToday = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/today/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};

/**
 * API Routes: Country Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, start, limit }
 * @returns 경로
 */
export const apiUrlCountry = (
  type: "detailGet" | "eventsGet" | "getCountryCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/country/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.start}/${optionalParams?.limit}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/country/events/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
      }
      break;
    case "getCountryCodes":
      path = `/api/country/get/code/list`;
      break;
    case "metadataGet":
      if (optionalParams?.countryCode && optionalParams?.langCode) {
        path = `/api/country/metadata/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};
