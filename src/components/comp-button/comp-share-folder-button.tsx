import { ReactNode } from "react";

export const CompShareFolderButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button onClick={onClick} className="group relative text-gray-700">
      <div className="absolute inset-0 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
      <div className="relative flex items-center justify-center px-1 rounded-full backdrop-blur-2xl transition-all duration-500">
        <div className="absolute inset-0 rounded-full pointer-events-none"></div>
        <div className="px-8 py-3 flex flex-row items-center justify-center gap-2 w-full min-w-0">
          <div className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <span className="text-base font-bold relative z-10 filter truncate w-full text-center sm:w-auto">
            {label}
          </span>
        </div>
      </div>
    </button>
  );
};