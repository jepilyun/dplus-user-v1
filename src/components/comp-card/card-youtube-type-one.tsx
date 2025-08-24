import { getRandomColor } from "@/utils/colors";
import Image from "next/image";
import { TCompletedYouTubeVideoListForPublicFront } from "trand_common_v1";
import Link from "next/link";
import { IconYoutubeRound } from "@/icons/icon-youtube-round";

export default function CardYoutubeTypeOne({ youtubeVideo }: { youtubeVideo: TCompletedYouTubeVideoListForPublicFront }) {

  return (
    <Link href={`https://www.youtube.com/watch?v=${youtubeVideo.video_id}`} target="_blank">
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
        <div className="relative w-full h-48 overflow-hidden group">
          {/* 이미지 */}
          {youtubeVideo.thumbnail_maxres ? (
            <Image
              src={youtubeVideo.thumbnail_maxres}
              alt={youtubeVideo.video_title || "YouTube video thumbnail"}
              fill
              className="transition-transform duration-300 ease-in-out group-hover:scale-105 object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105"
              style={{ backgroundColor: getRandomColor() }}
            >
              <div className="text-white text-lg font-semibold opacity-70">
                No Image
              </div>
            </div>
          )}
          
          {/* YouTube 플레이 아이콘 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconYoutubeRound />
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 
            className="text-sm font-medium text-gray-700 leading-5 line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "2.5rem", // 두 줄 높이 보장
            }}
            title={youtubeVideo.video_title || ""}
          >
            {youtubeVideo.video_title || "제목 없음"}
          </h3>
        </div>
      </div>
    </Link>
  );
}