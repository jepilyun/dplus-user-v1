import { Metadata } from "next";

import { getMetadataByLang } from "@/consts/const-metadata";

import { buildKeywords, pick } from "./metadata-helper";
import {
  ensureAbsoluteUrl,
  generateStorageImageUrl,
} from "./generate-image-url";

/**
 * 메타데이터 설정 인터페이스
 */
export interface MetadataConfig {
  /** 언어 코드 (e.g., "ko", "en") */
  langCode: string;
  /** 라우트 경로 (e.g., "country", "folder", "event") */
  routePath: string;
  /** 페이지 코드 (e.g., countryCode, folderCode) */
  code: string;
  /** 추가 코드 (옵션, e.g., countryCode for category) */
  subCode?: string;
  /** 상세 정보 이름 (e.g., countryDetail.name) */
  detailName?: string | null;
  /** DB에서 가져온 메타데이터 */
  metadata?: {
    title?: string | null;
    description?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    tag_set?: string[] | string | null;
  } | null;
  /** OG 이미지 버킷 (기본값: routePath + "s") */
  imageBucket?: string;
}

/**
 * 상세 페이지용 공통 메타데이터 생성 함수
 *
 * @param config - 메타데이터 설정
 * @returns Next.js Metadata 객체
 *
 * @example
 * // Country 페이지
 * return generateDetailMetadata({
 *   langCode,
 *   routePath: "country",
 *   code: countryCode,
 *   detailName: countryDetail?.countryInfo?.country_name,
 *   metadata: countryDetail?.metadataI18n?.items?.[0],
 *   imageBucket: "countries",
 * });
 */
export function generateDetailMetadata(config: MetadataConfig): Metadata {
  const {
    langCode,
    routePath,
    code,
    subCode,
    detailName,
    metadata,
    imageBucket,
  } = config;

  const defaultMetadata = getMetadataByLang(langCode);

  // Title 생성 로직
  const title = pick(
    metadata?.title,
    detailName
      ? metadata?.title
        ? `${detailName} - ${metadata.title}`
        : detailName
      : null,
    defaultMetadata.title
  );

  const description = pick(metadata?.description, defaultMetadata.description);

  // OG Title 생성 로직
  const ogTitle = pick(
    metadata?.og_title,
    detailName
      ? metadata?.title
        ? `${detailName} - ${metadata.title}`
        : detailName
      : null,
    defaultMetadata.og_title
  );

  const ogDesc = pick(
    metadata?.og_description,
    defaultMetadata.og_description
  );

  // OG 이미지 생성
  const bucket = imageBucket ?? `${routePath}s`;
  const ogImageFromMetadata = ensureAbsoluteUrl(metadata?.og_image, bucket);
  const defaultOgImage = generateStorageImageUrl(
    "service",
    "og_dplus_1200x630.jpg"
  );
  const ogImage = pick(ogImageFromMetadata, defaultOgImage);

  // 키워드 생성 (tag_set이 string인 경우 배열로 변환)
  const tagSet = metadata?.tag_set;
  const tagSetArray =
    typeof tagSet === "string" ? [tagSet] : (tagSet as string[] | null | undefined);
  const keywords = buildKeywords(tagSetArray, defaultMetadata.keywords);

  // 페이지 타이틀 포맷팅
  const pageTitle = `${title} | dplus.app`;
  const ogPageTitle = `${ogTitle} | dplus.app`;

  // Canonical URL 생성
  const canonicalPath = subCode
    ? `https://www.dplus.app/${routePath}/${code}/${subCode}`
    : `https://www.dplus.app/${routePath}/${code}`;

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: ogPageTitle,
      description: ogDesc,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: ogPageTitle,
      description: ogDesc,
      images: [ogImage ?? ""],
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}

/**
 * Date/Today 등 간단한 페이지용 메타데이터 생성 함수
 */
export interface SimpleMetadataConfig {
  /** 언어 코드 */
  langCode: string;
  /** 라우트 경로 */
  routePath: string;
  /** 페이지 코드 */
  code: string;
  /** 타이틀 접두사 (e.g., "2024-01-01", "Today") */
  titlePrefix: string;
  /** 추가 코드 (옵션) */
  subCode?: string;
  /** Twitter 카드 포함 여부 */
  includeTwitterCard?: boolean;
}

/**
 * 간단한 페이지용 메타데이터 생성 함수
 * (date, today 페이지처럼 DB 메타데이터가 없는 경우)
 */
export function generateSimpleMetadata(config: SimpleMetadataConfig): Metadata {
  const {
    langCode,
    routePath,
    code,
    titlePrefix,
    subCode,
    includeTwitterCard = true,
  } = config;

  const defaultMetadata = getMetadataByLang(langCode);

  const title = `${titlePrefix} - ${defaultMetadata.title}`;
  const description = defaultMetadata.description;
  const ogTitle = subCode
    ? `${titlePrefix} - ${subCode}`
    : `${titlePrefix} - ${defaultMetadata.og_title}`;
  const ogDesc = defaultMetadata.og_description;

  const defaultOgImage = generateStorageImageUrl(
    "service",
    "og_dplus_1200x630.jpg"
  );
  const ogImage = pick(defaultOgImage, defaultMetadata.og_image);

  const keywords = buildKeywords(null, defaultMetadata.keywords);

  // Canonical URL 생성
  const canonicalPath = subCode
    ? `https://www.dplus.app/${routePath}/${code}/${subCode}`
    : `https://www.dplus.app/${routePath}/${code}`;

  const pageTitle = `${title} | dplus.app`;
  const ogPageTitle = `${ogTitle} | dplus.app`;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: ogPageTitle,
      description: ogDesc,
      images: ogImage,
    },
    alternates: {
      canonical: canonicalPath,
    },
  };

  if (includeTwitterCard) {
    metadata.twitter = {
      card: "summary_large_image",
      title: pageTitle,
      description: ogDesc,
      images: [ogImage ?? ""],
    };
  }

  return metadata;
}

/**
 * 레이아웃용 기본 메타데이터 설정 인터페이스
 */
export interface LayoutMetadataConfig {
  /** 언어 코드 */
  langCode: string;
  /** Canonical URL 경로 (기본값: "/KR") */
  canonicalPath?: string;
  /** Twitter 카드 포함 여부 */
  includeTwitterCard?: boolean;
  /** Twitter creator 핸들 (옵션) */
  twitterCreator?: string;
}

/**
 * 레이아웃 페이지용 기본 메타데이터 생성 함수
 */
export function generateLayoutMetadata(config: LayoutMetadataConfig): Metadata {
  const {
    langCode,
    canonicalPath = "/KR",
    includeTwitterCard = false,
    twitterCreator,
  } = config;

  const defaultMetadata = getMetadataByLang(langCode);

  const metadata: Metadata = {
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    keywords: defaultMetadata.keywords,
    openGraph: {
      title: defaultMetadata.og_title,
      description: defaultMetadata.og_description,
      images: defaultMetadata.og_image,
    },
    alternates: {
      canonical: `https://www.dplus.app${canonicalPath}`,
    },
  };

  if (includeTwitterCard) {
    metadata.twitter = {
      card: "summary_large_image",
      title: defaultMetadata.og_title,
      description: defaultMetadata.og_description,
      images: [defaultMetadata.og_image],
      ...(twitterCreator && { creator: twitterCreator }),
    };
  }

  return metadata;
}
