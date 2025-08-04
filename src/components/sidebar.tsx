import Link from "next/link";

/**
 * 사이드바 컴포넌트
 * @param dictionary 딕셔너리 객체
 * @returns 사이드바 컴포넌트
 */
export function Sidebar({ dictionary }: { dictionary: { home: string; about: string; contact: string } }) {
  return (
    <nav>
      {/* 전달받은 다국어 지원 텍스트로 메뉴를 렌더링 */}
      <ul>
        <li>
          <Link href="/">{dictionary.home}</Link>
        </li>
        <li>
          <Link href="/about">{dictionary.about}</Link>
        </li>
        <li>
          <Link href="/contact">{dictionary.contact}</Link>
        </li>
      </ul>
    </nav>
  );
}
