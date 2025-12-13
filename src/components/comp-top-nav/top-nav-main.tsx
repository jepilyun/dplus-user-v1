import { DplusLogo } from "@/resources/dplus-logo";
import Link from "next/link";

export default function TopNavMain() {
  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="relative group">
        {/* Glow 효과 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/20 blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
        
        {/* 메인 컨테이너 */}
        <div className="relative w-full px-6 py-4 bg-gradient-to-b from-white/90 via-white/85 to-white/80 backdrop-blur-2xl transition-all duration-500 border-b border-white/60">
          {/* 하이라이트 레이어 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none"></div>
          
          {/* 콘텐츠 - 최대 840px */}
          <div className="relative z-10 max-w-[840px] mx-auto flex justify-between items-center">
            <Link href="/">
              <DplusLogo className="w-8 h-8" />
            </Link>
            
            <Link href="/">
              <div className="text-lg sm:text-2xl font-gamja-flower text-gray-900">
                중요한 날들 놓치지 마세요, 디플러스
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}