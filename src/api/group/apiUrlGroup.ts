const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlGroup = {
  detailGet: (groupCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/group/detail/get/${encodeURIComponent(groupCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (groupCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/group/events/get/${encodeURIComponent(groupCode)}/${start}/${limit}`,
  codeListGet: (limit?: number) => {
    const qp = new URLSearchParams();
    if (typeof limit === "number" && Number.isFinite(limit)) {
      qp.set("limit", String(limit));
    }
    const qs = qp.toString();
    return `${BASE_URL}/api/group/get/code/list${qs ? `?${qs}` : ""}`;
  },
};
