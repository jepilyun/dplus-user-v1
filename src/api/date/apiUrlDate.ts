const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlDate = {
  detailGet: (countryCode: string, dateString: string, start: number, limit: number) =>
    `${BASE_URL}/api/date/detail/get/${encodeURIComponent(countryCode)}/${encodeURIComponent(dateString)}/${start}/${limit}`,
};
