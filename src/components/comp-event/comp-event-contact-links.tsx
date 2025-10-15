"use client";

import { ReactNode, useMemo } from "react";
import { InfoItem } from "@/components/info-item";
import { IconMapPinRound } from "@/icons/icon-map-pin-round";
import { IconPhoneRound } from "@/icons/icon-phone-round";
import { IconHomepageRound } from "@/icons/icon-homepage-round";
import { IconEmailRound } from "@/icons/icon-email-round";
import { IconYoutubeRound } from "@/icons/icon-youtube-round";
import { IconInstagramRound } from "@/icons/icon-instagram-round";
import { IconWebsiteRound } from "@/icons/icon-website-round";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";

type TEventMinimal = {
  address_native?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  phone_country_code?: string | null;
  homepage?: string | null;
  email?: string | null;
  youtube_ch_id?: string | null;
  instagram_id?: string | null;
  url?: string | null;
};

type TLinkItem = {
  key: string;
  icon: ReactNode;
  text: string;
  href: string;
  breakWords?: boolean;
};

export default function CompEventContactLinks({ event }: { event: TEventMinimal | null | undefined }) {
  const items = useMemo<TLinkItem[]>(() => {
    if (!event) return [];

    const list: TLinkItem[] = [];

    // 주소
    if (event.address_native) {
      const href =
        event.latitude && event.longitude
          ? `https://maps.google.com/?q=${event.latitude},${event.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address_native)}`;
      list.push({
        key: "address",
        icon: <IconMapPinRound className="h-12 w-12 text-gray-700" />,
        text: event.address_native,
        href,
        breakWords: true,
      });
    }

    // 전화
    if (event.phone) {
      const intl = `${event.phone_country_code ? `+${event.phone_country_code} ` : ""}${event.phone}`;
      list.push({
        key: "phone",
        icon: <IconPhoneRound className="h-12 w-12 text-gray-700" />,
        text: intl,
        href: toTelUrl(event.phone),
      });
    }

    // 홈페이지
    if (event.homepage) {
      list.push({
        key: "homepage",
        icon: <IconHomepageRound className="h-12 w-12 text-gray-700" />,
        text: event.homepage.replace(/^https?:\/\//i, ""),
        href: toAbsoluteUrl(event.homepage),
      });
    }

    // 이메일
    if (event.email) {
      list.push({
        key: "email",
        icon: <IconEmailRound className="h-12 w-12 text-gray-700" />,
        text: event.email,
        href: toMailUrl(event.email),
      });
    }

    // 유튜브
    if (event.youtube_ch_id) {
      list.push({
        key: "youtube",
        icon: <IconYoutubeRound className="h-12 w-12 text-gray-700" />,
        text: "Youtube",
        href: toYoutubeChannelUrl(event.youtube_ch_id),
      });
    }

    // 인스타그램
    if (event.instagram_id) {
      list.push({
        key: "instagram",
        icon: <IconInstagramRound className="h-12 w-12 text-gray-700" />,
        text: "Instagram",
        href: toInstagramUrl(event.instagram_id),
      });
    }

    // 기타 URL
    if (event.url) {
      list.push({
        key: "url",
        icon: <IconWebsiteRound className="h-12 w-12 text-gray-700" />,
        text: "URL",
        href: event.url,
      });
    }

    return list;
  }, [event]);

  // 하나라도 있으면 섹션 표시, 없으면 null
  if (!items.length) return null;

  return (
    <section className="m-auto w-full max-w-[1280px]" aria-label="event contact & links section">
      <div className="rounded-xl bg-white/70 p-8 sm:p-12">
        <ul
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            gap-x-6 gap-y-6
          "
          aria-label="event contact & links"
        >
          {items.map((it) => (
            <InfoItem
              key={it.key}
              icon={it.icon}
              text={it.text}
              href={it.href}
              {...(it.breakWords ? { breakWords: true } : {})}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
