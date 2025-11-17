// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.concreteplayground.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gzfnhzdqyqzfytxkzceu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    domains: [
      "gzfnhzdqyqzfytxkzceu.supabase.co",
      "i.ytimg.com",
    ],
  },
  // ✅ Next.js의 자동 스크롤 복원 비활성화
  experimental: {
    scrollRestoration: false,
  },
};

module.exports = nextConfig;
