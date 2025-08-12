// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.concreteplayground.com",
        pathname: "**", // 모든 경로 허용
        
      },
    ],
    domains: [
      "gzfnhzdqyqzfytxkzceu.supabase.co",
      "i.ytimg.com",
    ],
  },
};

module.exports = nextConfig;
