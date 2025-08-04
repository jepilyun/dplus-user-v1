"use client";

import { reqGetContentDetail } from "@/actions/action";
import ContentHeader from "@/components/content/content-header";
import ContentYoutubeList from "@/components/content/content-youtube-list";
import Footer from "@/components/footer/footer";
import ThemeRegistry from "@/components/theme-registry";
import TopNavCity from "@/components/top-nav/top-nav-city";
import { devLogResponse } from "@/utils/dev-log";
import { use, useEffect, useState } from "react";
import { TCityDetail, TCompletedYouTubeVideoListForPublicFront, TContentDetail, TContentGPPhoto, TContentI18n, TContentImage, TContentKeyword, TContentListForPublicFrontList, TContentMetadataI18n, TContentPrice, TContentShowTimetable, TInstagramContent, TMapContentAndInstagram, TMapContentAndSelectedInstagram, TMapContentAndSelectedYouTubeVideo, TMapContentAndYouTubeVideo, TMapTagAndContent, TMapTypeAndContent, TMapTypeAndInstagram, TMapTypeAndSelectedContent, TMapTypeAndSelectedInstagram, TMapTypeAndSelectedYouTubeVideo, TMapTypeAndYouTubeVideo, TRelatedI18n, TRelatedMetadataI18n, TStagListForContentDetail, TStreetDetail, TTag } from "trand_common_v1";

/**
 * ContentDetail
 * @param params - 도시 코드, 언어 코드, 콘텐츠 코드
 * @returns 
 */
export default function ContentDetail({ params }: { params: Promise<{ cityCode: string; langCode: string, contentCode: string }>}) {
  const { cityCode, langCode, contentCode } = use(params);

  const [contentDetail, setContentDetail] = useState<TContentDetail | null>(null);
  const [cityDetail, setCityDetail] = useState<TCityDetail | null>(null);
  const [showTimetable, setShowTimetable] = useState<TContentShowTimetable[]>([]);
  const [price, setPrice] = useState<TContentPrice[]>([]);
  const [image, setImage] = useState<TContentImage[]>([]);
  const [i18n, setI18n] = useState<TContentI18n | null>(null);
  const [metadataI18n, setMetadataI18n] = useState<TContentMetadataI18n | null>(null);
  const [keyword, setKeyword] = useState<TContentKeyword[]>([]);
  const [gpPhoto, setGPPhoto] = useState<TContentGPPhoto[]>([]);
  const [mapContentInstagram, setMapContentInstagram] = useState<{
    map: TMapContentAndInstagram;
    content: TInstagramContent;
  }[]>([]);
  const [mapContentSelectedInstagram, setMapContentSelectedInstagram] = useState<TMapContentAndSelectedInstagram[]>([]);
  const [mapContentSelectedYouTubeVideo, setMapContentSelectedYouTubeVideo] = useState<TMapContentAndSelectedYouTubeVideo[]>([]);
  const [mapContentYoutubeVideo, setMapContentYoutubeVideo] = useState<{
    map: TMapContentAndYouTubeVideo;
    content: TCompletedYouTubeVideoListForPublicFront
  }[]>([]);
  const [mapContentStag, setMapContentStag] = useState<{
    map: TMapTypeAndContent; 
    content: TStagListForContentDetail;
  }[]>([]);
  const [mapContentTag, setMapContentTag] = useState<{
    map: TMapTagAndContent;
    content: TTag;
  }[]>([]);

  const fetchData = async () => {
    const apiResponse = await reqGetContentDetail(cityCode, contentCode, langCode);

    // 개발 환경에서 응답 데이터 크기와 내용을 로깅
    devLogResponse(apiResponse);

    if (apiResponse.success && apiResponse.dbResponse) {
      setContentDetail(apiResponse.dbResponse.content);
      setCityDetail(apiResponse.dbResponse.cityDetail);
      setShowTimetable(apiResponse.dbResponse.showTimetable || []);
      setPrice(apiResponse.dbResponse.price || []);
      setImage(apiResponse.dbResponse.image || []);
      setKeyword(apiResponse.dbResponse.keyword || []);
      setGPPhoto(apiResponse.dbResponse.gpPhoto || []);
      setI18n(apiResponse.dbResponse.i18n || null);
      setMetadataI18n(apiResponse.dbResponse.metadataI18n || null);
      setMapContentInstagram(apiResponse.dbResponse.mapContentInstagram || []);
      setMapContentSelectedInstagram(apiResponse.dbResponse.mapContentSelectedInstagram || []);
      setMapContentSelectedYouTubeVideo(apiResponse.dbResponse.mapContentSelectedYouTubeVideo || []);
      setMapContentYoutubeVideo(apiResponse.dbResponse.mapContentYouTubeVideo || []);
      setMapContentStag(apiResponse.dbResponse.mapContentStag || []);
      setMapContentTag(apiResponse.dbResponse.mapContentTag || []);
    } else {
      setContentDetail(null);
      setCityDetail(null);
      setShowTimetable([]);
      setPrice([]);
      setImage([]);
      setKeyword([]);
      setGPPhoto([]);
      setI18n(null);
      setMetadataI18n(null);
      setMapContentInstagram([]);
      setMapContentSelectedInstagram([]);
      setMapContentSelectedYouTubeVideo([]);
      setMapContentYoutubeVideo([]);
      setMapContentStag([]);
      setMapContentTag([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contentCode, langCode]);

  return (
    <ThemeRegistry>
      <TopNavCity cityName={cityDetail?.name || undefined} cityCode={cityCode} langCode={langCode} />
      {contentDetail && (
        <ContentHeader contentDetail={contentDetail} />
      )}
      {mapContentYoutubeVideo.length > 0 && (
        <ContentYoutubeList youtubeVideos={mapContentYoutubeVideo} showTitle={false} />
      )}

      <Footer />
    </ThemeRegistry>
  );
}
