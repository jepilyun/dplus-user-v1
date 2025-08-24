"use client";

import { TContentListForPublicFrontList } from "trand_common_v1";
import { generateContentImageUrl } from "@/utils/generate-image-url";
import { getRandomColor } from "@/utils/colors";
import { generateThumbnailLabel, getLabelColors } from "@/utils/generate-thumbnail-label";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import { usePathname } from "next/navigation";
import { gtagEvent } from "@/components/google-analytics";
import { Card, CardActions, CardMedia, Typography } from "@mui/material";
import CardContent from '@mui/material/CardContent';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ShareIcon from '@mui/icons-material/Share';
import LanguageIcon from '@mui/icons-material/Language';
import LaunchIcon from '@mui/icons-material/Launch';
import MapIcon from '@mui/icons-material/Map';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';


export default function CardTrandContent({ cityCode, langCode, content }: { cityCode: string, langCode: string, content: TContentListForPublicFrontList }) {
  const pathname = usePathname();
  const labels = [];

  if (content.label_1) labels.push(content.label_1);
  if (content.label_2) labels.push(content.label_2);
  if (content.label_3) labels.push(content.label_3);
  if (content.label_4) labels.push(content.label_4);
  if (content.label_5) labels.push(content.label_5);

  const hasImage = !!content.thumbnail_main_1;

  const handleCardClick = () => {
    gtagEvent("card_click", {
      card_name: "card-trand-content",
      page_path: pathname,
    });
  };

  return (
    <Card sx={{ maxWidth: '100%', position: 'relative', cursor: 'pointer', borderRadius: 2, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
      <Link href={`/city/${cityCode}/${langCode}/content/${content.content_code}`} onClick={handleCardClick}>
        <div style={{ position: 'relative' }}>
          {hasImage ? (
            <CardMedia
              component="img"
              height="194"
              image={generateContentImageUrl(content.thumbnail_main_1) || ""}
              alt={content.name}
            />
          ) : (
            <div
              className="w-full h-[194px] transition-transform duration-300 ease-in-out group-hover:scale-110"
              style={{ backgroundColor: getRandomColor() }}
            />
          )}
          {/* 🔽 오버레이 및 텍스트 */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              padding: '1rem',
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
              color: 'white',
            }}
          >

          {labels.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-30 font-poppins">
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
          </div>
        </div>
      </Link>

      <CardContent>
        <Link href={`/city/${cityCode}/${langCode}/content/${content.content_code}`} onClick={handleCardClick}>
          <div className="flex flex-col gap-1 h-full justify-end">
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', fontFamily: 'var(--font-poppins)' }}>
              {content.name}
            </Typography>
            <Typography
              variant="body2" // 기존보다 작은 텍스트
              sx={{
                color: 'text.disabled', // 더 연한 회색
                fontSize: '0.8rem',     // 선택사항: 명시적으로 더 작게
                fontFamily: 'var(--font-poppins)', // 스타일 통일
              }}
            >
              {content.native}
            </Typography>
          </div>
        </Link>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="save to google map">
          <LibraryAddIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        {content.website_en && (
          <Link href={content.website_en} target="_blank">
            <IconButton aria-label="website">
              <LanguageIcon />
            </IconButton>
          </Link>
        )}
        {content.instagram_id && (
          <Link href={`https://www.instagram.com/${content.instagram_id}`} target="_blank">
            <IconButton aria-label="instagram">
              <InstagramIcon />
            </IconButton>
          </Link>
        )}
        {content.youtube_ch_id && (
          <Link href={`https://www.youtube.com/channel/${content.youtube_ch_id}`} target="_blank">
            <IconButton aria-label="youtube">
              <YouTubeIcon />
            </IconButton>
          </Link>
        )}
        {content.google_place_url && (
          <Link href={content.google_place_url} target="_blank">
            <IconButton aria-label="google map">
              <MapIcon />
            </IconButton>
          </Link>
        )}
        {content.trip_advisor_url && (
          <Link href={content.trip_advisor_url} target="_blank">
            <IconButton aria-label="trip advisor">
              <LaunchIcon />
            </IconButton>
          </Link>
        )}
      </CardActions>
    </Card>
  );
}