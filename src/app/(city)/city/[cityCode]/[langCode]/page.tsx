"use client";

import { reqGetCityDetail } from "@/actions/action";
import CityHeader from "@/components/city/city-header";
import CityStreetList from "@/components/city/city-street-list";
import Footer from "@/components/footer/footer";
import ThemeRegistry from "@/components/theme-registry";
import CityTopCategories from "@/components/city/city-top-categories";
import TopNavCity from "@/components/top-nav/top-nav-city";
import { use, useEffect, useState } from "react";
import { TCategoryOption, TCityDetail, TCompletedYouTubeVideoListForPublicFront, TContentListForPublicFrontList, TInstagramContent, TMapTypeAndContent, TMapTypeAndInstagram, TMapTypeAndSelectedContent, TMapTypeAndSelectedInstagram, TMapTypeAndSelectedYouTubeVideo, TMapTypeAndYouTubeVideo, TRelatedI18n, TRelatedMetadataI18n, TStreetListForCityDetail } from "trand_common_v1";
import CityYoutubeList from "@/components/city/city-youtube-list";
import { devLogResponse } from "@/utils/dev-log";

/**
 * CityHome
 * @param params - 도시 코드와 언어 코드
 * @returns 
 */
export default function CityHome({ params }: { params: Promise<{ cityCode: string; langCode: string }>}) {
  const { cityCode, langCode } = use(params);

  const [cityDetail, setCityDetail] = useState<TCityDetail | null>(null);
  const [categories, setCategories] = useState<TCategoryOption[]>([]);
  const [i18n, setI18n] = useState<TRelatedI18n | null>(null);
  const [metadataI18n, setMetadataI18n] = useState<TRelatedMetadataI18n | null>(null);
  const [mapCityContent, setMapCityContent] = useState<{
    map: TMapTypeAndContent; 
    content: TContentListForPublicFrontList
  }[]>([]);
  const [mapCityInstagram, setMapCityInstagram] = useState<{
    map: TMapTypeAndInstagram;
    content: TInstagramContent
  }[]>([]);
  const [mapCitySelectedContent, setMapCitySelectedContent] = useState<TMapTypeAndSelectedContent[]>([]);
  const [mapCitySelectedInstagram, setMapCitySelectedInstagram] = useState<TMapTypeAndSelectedInstagram[]>([]);
  const [mapCitySelectedYoutubeVideo, setMapCitySelectedYoutubeVideo] = useState<TMapTypeAndSelectedYouTubeVideo[]>([]);
  const [mapCityYoutubeVideo, setMapCityYoutubeVideo] = useState<{
    map: TMapTypeAndYouTubeVideo;
    content: TCompletedYouTubeVideoListForPublicFront
  }[]>([]);
  const [streets, setStreets] = useState<TStreetListForCityDetail[]>([]);

  const fetchData = async () => {
    const apiResponse = await reqGetCityDetail(cityCode, langCode);

    // 개발 환경에서 응답 데이터 크기와 내용을 로깅
    devLogResponse(apiResponse);

    if (apiResponse.success && apiResponse.dbResponse) {
      setCityDetail(apiResponse.dbResponse.content);
      setCategories(apiResponse.dbResponse.categories || []);
      setI18n(apiResponse.dbResponse.i18n || null);
      setMetadataI18n(apiResponse.dbResponse.metadataI18n || null);
      setMapCityContent(apiResponse.dbResponse.mapCityContent || []);
      setMapCityInstagram(apiResponse.dbResponse.mapCityInstagram || []);
      setMapCitySelectedContent(apiResponse.dbResponse.mapCitySelectedContent || []);
      setMapCitySelectedInstagram(apiResponse.dbResponse.mapCitySelectedInstagram || []);
      setMapCitySelectedYoutubeVideo(apiResponse.dbResponse.mapCitySelectedYouTubeVideo || []);
      setMapCityYoutubeVideo(apiResponse.dbResponse.mapCityYouTubeVideo || []);
      setStreets(apiResponse.dbResponse.streets || []);
    } else {
      setCityDetail(null);
      setCategories([]);
      setI18n(null);
      setMetadataI18n(null);
      setMapCityContent([]);
      setMapCityInstagram([]);
      setMapCitySelectedContent([]);
      setMapCitySelectedInstagram([]);
      setMapCitySelectedYoutubeVideo([]);
      setMapCityYoutubeVideo([]);
      setStreets([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cityCode, langCode]);

  return (
    <ThemeRegistry>
      <TopNavCity />
      {cityDetail && (
        <CityHeader cityDetail={cityDetail} i18n={i18n} />
      )}
      {categories.length > 0 && (
        <CityTopCategories cityCode={cityCode} langCode={langCode} categories={categories} />
      )}
      {mapCityYoutubeVideo.length > 0 && (
        <CityYoutubeList youtubeVideos={mapCityYoutubeVideo} />
      )}
      {streets.length > 0 && (
        <CityStreetList cityCode={cityCode} langCode={langCode} streets={streets} />
      )}
      {mapCityContent.length > 0 && (
        <div>
          <h1>{JSON.stringify(mapCityContent)}</h1>
        </div>
      )}

      {mapCityInstagram.length > 0 && (
        <div>
          <h1>{JSON.stringify(mapCityInstagram)}</h1>
        </div>
      )}
      {mapCitySelectedContent.length > 0 && (
        <div>
          <h1>{JSON.stringify(mapCitySelectedContent)}</h1>
        </div>
      )
      }
      {mapCitySelectedInstagram.length > 0 && (
        <div>
          <h1>{JSON.stringify(mapCitySelectedInstagram)}</h1>
        </div>
      )
      }
      {mapCitySelectedYoutubeVideo.length > 0 && (
        <div> 
          <h1>{JSON.stringify(mapCitySelectedYoutubeVideo)}</h1>
        </div>
      )
      }

      {i18n && (
        <div>
          <h1>{JSON.stringify(i18n)}</h1>
        </div>
      )
      }
      {metadataI18n && ( 
        <div>
          <h1>{JSON.stringify(metadataI18n)}</h1>
        </div>
      )
      }
      
      <Footer />
    </ThemeRegistry>
  );
}
