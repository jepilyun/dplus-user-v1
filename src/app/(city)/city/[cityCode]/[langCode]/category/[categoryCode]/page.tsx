"use client";

import { reqGetCategoryDetailByCityCode } from "@/actions/action";
import Footer from "@/components/footer/footer";
import ThemeRegistry from "@/components/theme-registry";
import TopNavCity from "@/components/top-nav/top-nav-city";
import { use, useEffect, useState } from "react";
import { TCategoryDetail, TCategoryListForAdmin, TCompletedYouTubeVideoListForPublicFront, TContentListForPublicFrontList, TInstagramContent, TMapTypeAndContent, TMapTypeAndInstagram, TMapTypeAndSelectedContent, TMapTypeAndSelectedInstagram, TMapTypeAndSelectedYouTubeVideo, TMapTypeAndYouTubeVideo, TRelatedI18n, TRelatedMetadataI18n } from "trand_common_v1";
import CategoryContentList from "@/components/category/category-content-list";
import { getTopCategoryBGColor } from "@/utils/colors";
import CategoryYoutubeList from "@/components/category/category-youtube-list";
import { devLogResponse } from "@/utils/dev-log";

/**
 * CategoryHome
 * @param params - 도시 코드, 언어 코드, 카테고리 코드
 * @returns 
 */
export default function CategoryHome({ params }: { params: Promise<{ cityCode: string; langCode: string; categoryCode: string }>}) {
  const { cityCode, langCode, categoryCode } = use(params);

  const [categoryDetail, setCategoryDetail] = useState<TCategoryDetail | null>(null);
  const [cityDetail, setCityDetail] = useState<{ name: string } | null>(null);
  const [subCategories, setSubCategories] = useState<TCategoryListForAdmin[]>([]);
  const [i18n, setI18n] = useState<TRelatedI18n | null>(null);
  const [metadataI18n, setMetadataI18n] = useState<TRelatedMetadataI18n | null>(null);
  const [mapCategoryContent, setMapCategoryContent] = useState<{
    map: TMapTypeAndContent; 
    content: TContentListForPublicFrontList
  }[]>([]);
  const [mapCategoryInstagram, setMapCategoryInstagram] = useState<{
    map: TMapTypeAndInstagram;
    content: TInstagramContent
  }[]>([]);
  const [mapCategorySelectedContent, setMapCategorySelectedContent] = useState<TMapTypeAndSelectedContent[]>([]);
  const [mapCategorySelectedInstagram, setMapCategorySelectedInstagram] = useState<TMapTypeAndSelectedInstagram[]>([]);
  const [mapCategorySelectedYoutubeVideo, setMapCategorySelectedYoutubeVideo] = useState<TMapTypeAndSelectedYouTubeVideo[]>([]);
  const [mapCategoryYoutubeVideo, setMapCategoryYoutubeVideo] = useState<{
    map: TMapTypeAndYouTubeVideo;
    content: TCompletedYouTubeVideoListForPublicFront
  }[]>([]);

  const fetchData = async () => {
    const apiResponse = await reqGetCategoryDetailByCityCode(cityCode, categoryCode, langCode);

    // 개발 환경에서 응답 데이터 크기와 내용을 로깅
    devLogResponse(apiResponse);

    if (apiResponse.success && apiResponse.dbResponse) {
      setCategoryDetail(apiResponse.dbResponse.content);
      setCityDetail(apiResponse.dbResponse.cityDetail);
      setSubCategories(apiResponse.dbResponse.subCategories || []);
      setI18n(apiResponse.dbResponse.i18n || null);
      setMetadataI18n(apiResponse.dbResponse.metadataI18n || null);
      setMapCategoryContent(apiResponse.dbResponse.mapCategoryContent || []);
      setMapCategoryInstagram(apiResponse.dbResponse.mapCategoryInstagram || []);
      setMapCategorySelectedContent(apiResponse.dbResponse.mapCategorySelectedContent || []);
      setMapCategorySelectedInstagram(apiResponse.dbResponse.mapCategorySelectedInstagram || []);
      setMapCategorySelectedYoutubeVideo(apiResponse.dbResponse.mapCategorySelectedYouTubeVideo || []);
      setMapCategoryYoutubeVideo(apiResponse.dbResponse.mapCategoryYouTubeVideo || []);
    } else {
      setCategoryDetail(null);
      setCityDetail(null);
      setSubCategories([]);
      setI18n(null);
      setMetadataI18n(null);
      setMapCategoryContent([]);
      setMapCategoryInstagram([]);
      setMapCategorySelectedContent([]);
      setMapCategorySelectedInstagram([]);
      setMapCategorySelectedYoutubeVideo([]);
      setMapCategoryYoutubeVideo([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryCode, langCode]);

  return (
    <ThemeRegistry>
      <TopNavCity cityName={cityDetail?.name || undefined} cityCode={cityCode} langCode={langCode} />
      {categoryDetail && (
        <div className="mx-4 font-poppins" 
          style={{
            backgroundColor: getTopCategoryBGColor(categoryCode), 
            color: 'white',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '1rem',
          }}
        >
          {categoryDetail.name}
        </div>
      )}
      {/* {subCategories.map((subCategory) => (
        <div key={subCategory.category_code}>
          {subCategory.name} {subCategory.name_ko}
        </div>
      ))} */}
      {mapCategoryYoutubeVideo.length > 0 && (
        <CategoryYoutubeList youtubeVideos={mapCategoryYoutubeVideo} showTitle={false} />
      )}
      {mapCategoryContent.length > 0 && (
        <CategoryContentList cityCode={cityCode} langCode={langCode} mapCategoryContent={mapCategoryContent} />
      )}
      <Footer />
    </ThemeRegistry>
  );
}
