const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlStag = {
  detailGet: (stagCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/stag/detail/get/${encodeURIComponent(stagCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (stagCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/stag/events/get/${encodeURIComponent(stagCode)}/${start}/${limit}`,
  codeListGet: (limit?: number) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
    }
    const qs = qp.toString();
    return `${BASE_URL}/api/group/get/code/list${qs ? `?${qs}` : ""}`;
  },
};
