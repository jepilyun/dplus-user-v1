// app/sitemap-groups.xml/route.ts
import { reqGetGroupCodes } from '@/actions/action';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.dplus.app';
  
  const groupRes = await reqGetGroupCodes(50000);
  const groupCodes = groupRes?.dbResponse ?? [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${groupCodes
    .map(
      (item: { group_code: string }) => `
  <url>
    <loc>${baseUrl}/group/${item.group_code}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 86400;