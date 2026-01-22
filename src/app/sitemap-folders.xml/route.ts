// app/sitemap-folders.xml/route.ts
import { NextResponse } from "next/server";

import { reqGetFolderCodeList } from "@/req/req-folder";

export async function GET() {
  const baseUrl = "https://www.dplus.app";

  const folderRes = await reqGetFolderCodeList(50000);
  const folderCodes = folderRes?.dbResponse ?? [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${folderCodes
    .map(
      (item: { folder_code: string }) => `
  <url>
    <loc>${baseUrl}/folder/${item.folder_code}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
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
