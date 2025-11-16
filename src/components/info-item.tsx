/**
 * 정보 아이템
 * @param icon 아이콘
 * @param text 텍스트
 * @param href 링크
 * @param variant 스타일 variant ('inline' | 'box')
 * @param breakWords 줄바꿈 허용 여부
 */
export const InfoItem = ({
  icon,
  text,
  href,
  variant = "inline",
  breakWords = false,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  variant?: "inline" | "box";
  breakWords?: boolean;
}) => {
  // Box variant
  if (variant === "box") {
    const BoxContent = (
      <div className="flex flex-col min-w-[180px] items-center gap-3 rounded-xl bg-white p-6 transition-all hover:bg-gray-50">
        <span className="text-gray-700">{icon}</span>
        <span className="text-center text-sm font-medium text-gray-900">
          {text}
        </span>
      </div>
    );

    return (
      <li>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {BoxContent}
          </a>
        ) : (
          BoxContent
        )}
      </li>
    );
  }

  // Inline variant (기존 스타일)
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${breakWords ? "break-words" : "truncate hover:underline"}`}
      title={text}
    >
      {text}
    </a>
  ) : (
    <span className={`block ${breakWords ? "break-words" : "truncate"}`} title={text}>
      {text}
    </span>
  );

  return (
    <li className="flex items-center gap-4 min-w-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">{content}</div>
    </li>
  );
};