/**
 * 정보 아이템
 * @param icon 아이콘
 * @param text 텍스트
 * @param href 링크
 * @param copyable 복사 가능 여부
 * @param breakWords 줄바꿈 허용 여부
 * @returns 정보 아이템
 */
export const InfoItem = ({
  icon,
  text,
  href,
  copyable = false,
  breakWords = false,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  copyable?: boolean;
  breakWords?: boolean; // 주소처럼 줄바꿈 허용 여부
}) => {
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
      {copyable && typeof navigator !== "undefined" && (
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="ml-1 shrink-0 text-xs opacity-60 hover:opacity-100"
          aria-label="Copy"
          title="Copy"
        >
          복사
        </button>
      )}
    </li>
  );
}