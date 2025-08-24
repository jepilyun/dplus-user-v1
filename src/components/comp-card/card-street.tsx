"use client";

import { generateStreetImageUrl } from "@/utils/generate-image-url";
import { getRandomColor } from "@/utils/colors";
import Image from "next/image";
import { TStreetListForCityDetail } from "trand_common_v1";
import { generateThumbnailLabel, getLabelColors } from "@/utils/generate-thumbnail-label";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gtagEvent } from "@/components/google-analytics";


export default function CardStreet({ cityCode, langCode, street }: { cityCode: string, langCode: string, street: TStreetListForCityDetail }) {
  const pathname = usePathname();
  const labels = [];

  if (street.label_1) labels.push(street.label_1);
  if (street.label_2) labels.push(street.label_2);
  if (street.label_3) labels.push(street.label_3);
  if (street.label_4) labels.push(street.label_4);
  if (street.label_5) labels.push(street.label_5);

  const hasImage = !!street.thumbnail_main_1;

  const handleCardClick = () => {
    gtagEvent("card_click", {
      card_name: "card-street",
      page_path: pathname,
    });
  };

  return (
    <Link href={`/city/${cityCode}/${langCode}/street/${street.street_code}`} onClick={handleCardClick}>
      <div key={street.street_code} className="flex flex-col items-center">
        <div className="relative w-full h-48 rounded-md overflow-hidden group font-poppins">
          {/* 이미지 */}
          {hasImage ? (
            <Image
              src={generateStreetImageUrl(street.thumbnail_main_1) || ""}
              alt={street.name}
              fill
              className="transition-transform duration-300 ease-in-out group-hover:scale-105"
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
              style={{ backgroundColor: getRandomColor() }}
            />
          )}

          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 h-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

          {/* 라벨 */}
          {labels.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-2 z-30">
              {labels.map((label) => {
                const { backgroundColor, textColor } = getLabelColors(label);

                return (
                  <div key={label} className="text-xs font-bold rounded px-2 py-1"
                    style={{ backgroundColor: backgroundColor, color: textColor }}
                  >
                    {generateThumbnailLabel(label, null)}
                  </div>
                );
              })}
            </div>
          )}

          {/* 제목 텍스트 */}
          <div className="absolute bottom-4 left-4 right-2 z-20">
            <div className="text-white/90 text-xs leading-tight mb-1">
              {street.name_ko}
            </div>
            <div className="text-white text-xl font-bold leading-tight">
              {street.name}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}