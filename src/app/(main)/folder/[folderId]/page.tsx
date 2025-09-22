import { getRequestLocale } from "@/utils/get-req-locale";
import CompFolderDetailPage from "@/components/comp-folder/comp-folder-detail-page";

export default async function FolderDetailPage({
  params,
  searchParams,
}: {
  params: { folderId: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompFolderDetailPage
      folderId={params.folderId}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}