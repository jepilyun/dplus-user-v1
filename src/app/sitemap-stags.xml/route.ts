// app/sitemap-stags.xml/route.ts
import { NextResponse } from "next/server";

import { reqGetStagCodes } from "@/api/req-stag";

export async function GET() {
  const baseUrl = "https://www.dplus.app";

  const stagRes = await reqGetStagCodes(50000);
  const stagCodes = stagRes?.dbResponse ?? [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${stagCodes
    .map(
      (item: { stag_code: string }) => `
  <url>
    <loc>${baseUrl}/stag/${item.stag_code}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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

export const revalidate = 86400;
