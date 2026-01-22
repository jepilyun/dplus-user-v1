// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { reqGetGroupCodes, reqGetGroupDetail } from "@/req/req-group";
import CompGroupDetailPage from "@/components/group/comp-group-detail-page";
import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}): Promise<Metadata> {
  const { groupCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await reqGetGroupDetail(groupCode, langCode, 0, 36).catch(
    () => null
  );
  const groupDetail = response?.dbResponse?.groupDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "group",
    code: groupCode,
    detailName: groupDetail?.groupInfo?.name,
    metadata: groupDetail?.metadata,
    imageBucket: "groups",
  });
}

/*
 * Build 시점에 생성하고자 하는 페이지들의 parameter 반환
 * 항상 배열을 반환하도록 방어 코딩
 */
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
  // searchParams,
}: {
  params: Promise<{ groupCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { groupCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetGroupDetail(
      groupCode,
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
    if (!response?.success || isEmptyObj || !initialData?.groupDetail) {
      notFound();
    }

    return (
      <CompGroupDetailPage
        groupCode={groupCode}
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