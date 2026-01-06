// components/comp-common/comp-network-error.tsx
"use client";

interface CompNetworkErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function CompNetworkError({
  title = "ERROR",
  message = "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
  onRetry,
  retryLabel = "다시 시도",
}: CompNetworkErrorProps) {
  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}