"use client";

import { ReactNode, useMemo } from "react";
import { InfoItem } from "@/components/info-item";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { Phone, Home, Mail, Ticket, Globe, ShoppingBag, Info, Tv, BadgeCheck } from "lucide-react";
import { IconYoutube } from "@/icons/icon-youtube";
import { IconInstagram } from "@/icons/icon-instagram";
import { TEventDescription } from "dplus_common_v1";

type TEventMinimal = {
  phone?: string | null;
  phone_country_code?: string | null;
  email?: string | null;
  homepage?: string | null;
  youtube_ch_id?: string | null;
  instagram_id?: string | null;
  url?: string | null;
  ticket_purchase?: string | null;
  product_purchase?: string | null;
  detail_info_url?: string | null;
  watch_url?: string | null;
  apply_url?: string | null;
};

type TLinkItem = {
  key: string;
  icon: ReactNode;
  text: string;
  href: string;
};

/**
 * URL에서 프로토콜, 경로, 끝의 슬래시 제거 (도메인만 표시)
 * @param url 원본 URL
 * @returns 정리된 URL (도메인만)
 */
const cleanUrl = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    // URL 파싱 실패 시 수동 처리
    return url
      .replace(/^https?:\/\//, '')  // http:// 또는 https:// 제거
      .replace(/\/.*$/, '')          // 첫 번째 / 이후 전부 제거
      .replace(/\/$/, '');           // 마지막 / 제거
  }
};

export default function CompEventContactLinks({ 
  eventDescription, 
  langCode 
}: { 
  eventDescription: TEventDescription | null;
  langCode: string;
}) {
  const links = useMemo(() => {
    if (!eventDescription) return [];

    const items: TLinkItem[] = [];
    const i18n = getDplusI18n(langCode);

    if (eventDescription.phone) {
      const phoneText = `${eventDescription.phone_country_code ? `+${eventDescription.phone_country_code} ` : ""}${eventDescription.phone}`;
      items.push({
        key: "phone",
        icon: <Phone className="h-5 w-5" />,
        text: phoneText,
        href: toTelUrl(eventDescription.phone),
      });
    }

    if (eventDescription.email) {
      items.push({
        key: "email",
        icon: <Mail className="h-5 w-5" />,
        text: eventDescription.email,
        href: toMailUrl(eventDescription.email),
      });
    }

    if (eventDescription.homepage) {
      items.push({
        key: "homepage",
        icon: <Home className="h-5 w-5" />,
        text: cleanUrl(eventDescription.homepage),
        href: toAbsoluteUrl(eventDescription.homepage),
      });
    }

    if (eventDescription.youtube_ch_id) {
      items.push({
        key: "youtube",
        icon: <IconYoutube className="h-5 w-5" />,
        text: i18n.labels.youtube,
        href: toYoutubeChannelUrl(eventDescription.youtube_ch_id),
      });
    }

    if (eventDescription.instagram_id) {
      items.push({
        key: "instagram",
        icon: <IconInstagram className="h-5 w-5" />,
        text: eventDescription.instagram_id,
        href: toInstagramUrl(eventDescription.instagram_id),
      });
    }

    if (eventDescription.ticket_purchase) {
      items.push({
        key: "ticket_purchase",
        icon: <Ticket className="h-5 w-5" />,
        text: cleanUrl(eventDescription.ticket_purchase),
        href: toAbsoluteUrl(eventDescription.ticket_purchase),
      });
    }

    if (eventDescription.url) {
      items.push({
        key: "url",
        icon: <Globe className="h-5 w-5" />,
        text: cleanUrl(eventDescription.url),
        href: eventDescription.url,
      });
    }

    if (eventDescription.product_purchase) {
      items.push({
        key: "product_purchase",
        icon: <ShoppingBag className="h-5 w-5" />,
        text: cleanUrl(eventDescription.product_purchase),
        href: toAbsoluteUrl(eventDescription.product_purchase),
      });
    }

    if (eventDescription.detail_info_url) {
      items.push({
        key: "detail_info_url",
        icon: <Info className="h-5 w-5" />,
        text: cleanUrl(eventDescription.detail_info_url),
        href: toAbsoluteUrl(eventDescription.detail_info_url),
      });
    }

    if (eventDescription.watch_url) {
      items.push({
        key: "watch_url",
        icon: <Tv className="h-5 w-5" />,
        text: cleanUrl(eventDescription.watch_url),
        href: toAbsoluteUrl(eventDescription.watch_url),
      });
    }

    if (eventDescription.apply_url) {
      items.push({
        key: "apply_url",
        icon: <BadgeCheck className="h-5 w-5" />,
        text: cleanUrl(eventDescription.apply_url),
        href: toAbsoluteUrl(eventDescription.apply_url),
      });
    }

    return items;
  }, [eventDescription, langCode]);

  if (links.length === 0) return null;

  return (
    <div className="m-auto w-full max-w-[840px] text-gray-800">
      <ul className="space-y-4">
        {links.map((item) => (
          <InfoItem
            key={item.key}
            icon={item.icon}
            text={item.text}
            href={item.href}
          />
        ))}
      </ul>
    </div>
  );
}