// app/sitemap.ts
import { reqGetCategoryCodes, reqGetCityCodes, reqGetCountryCodes, reqGetEventCodeList, reqGetFolderCodeList, reqGetGroupCodes, reqGetStagCodes } from '@/actions/action';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dplus.app';

  // 1. 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/nearby`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // 2. Country 페이지
  const countryRes = await reqGetCountryCodes();
  const countryCodes = countryRes?.dbResponse ?? [];
  const countryPages: MetadataRoute.Sitemap = countryCodes.map((item: { country_code: string }) => ({
    url: `${baseUrl}/${item.country_code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 3. City 페이지
  const cityRes = await reqGetCityCodes(100);
  const cityCodes = cityRes?.dbResponse ?? [];
  const cityPages: MetadataRoute.Sitemap = cityCodes.map((item: { city_code: string }) => ({
    url: `${baseUrl}/city/${item.city_code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 4. Category 페이지 (category x country 조합)
  const categoryRes = await reqGetCategoryCodes(200);
  const categoryCodes = categoryRes?.dbResponse ?? [];
  const categoryPages: MetadataRoute.Sitemap = [];
  
  for (const category of categoryCodes) {
    for (const country of countryCodes) {
      categoryPages.push({
        url: `${baseUrl}/category/${category.category_code}/${country.country_code}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  // 5. Today 페이지
  const todayPages: MetadataRoute.Sitemap = countryCodes.map((item: { country_code: string }) => ({
    url: `${baseUrl}/today/${item.country_code}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 6. Stag 페이지 (최근 500개)
  const stagRes = await reqGetStagCodes(100);
  const stagCodes = stagRes?.dbResponse ?? [];
  const stagPages: MetadataRoute.Sitemap = stagCodes.map((item: { stag_code: string }) => ({
    url: `${baseUrl}/stag/${item.stag_code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 7. Group 페이지 (최근 500개)
  const groupRes = await reqGetGroupCodes(100);
  const groupCodes = groupRes?.dbResponse ?? [];
  const groupPages: MetadataRoute.Sitemap = groupCodes.map((item: { group_code: string }) => ({
    url: `${baseUrl}/group/${item.group_code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 8. Event 페이지 (최근 1000개만)
  const eventRes = await reqGetEventCodeList(1000);
  const eventCodes = eventRes?.dbResponse ?? [];
  const eventPages: MetadataRoute.Sitemap = eventCodes.map((item: { event_code: string }) => ({
    url: `${baseUrl}/event/${item.event_code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 9. Folder 페이지 (최근 500개만)
  const folderRes = await reqGetFolderCodeList(500);
  const folderCodes = folderRes?.dbResponse ?? [];
  const folderPages: MetadataRoute.Sitemap = folderCodes.map((item: { folder_code: string }) => ({
    url: `${baseUrl}/folder/${item.folder_code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...countryPages,
    ...cityPages,
    ...categoryPages,
    ...todayPages,
    ...stagPages,
    ...groupPages,
    ...eventPages,
    ...folderPages,
  ];
}