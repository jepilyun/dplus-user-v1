import { TCompletedYouTubeVideoListForPublicFront, TMapTypeAndYouTubeVideo } from "trand_common_v1";
import CardYoutubeTypeTwo from "../card/card-youtube-type-two";
import SectionTitle from "../section-title";

/**
 * Street Detail 페이지에서 유튜브 리스트 컴포넌트
 * @param youtubeVideos 유튜브 비디오 리스트
 * @returns 유튜브 리스트 컴포넌트
 */
export default function ContentYoutubeList({ youtubeVideos, titleSize = "text-3xl", showTitle = true }: { youtubeVideos: {
  map: TMapTypeAndYouTubeVideo;
  content: TCompletedYouTubeVideoListForPublicFront
}[], titleSize?: string, showTitle?: boolean }) {

  return (
    <div className="p-4">
      {showTitle && <SectionTitle title="How To Enjoy" titleSize={titleSize} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 gap-y-4">
        {youtubeVideos.map((youtubeVideo) => {
          return <CardYoutubeTypeTwo key={youtubeVideo.content.video_id} youtubeVideo={youtubeVideo.content} />;
        })}
      </div>
    </div>
  );
}


