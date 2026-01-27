const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlPlace = {
  detailGet: (placeId: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/place/detail/get/${encodeURIComponent(placeId)}/${langCode}/${start}/${limit}`,
  eventsGet: (placeId: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/place/events/get/${encodeURIComponent(placeId)}/${langCode}/${start}/${limit}`,
};
