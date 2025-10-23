import { DplusLogo } from "@/resources/dplus-logo";
import Link from "next/link";

export default function TopNavMain() {
  return (
    <nav
      className="
        sticky top-0 z-50 
        flex justify-start items-center 
        p-6 bg-white
      "
    >
      <Link href="/">
        <DplusLogo className="w-8 h-8" />
      </Link>
    </nav>
  );
}
