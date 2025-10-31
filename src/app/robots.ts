// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/search/", "/tag/"], // 검색/태그 페이지는 크롤링 제외
    },
    sitemap: [
      "https://www.dplus.app/sitemap.xml",
      "https://www.dplus.app/sitemap-events.xml",
      "https://www.dplus.app/sitemap-folders.xml",
      "https://www.dplus.app/sitemap-stags.xml",
      "https://www.dplus.app/sitemap-groups.xml",
    ],
  };
}
