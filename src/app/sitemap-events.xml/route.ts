// app/sitemap-events.xml/route.ts
import { NextResponse } from "next/server";

import { fetchGetEventCodeList } from "@/api/event/fetchEvent";

export async function GET() {
  const baseUrl = "https://www.dplus.app";

  // 전체 이벤트 코드 가져오기 (페이지네이션 필요 시 여러번 호출)
  const eventRes = await fetchGetEventCodeList(10000);
  const eventCodes = eventRes?.dbResponse ?? [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${eventCodes
    .map(
      (item: { event_code: string }) => `
  <url>
    <loc>${baseUrl}/event/${item.event_code}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

export const revalidate = 86400; // 24시간마다 재생성
