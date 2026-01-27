const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlCategory = {
  detailGet: (
    countryCode: string,
    categoryCode: string,
    langCode: string,
    start: number,
    limit: number,
  ) =>
    `${BASE_URL}/api/category/detail/get/${encodeURIComponent(countryCode)}/${encodeURIComponent(categoryCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (
    countryCode: string,
    categoryCode: string,
    langCode: string,
    start: number,
    limit: number,
  ) =>
    `${BASE_URL}/api/category/events/get/${encodeURIComponent(countryCode)}/${encodeURIComponent(categoryCode)}/${langCode}/${start}/${limit}`,
  codeListGet: (limit?: number) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
    }
    const qs = qp.toString();
    return `${BASE_URL}/api/category/get/code/list${qs ? `?${qs}` : ""}`;
  },
};
