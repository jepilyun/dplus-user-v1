import type { Metadata } from "next";
import "@/app/globals.css";
import { getDictionary } from "@/utils/get-dictionary";
import TopNavMain from "@/components/top-nav/top-nav-main";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns The metadata for the page
 */
export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
  const { langCode } = await params;
  const dict = await getDictionary(langCode);

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
      canonical: `https://trand.app/city/seoul`,
    },
  };
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>
    <TopNavMain />
    {children}
  </>;
}
