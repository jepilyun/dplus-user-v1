const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlTag = {
  detailGet: (tagCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/tag/detail/get/${encodeURIComponent(tagCode)}/${start}/${limit}`,
  eventsGet: (tagCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/tag/events/get/${encodeURIComponent(tagCode)}/${start}/${limit}`,
};
