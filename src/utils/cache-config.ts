/**
 * 캐시 설정 유틸리티
 * 개발 환경에서는 캐시를 비활성화하고, 프로덕션에서는 설정된 시간만큼 캐시
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * 페이지 레벨 revalidate 시간 (초)
 * - 개발: 0 (캐시 없음)
 * - 프로덕션: 14400 (4시간)
 */
export const REVALIDATE_4HR = isDev ? 0 : 14400;

/**
 * API 요청 레벨 revalidate 시간 (초)
 * - 개발: 0 (캐시 없음)
 * - 프로덕션: 86400 (24시간)
 */
export const REVALIDATE_24HR = isDev ? 0 : 86400;

/**
 * 짧은 캐시 시간 (1시간)
 * - 개발: 0 (캐시 없음)
 * - 프로덕션: 3600 (1시간)
 */
export const REVALIDATE_1HR = isDev ? 0 : 3600;
