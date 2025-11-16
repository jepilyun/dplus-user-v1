"use client";

import { ReactNode, useMemo } from "react";
import { InfoItem } from "@/components/info-item";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { Phone, Home, Mail, Ticket, Globe, ShoppingBag, Info, Tv, BadgeCheck } from "lucide-react";
import { IconYoutube } from "@/icons/icon-youtube";
import { IconInstagram } from "@/icons/icon-instagram";


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
  breakWords?: boolean;
};

export default function CompEventContactLinks({ event, langCode }: { event: TEventMinimal | null | undefined, langCode: string }) {
  const { inlineItems, boxItems } = useMemo(() => {
    if (!event) return { inlineItems: [], boxItems: [] };

    const inline: TLinkItem[] = [];
    const box: TLinkItem[] = [];

    const i18n = getDplusI18n(langCode);

    // 전화 - inline
    if (event.phone) {
      const intl = `${event.phone_country_code ? `+${event.phone_country_code} ` : ""}${event.phone}`;
      box.push({
        key: "phone",
        icon: <Phone className="h-8 w-8 text-gray-700" />,
        text: intl,
        href: toTelUrl(event.phone),
      });
    }

    // 이메일 - inline
    if (event.email) {
      box.push({
        key: "email",
        icon: <Mail className="h-8 w-8 text-gray-700" />,
        text: event.email,
        href: toMailUrl(event.email),
      });
    }

    // 홈페이지 - box
    if (event.homepage) {
      box.push({
        key: "homepage",
        icon: <Home className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.homepage,
        href: toAbsoluteUrl(event.homepage),
      });
    }

    // 유튜브 - box
    if (event.youtube_ch_id) {
      box.push({
        key: "youtube",
        icon: <IconYoutube className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.youtube,
        href: toYoutubeChannelUrl(event.youtube_ch_id),
      });
    }

    // 인스타그램 - box
    if (event.instagram_id) {
      box.push({
        key: "instagram",
        icon: <IconInstagram className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.instagram,
        href: toInstagramUrl(event.instagram_id),
      });
    }

    // 티켓 구매 - box
    if (event.ticket_purchase) {
      box.push({
        key: "ticket_purchase",
        icon: <Ticket className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.ticket_purchase,
        href: toAbsoluteUrl(event.ticket_purchase),
      });
    }

    // 기타 URL - box
    if (event.url) {
      box.push({
        key: "url",
        icon: <Globe className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.url,
        href: event.url,
      });
    }

    if (event.product_purchase) {
      box.push({
        key: "product_purchase",
        icon: <ShoppingBag className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.product_purchase,
        href: toAbsoluteUrl(event.product_purchase),
      });
    }

    if (event.detail_info_url) {
      box.push({
        key: "detail_info_url",
        icon: <Info className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.detail_info_url,
        href: toAbsoluteUrl(event.detail_info_url),
      });
    }

    if (event.watch_url) {
      box.push({
        key: "watch_url",
        icon: <Tv className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.watch_url,
        href: toAbsoluteUrl(event.watch_url),
      });
    }

    if (event.apply_url) {
      box.push({
        key: "apply_url",
        icon: <BadgeCheck className="h-8 w-8 text-gray-700" />,
        text: i18n.labels.apply_url,
        href: toAbsoluteUrl(event.apply_url),
      });
    }

    return { inlineItems: inline, boxItems: box };
  }, [event, langCode]);

  if (!inlineItems.length && !boxItems.length) return null;

  return (
    <section className="m-auto w-full max-w-[1280px]" aria-label="event contact & links section">
      <div className="rounded-xl bg-white/70 p-8 sm:p-12">
        {/* Inline items (전화, 이메일) */}
        {inlineItems.length > 0 && (
          <ul className="mb-8 space-y-4" aria-label="contact info">
            {inlineItems.map((it) => (
              <InfoItem
                key={it.key}
                icon={it.icon}
                text={it.text}
                href={it.href}
                variant="inline"
                {...(it.breakWords ? { breakWords: true } : {})}
              />
            ))}
          </ul>
        )}

        {/* Box items (홈페이지, SNS 등) */}
        {boxItems.length > 0 && (
          <ul
            className="flex flex-wrap items-center justify-center gap-4"
            aria-label="external links"
          >
            {boxItems.map((it) => (
              <InfoItem
                key={it.key}
                icon={it.icon}
                text={it.text}
                href={it.href}
                variant="box"
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}