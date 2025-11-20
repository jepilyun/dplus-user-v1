// next.config.js

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Concrete Playground
      {
        protocol: "https",
        hostname: "cdn.concreteplayground.com",
        pathname: "/**",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "gzfnhzdqyqzfytxkzceu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // YouTube Thumbnails
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
  },
  // ✅ Next.js의 자동 스크롤 복원 비활성화
  experimental: {
    scrollRestoration: false,
  },
};

module.exports = nextConfig;