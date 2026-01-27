import type { Metadata } from "next";

import "@/app/globals.css";
import CompFooter from "@/components/common/comp-footer";
import TopNavMain from "@/components/top-nav/top-nav-main";
import { generateLayoutMetadata } from "@/utils/metadata/generateMetadata";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ langCode: string }>;
}): Promise<Metadata> {
  const { langCode } = await params;

  return generateLayoutMetadata({
    langCode,
    canonicalPath: "/KR",
    includeTwitterCard: true,
    twitterCreator: "@dplusapp",
  });
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavMain />
      <main className="flex-1">
        {children}
      </main>
      <CompFooter />
    </div>
  );
}
