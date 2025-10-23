import { DplusLogo } from "@/resources/dplus-logo";
import Link from "next/link";

// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

/**
 * Not Found 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function NotFoundPage() {
  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <div className="flex flex-col gap-8 justify-center items-center py-20">
      <Link href="/" className="px-6 py-2 rounded">
        <DplusLogo className="w-24 h-24 mb-4" />
      </Link>
      <h1 className="text-2xl font-bold mb-4">Not Found</h1>
      <p className="text-gray-600 mb-6">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        홈 화면으로 이동
      </Link>
    </div>
  );
}