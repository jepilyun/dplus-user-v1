"use client";

import { reqGetStreetDetail } from "@/actions/action";
import Footer from "@/components/footer/footer";
import StreetContentList from "@/components/street/street-content-list";
import StreetHeader from "@/components/street/street-header";
import StreetYoutubeList from "@/components/street/street-youtube-list";
import ThemeRegistry from "@/components/theme-registry";
import TopNavCity from "@/components/top-nav/top-nav-city";
import { devLogResponse } from "@/utils/dev-log";
import { use, useEffect, useState } from "react";
import { TCompletedYouTubeVideoListForPublicFront, TContentListForPublicFrontList, TInstagramContent, TMapTypeAndContent, TMapTypeAndInstagram, TMapTypeAndSelectedContent, TMapTypeAndSelectedInstagram, TMapTypeAndSelectedYouTubeVideo, TMapTypeAndYouTubeVideo, TRelatedI18n, TRelatedMetadataI18n, TStreetDetail } from "trand_common_v1";

/**
 * StreetDetail
 * @param params - 도시 코드, 언어 코드, 거리 코드
 * @returns 
 */
export default function StreetDetail({ params }: { params: Promise<{ cityCode: string; langCode: string, streetCode: string }>}) {
  const { cityCode, langCode, streetCode } = use(params);

  const [streetDetail, setStreetDetail] = useState<TStreetDetail | null>(null);
  const [cityDetail, setCityDetail] = useState<{ name: string } | null>(null);
  const [i18n, setI18n] = useState<TRelatedI18n | null>(null);
  const [metadataI18n, setMetadataI18n] = useState<TRelatedMetadataI18n | null>(null);
  const [mapStreetContent, setMapStreetContent] = useState<{
    map: TMapTypeAndContent; 
    content: TContentListForPublicFrontList
  }[]>([]);
  const [mapStreetInstagram, setMapStreetInstagram] = useState<{
    map: TMapTypeAndInstagram;
    content: TInstagramContent
  }[]>([]);
  const [mapStreetSelectedContent, setMapStreetSelectedContent] = useState<TMapTypeAndSelectedContent[]>([]);
  const [mapStreetSelectedInstagram, setMapStreetSelectedInstagram] = useState<TMapTypeAndSelectedInstagram[]>([]);
  const [mapStreetSelectedYoutubeVideo, setMapStreetSelectedYoutubeVideo] = useState<TMapTypeAndSelectedYouTubeVideo[]>([]);
  const [mapStreetYoutubeVideo, setMapStreetYoutubeVideo] = useState<{
    map: TMapTypeAndYouTubeVideo;
    content: TCompletedYouTubeVideoListForPublicFront
  }[]>([]);

  const fetchData = async () => {
    const apiResponse = await reqGetStreetDetail(cityCode, streetCode, langCode);

    // 개발 환경에서 응답 데이터 크기와 내용을 로깅
    devLogResponse(apiResponse);

    if (apiResponse.success && apiResponse.dbResponse) {
      setStreetDetail(apiResponse.dbResponse.content);
      setCityDetail(apiResponse.dbResponse.cityDetail);
      setI18n(apiResponse.dbResponse.i18n || null);
      setMetadataI18n(apiResponse.dbResponse.metadataI18n || null);
      setMapStreetContent(apiResponse.dbResponse.mapStreetContent || []);
      setMapStreetInstagram(apiResponse.dbResponse.mapStreetInstagram || []);
      setMapStreetSelectedContent(apiResponse.dbResponse.mapStreetSelectedContent || []);
      setMapStreetSelectedInstagram(apiResponse.dbResponse.mapStreetSelectedInstagram || []);
      setMapStreetSelectedYoutubeVideo(apiResponse.dbResponse.mapStreetSelectedYouTubeVideo || []);
      setMapStreetYoutubeVideo(apiResponse.dbResponse.mapStreetYouTubeVideo || []);
    } else {
      setStreetDetail(null);
      setCityDetail(null);
      setI18n(null);
      setMetadataI18n(null);
      setMapStreetContent([]);
      setMapStreetInstagram([]);
      setMapStreetSelectedContent([]);
      setMapStreetSelectedInstagram([]);
      setMapStreetSelectedYoutubeVideo([]);
      setMapStreetYoutubeVideo([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [streetCode, langCode]);

  return (
    <ThemeRegistry>
      <TopNavCity cityName={cityDetail?.name || undefined} cityCode={cityCode} langCode={langCode} />
      {streetDetail && (
        <StreetHeader streetDetail={streetDetail} />
      )}
      {mapStreetYoutubeVideo.length > 0 && (
        <StreetYoutubeList youtubeVideos={mapStreetYoutubeVideo} showTitle={false} />
      )}
      {mapStreetContent.length > 0 && (
        <StreetContentList cityCode={cityCode} langCode={langCode} mapStreetContent={mapStreetContent} />
      )}

      <Footer />
    </ThemeRegistry>
  );
}
