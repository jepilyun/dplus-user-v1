import type { Metadata } from "next";
import "@/app/globals.css";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import TopNavMain from "@/components/comp-top-nav/top-nav-main";
import CompFooter from "@/components/comp-common/comp-footer";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns The metadata for the page
 */
export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
  const { langCode } = await params;
  const dict = getDplusI18n(langCode);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    openGraph: {
      title: dict.metadata.og_title,
      description: dict.metadata.og_description,
      images: dict.metadata.og_image, 
    },
    alternates: {
      canonical: `https://www.dplus.app/KR`,
    },
  };
}

export default function MainLayout({
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