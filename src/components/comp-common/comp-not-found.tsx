// components/comp-common/comp-not-found.tsx
"use client";

import { useRouter } from "next/navigation";

interface CompNotFoundProps {
  title?: string;
  message?: string;
  returnPath?: string;
  returnLabel?: string;
}

export function CompNotFound({
  title = "Not Found",
  message = "요청하신 페이지를 찾을 수 없습니다.",
  returnPath,
  returnLabel = "홈 화면으로 이동",
}: CompNotFoundProps) {
  const router = useRouter();

  const handleReturn = () => {
    if (returnPath) {
      router.push(returnPath);
    } else {
      router.back();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>
        <button
          onClick={() => router.push(returnPath ?? "/")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {returnLabel}
        </button>
      </div>
    </div>
  );
}