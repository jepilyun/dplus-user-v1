import type { Metadata } from "next";
import "@/app/globals.css";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import TopNavMain from "@/components/comp-top-nav/top-nav-main";
import CompFooter from "@/components/comp-common/comp-footer";
import { getMetadataByLang } from "@/consts/const-metadata";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns The metadata for the page
 */
export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
  const { langCode } = await params;
  const metadata = getMetadataByLang(langCode);

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.og_title,
      description: metadata.og_description,
      images: metadata.og_image, 
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
    <div className="min-h-screen flex flex-col max-w-[840px] m-auto">
      <TopNavMain />
      <main className="flex-1">
        {children}
      </main>
      <CompFooter />
    </div>
  );
}