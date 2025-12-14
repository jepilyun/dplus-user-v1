import { ReactNode } from "react";

export const CompActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button onClick={onClick} className="group relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 to-gray-300/60 rounded-4xl sm:rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
      <div className="relative flex items-center justify-center px-2 py-4 bg-gradient-to-b from-white/90 via-gray-50/90 to-gray-100/90 text-gray-900 rounded-4xl sm:rounded-full backdrop-blur-2xl transition-all duration-500 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_3px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_16px_rgba(0,0,0,0.1)] active:translate-y-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-4xl sm:rounded-full pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full min-w-0">
          <div className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-semibold relative z-10 filter truncate w-full text-center sm:w-auto">
            {label}
          </span>
        </div>
      </div>
    </button>
  );
};