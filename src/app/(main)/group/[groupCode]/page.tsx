// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompGroupDetailPage from "@/components/comp-group/comp-group-detail-page";
import { reqGetGroupCodes, reqGetGroupDetail } from "@/actions/action";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { LIST_LIMIT } from "dplus_common_v1";
import { notFound } from "next/navigation";



/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { groupCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const dict = getDplusI18n(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetGroupDetail(params.groupCode, langCode, 0, 36).catch(() => null);
  const data = response?.dbResponse?.group ?? null;
  const metadataI18n = response?.dbResponse?.metadataI18n?.[0] ?? null;
  
  const title = pick(metadataI18n?.title, data?.metadata_title, data?.name_native + " - " + data?.name, dict.metadata.title);
  const description = pick(
    metadataI18n?.description,
    data?.metadata_description,
    dict.metadata.description
  );
  const ogTitle = pick(metadataI18n?.og_title, data?.metadata_og_title, data?.name_native + " - " + data?.name, dict.metadata.og_title);
  const ogDesc = pick(
    metadataI18n?.og_description,
    data?.metadata_og_description,
    dict.metadata.og_description
  );
  const ogImage = pick(
    metadataI18n?.og_image, 
    data?.metadata_og_image, 
    data?.hero_image_01, 
    data?.hero_image_02,
    data?.hero_image_03,
    data?.hero_image_04,
    data?.hero_image_05,
    data?.thumbnail_main_01,
    data?.thumbnail_main_02,
    data?.thumbnail_main_03,
    data?.thumbnail_main_04,
    data?.thumbnail_main_05,
    data?.thumbnail_vertical_01,
    data?.thumbnail_vertical_02,
    data?.thumbnail_vertical_03,
    data?.thumbnail_vertical_04,
    data?.thumbnail_vertical_05,
    generateStorageImageUrl("service", "og_dplus_1200x630.jpg"),
    dict.metadata.og_image
  );

  const keywords = buildKeywords(
    metadataI18n?.tag_set as string[] | null | undefined,
    data?.metadata_keywords ?? null,
    dict.metadata.keywords
  );

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: ogImage, // string | string[] | OGImage[]
    },
    alternates: {
      canonical: `https://www.dplus.app/group/${params?.groupCode}`,
    },
  };
}


// ✅ 항상 배열을 반환하도록 방어 코딩
export async function generateStaticParams() {
  try {
    const res = await reqGetGroupCodes();
    const list = res?.dbResponse ?? []; // 없으면 빈 배열
    return list.map((cat: { group_code: string }) => ({
      groupCode: cat.group_code,
    }));
  } catch {
    return [];
  }
}

/**
 * Group 상세 페이지
 * @param params - Group Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: { groupCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetGroupDetail(
      params.groupCode,
      langCode,
      0,
      LIST_LIMIT.default
    );

    const initialData = response?.dbResponse ?? null;

    // ✅ 데이터 검증
    const isEmptyObj =
      !initialData || 
      (typeof initialData === "object" && !Array.isArray(initialData) && Object.keys(initialData).length === 0);

    // ✅ 응답이 없거나 실패한 경우 404
    if (!response?.success || isEmptyObj || !initialData?.group) {
      notFound();
    }

    return (
      <CompGroupDetailPage
        groupCode={params.groupCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch group detail:', error);
    notFound();
  }
}