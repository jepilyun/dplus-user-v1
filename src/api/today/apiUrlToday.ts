const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlToday = {
  detailGet: (countryCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/today/detail/get/${encodeURIComponent(countryCode)}/${start}/${limit}`,
};
