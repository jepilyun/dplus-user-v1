import { DplusLogo } from "@/resources/dplus-logo";
import Link from "next/link";

export default function TopNavMain() {
  return (
    <nav
      className="
        sticky top-0 z-50 
        flex justify-between items-center 
        p-6 
        bg-gradient-to-b from-white to-transparent
      "
    >
      <Link href="/">
        <DplusLogo className="w-8 h-8" />
      </Link>
      <div className="text-lg sm:text-2xl font-gamja-flower">
        모든 순간이 디데이, dplus
      </div>
    </nav>
  );
}