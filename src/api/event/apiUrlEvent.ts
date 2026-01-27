const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlEvent = {
  detailGet: (eventCode: string, langCode: string) =>
    `${BASE_URL}/api/event/detail/get/${eventCode}/${langCode}`,
  upcomingCodeListGet: (
    limit?: number,
    backDays?: number,
    countryCode?: string | null,
    cityCode?: string | null,
  ) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
    }
    if (typeof backDays === "number" && Number.isFinite(backDays)) {
      qp.set("backDays", String(backDays));
    }
    if (typeof countryCode === "string") {
      const cc = countryCode.trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(cc)) qp.set("countryCode", cc);
    }
    if (typeof cityCode === "string") {
      const city = cityCode.trim();
      if (city) qp.set("cityCode", city);
    }
    const qs = qp.toString();
    return `${BASE_URL}/api/event/get/codes/upcoming${qs ? `?${qs}` : ""}`;
  },
};
