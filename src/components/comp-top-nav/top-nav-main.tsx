import { DplusLogo } from "@/resources/dplus-logo";
import Link from "next/link";

export default function TopNavMain() {
  return (
    <nav className="flex justify-start items-center p-6">
      <Link href="/">
        <DplusLogo className="w-8 h-8" />
      </Link>
    </nav>
  );
}
