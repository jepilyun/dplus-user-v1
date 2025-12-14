import { ArrowRight } from "lucide-react";

/**
 * 정보 아이템
 * @param icon 아이콘
 * @param text 텍스트
 * @param href 링크
 * @param breakWords 줄바꿈 허용 여부
 */
export const InfoItem = ({
  icon,
  text,
  href,
  breakWords = false,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  breakWords?: boolean;
}) => {
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${breakWords ? "break-words" : "truncate"}`}
      title={href}
    >
      {text}
    </a>
  ) : (
    <span className={`block ${breakWords ? "break-words" : "truncate"}`} title={text}>
      {text}
    </span>
  );

  return (
    <li className="px-6 p-4 rounded-full flex items-center gap-4 w-full bg-white/90 border border-white transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_3px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_16px_rgba(0,0,0,0.1)] overflow-hidden">
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex-1 overflow-hidden">{content}</div>
      <ArrowRight className="flex-shrink-0 w-5 h-5" />
    </li>
  );
};