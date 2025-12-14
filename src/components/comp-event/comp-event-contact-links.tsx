"use client";

import { ReactNode, useMemo } from "react";
import { InfoItem } from "@/components/info-item";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { Phone, Home, Mail, Ticket, Globe, ShoppingBag, Info, Tv, BadgeCheck } from "lucide-react";
import { IconYoutube } from "@/icons/icon-youtube";
import { IconInstagram } from "@/icons/icon-instagram";

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
  event, 
  langCode 
}: { 
  event: TEventMinimal | null | undefined;
  langCode: string;
}) {
  const links = useMemo(() => {
    if (!event) return [];

    const items: TLinkItem[] = [];
    const i18n = getDplusI18n(langCode);

    if (event.phone) {
      const phoneText = `${event.phone_country_code ? `+${event.phone_country_code} ` : ""}${event.phone}`;
      items.push({
        key: "phone",
        icon: <Phone className="h-5 w-5" />,
        text: phoneText,
        href: toTelUrl(event.phone),
      });
    }

    if (event.email) {
      items.push({
        key: "email",
        icon: <Mail className="h-5 w-5" />,
        text: event.email,
        href: toMailUrl(event.email),
      });
    }

    if (event.homepage) {
      items.push({
        key: "homepage",
        icon: <Home className="h-5 w-5" />,
        text: cleanUrl(event.homepage),
        href: toAbsoluteUrl(event.homepage),
      });
    }

    if (event.youtube_ch_id) {
      items.push({
        key: "youtube",
        icon: <IconYoutube className="h-5 w-5" />,
        text: i18n.labels.youtube,
        href: toYoutubeChannelUrl(event.youtube_ch_id),
      });
    }

    if (event.instagram_id) {
      items.push({
        key: "instagram",
        icon: <IconInstagram className="h-5 w-5" />,
        text: event.instagram_id,
        href: toInstagramUrl(event.instagram_id),
      });
    }

    if (event.ticket_purchase) {
      items.push({
        key: "ticket_purchase",
        icon: <Ticket className="h-5 w-5" />,
        text: cleanUrl(event.ticket_purchase),
        href: toAbsoluteUrl(event.ticket_purchase),
      });
    }

    if (event.url) {
      items.push({
        key: "url",
        icon: <Globe className="h-5 w-5" />,
        text: cleanUrl(event.url),
        href: event.url,
      });
    }

    if (event.product_purchase) {
      items.push({
        key: "product_purchase",
        icon: <ShoppingBag className="h-5 w-5" />,
        text: cleanUrl(event.product_purchase),
        href: toAbsoluteUrl(event.product_purchase),
      });
    }

    if (event.detail_info_url) {
      items.push({
        key: "detail_info_url",
        icon: <Info className="h-5 w-5" />,
        text: cleanUrl(event.detail_info_url),
        href: toAbsoluteUrl(event.detail_info_url),
      });
    }

    if (event.watch_url) {
      items.push({
        key: "watch_url",
        icon: <Tv className="h-5 w-5" />,
        text: cleanUrl(event.watch_url),
        href: toAbsoluteUrl(event.watch_url),
      });
    }

    if (event.apply_url) {
      items.push({
        key: "apply_url",
        icon: <BadgeCheck className="h-5 w-5" />,
        text: cleanUrl(event.apply_url),
        href: toAbsoluteUrl(event.apply_url),
      });
    }

    return items;
  }, [event, langCode]);

  if (links.length === 0) return null;

  return (
    <div className="m-auto w-full max-w-[840px] ">
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