import { ReactNode } from "react";

interface GlassButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  /**
   * "action": 아이콘 왼쪽, 라벨 가운데 (소형 버튼)
   * "link": 라벨 왼쪽, 아이콘 오른쪽 (대형 버튼)
   */
  variant?: "action" | "link";
}

export function GlassButton({
  icon,
  label,
  onClick,
  variant = "action",
}: GlassButtonProps) {
  const isAction = variant === "action";

  return (
    <button onClick={onClick} className={`group relative ${isAction ? "" : "text-gray-700"}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 to-gray-300/60 rounded-4xl sm:rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
      <div className={`relative flex items-center justify-center px-2 py-4 bg-gradient-to-b from-white/90 via-gray-50/90 to-gray-100/90 ${isAction ? "text-gray-900 rounded-4xl sm:rounded-full" : "rounded-full"} backdrop-blur-2xl transition-all duration-500 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-5px_rgba(0,0,0,0.2)] active:translate-y-0`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-4xl sm:rounded-full pointer-events-none"></div>
        <div className={`flex ${isAction ? "flex-col sm:flex-row" : "flex-row px-8 py-3"} items-center justify-center gap-2 w-full min-w-0`}>
          {isAction ? (
            <>
              <div className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110">
                {icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold relative z-10 filter truncate w-full text-center sm:w-auto">
                {label}
              </span>
            </>
          ) : (
            <>
              <span className="text-base font-bold relative z-10 filter truncate w-full text-center sm:w-auto">
                {label}
              </span>
              <div className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110">
                {icon}
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// 하위 호환성을 위한 별칭 export
export const CompActionButton = (props: Omit<GlassButtonProps, "variant">) => (
  <GlassButton {...props} variant="action" />
);

export const CompLinkButton = (props: Omit<GlassButtonProps, "variant">) => (
  <GlassButton {...props} variant="link" />
);
