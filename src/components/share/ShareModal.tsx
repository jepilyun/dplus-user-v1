"use client";

import { Dialog, IconButton } from "@mui/material";
import { openSocialShare, type SocialPlatform } from "@/utils/share/socialShare";
import { IconTwitter } from "@/icons/IconTwitter";
import { IconFacebook } from "@/icons/IconFacebook";
import { IconThreads } from "@/icons/IconThreads";
import { IconLinkedIn } from "@/icons/IconLinkedIn";
import { IconWhatsApp } from "@/icons/IconWhatsApp";
import { SUPPORT_LANG_CODES } from "dplus_common_v1";
import { getDplusI18n } from "@/utils/getDplusI18n";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  url: string;
  onShare?: (platform: SocialPlatform) => void; // 공유 완료 콜백
  langCode: string | null;
}

const socialPlatforms: { platform: SocialPlatform; icon: React.ReactNode; label: string; color: string }[] = [
  {
    platform: 'twitter',
    icon: <IconTwitter className="w-6 h-6" color="white" />,
    label: 'X (Twitter)',
    color: '#000000'
  },
  {
    platform: 'facebook',
    icon: <IconFacebook className="w-6 h-6" color="white" />,
    label: 'Facebook',
    color: '#1877F2'
  },
  {
    platform: 'threads',
    icon: <IconThreads className="w-6 h-6" color="white" />,
    label: 'Threads',
    color: '#000000'
  },
  {
    platform: 'linkedin',
    icon: <IconLinkedIn className="w-6 h-6" color="white" />,
    label: 'LinkedIn',
    color: '#0A66C2'
  },
  {
    platform: 'whatsapp',
    icon: <IconWhatsApp className="w-6 h-6" color="white" />,
    label: 'WhatsApp',
    color: '#25D366'
  }
];

export default function ShareModal({ open, onClose, title, text, url, onShare, langCode = 'en' }: ShareModalProps) {
  const modalTitle = getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share;
  const modalCopyLink = getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.copy_link;
  const modalLinkCopied = getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.link_copied;

  const handleShare = (platform: SocialPlatform) => {
    openSocialShare(platform, { title, text, url });
    onShare?.(platform); // 콜백 호출
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert(modalLinkCopied);
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 3
        }
      }}
    >
      <div className="flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{modalTitle}</h2>
          <IconButton onClick={onClose} size="small">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* 소셜 미디어 아이콘 그리드 */}
        <div className="grid grid-cols-3 gap-4">
          {socialPlatforms.map(({ platform, icon, label, color }) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <div className="flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </button>
          ))}
        </div>

        {/* 링크 복사 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            {modalCopyLink}
          </button>
        </div>
      </div>
    </Dialog>
  );
}