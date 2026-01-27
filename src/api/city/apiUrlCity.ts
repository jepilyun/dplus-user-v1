const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlCity = {
  detailGet: (cityCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/city/detail/get/${encodeURIComponent(cityCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (cityCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/city/events/get/${encodeURIComponent(cityCode)}/${langCode}/${start}/${limit}`,
  codeListGet: (limit?: number) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
    }
    const qs = qp.toString();
    return `${BASE_URL}/api/city/get/code/list${qs ? `?${qs}` : ""}`;
  },
  metadataGet: (cityCode: string, langCode: string) =>
    `${BASE_URL}/api/city/metadata/get/${encodeURIComponent(cityCode)}/${langCode}`,
};
