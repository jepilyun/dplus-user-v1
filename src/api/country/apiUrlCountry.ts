const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL ?? "";

export const apiUrlCountry = {
  detailGet: (countryCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/country/detail/get/${encodeURIComponent(countryCode)}/${langCode}/${start}/${limit}`,
  eventsGet: (countryCode: string, langCode: string, start: number, limit: number) =>
    `${BASE_URL}/api/country/events/get/${encodeURIComponent(countryCode)}/${langCode}/${start}/${limit}`,
  codeListGet: () => `${BASE_URL}/api/country/get/code/list`,
  metadataGet: (countryCode: string, langCode: string) =>
    `${BASE_URL}/api/country/metadata/get/${encodeURIComponent(countryCode)}/${langCode}`,
};
