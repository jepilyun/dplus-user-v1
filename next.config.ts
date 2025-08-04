import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      "aheyxxwhjwzgakynwmxj.supabase.co",
      "i.ytimg.com",
    ],
  },
};

export default nextConfig;
