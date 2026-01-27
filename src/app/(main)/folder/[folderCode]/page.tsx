// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 86400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchGetFolderDetail } from "@/api/folder/fetchFolder";
import CompFolderDetailPage from "@/components/folder/FolderDetailPage";
import { generateDetailMetadata } from "@/utils/metadata/generateMetadata";
import { getRequestLocale } from "@/utils/getRequestLocale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ folderCode: string }>;
}): Promise<Metadata> {
  const { folderCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await fetchGetFolderDetail(folderCode, langCode, 0, 36).catch(
    () => null
  );
  const folderDetail = response?.dbResponse?.folderDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "folder",
    code: folderCode,
    detailName: folderDetail?.folderInfo?.title,
    metadata: folderDetail?.metadata,
    imageBucket: "folders",
  });
}

/**
 * 폴더 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function FolderDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ folderCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { folderCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await fetchGetFolderDetail(
      folderCode, 
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
    if (!response?.success || isEmptyObj || !initialData?.folderDetail) {
      notFound();
    }

    return (
      <CompFolderDetailPage
        folderCode={folderCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch folder detail:', error);
    notFound();
  }
}