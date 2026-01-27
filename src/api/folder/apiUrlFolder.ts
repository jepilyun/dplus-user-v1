const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlFolder = {
  detailGet: (folderCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/folder/detail/get/${encodeURIComponent(folderCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (folderCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/folder/events/get/${encodeURIComponent(folderCode)}/${langCode}/${start}/${limit}`,
  recentCodeListGet: (
    limit?: number,
    countryCode?: string | null,
    cityCode?: string | null,
  ) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
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
    return `${BASE_URL}/api/folder/get/codes/recent${qs ? `?${qs}` : ""}`;
  },
  metadataGet: (folderCode: string, langCode: string) =>
    `${BASE_URL}/api/folder/metadata/get/${encodeURIComponent(folderCode)}/${langCode}`,
};
