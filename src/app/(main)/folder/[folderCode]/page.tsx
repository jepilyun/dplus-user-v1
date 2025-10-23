// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 86400; // 24시간 × 60분 × 60초 = 86400초

import { getRequestLocale } from "@/utils/get-request-locale";
import CompFolderDetailPage from "@/components/comp-folder/comp-folder-detail-page";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { reqGetFolderCodeList, reqGetFolderMetadata } from "@/actions/action";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { folderCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const dict = getDplusI18n(langCode);

  // API 호출 (에러 대비 안전가드)
  const api = await reqGetFolderMetadata(params.folderCode, langCode).catch(() => null);
  const m = api?.dbResponse ?? null;

  const title = pick(m?.metadata_i18n_title, m?.metadata_title, dict.metadata.title);
  const description = pick(
    m?.metadata_i18n_description,
    m?.metadata_description,
    dict.metadata.description
  );
  const ogTitle = pick(m?.metadata_i18n_og_title, m?.metadata_og_title, dict.metadata.og_title);
  const ogDesc = pick(
    m?.metadata_i18n_og_description,
    m?.metadata_og_description,
    dict.metadata.og_description
  );
  const ogImage = pick(m?.metadata_i18n_og_image, m?.metadata_og_image, dict.metadata.og_image);

  const keywords = buildKeywords(
    m?.metadata_i18n_tag_set as string[] | null | undefined,
    m?.metadata_keywords ?? null,
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
      canonical: `https://www.dplus.app/folder/${params?.folderCode}`,
    },
  };
}


// ✅ 항상 배열을 반환하도록 방어 코딩
export async function generateStaticParams() {
  try {
    const res = await reqGetFolderCodeList(100);
    const list = res?.dbResponse ?? []; // 없으면 빈 배열

    return list.map((folder: { folder_code: string }) => ({
      folderCode: folder.folder_code,
    }));
  } catch {
    return []; // 실패해도 배열 반환
  }
}

/**
 * 폴더 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function FolderDetailPage({
  params,
  searchParams,
}: {
  params: { folderCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompFolderDetailPage
      folderCode={params.folderCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}