"use client";

import { IconTwitter } from "@/icons/icon-twitter";
import { IconThreads } from "@/icons/icon-threads";
import { IconFacebook } from "@/icons/icon-facebook";
import { IconInstagram } from "@/icons/icon-instagram";

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/dplus_app",
    icon: <IconInstagram className="w-6 h-6" color="white" />,  // ✅ className 추가
    bgColor: "bg-black/80 hover:bg-black/90",
  },
  {
    name: "Twitter/X",
    url: "https://x.com/dplusapp",
    icon: <IconTwitter className="w-6 h-6" color="white" />,  // ✅ className 추가
    bgColor: "bg-black/80 hover:bg-black/90",
  },
  {
    name: "Threads",
    url: "https://www.threads.com/@dplus_app",
    icon: <IconThreads className="w-6 h-6" color="white" />,  // ✅ className 추가
    bgColor: "bg-black/80 hover:bg-black/90",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61575656837759",
    icon: <IconFacebook className="w-6 h-6" color="white" />,  // ✅ className 추가
    bgColor: "bg-black/80 hover:bg-black/90",
  },
];

export default function CompFooter() {
  return (
    <footer className="mt-12 border-t border-gray-200">
      {/* 소셜 미디어 링크 */}
      <div className="flex flex-wrap justify-center gap-6 py-8">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 flex items-center justify-center rounded-full ${social.bgColor} transition-opacity`}
            aria-label={social.name}
          >
            {/* ✅ 추가 래퍼로 강제 중앙 정렬 */}
            <div className="w-6 h-6 flex items-center justify-center">
              {social.icon}
            </div>
          </a>
        ))}
      </div>

      {/* 기존 푸터 정보 */}
      <div className="flex flex-col gap-3 md:flex-row justify-between items-center p-6 px-8 font-footer text-sm font-poppins">
        <div className="text-center text-sm md:text-left">
          Copyright 2025 dplus. All rights reserved.
        </div>
        <div className="text-center text-sm md:text-right">
          support@dplus.app
        </div>
      </div>
    </footer>
  );
}