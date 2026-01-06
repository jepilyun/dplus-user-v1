// components/comp-common/comp-loading.tsx
export function CompLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 애니메이션 */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
}