
import { SUPPORT_LANG_CODE_VALUE } from "dplus_common_v1";
import { dplusI18nEN } from "../i18n-data/dplus-i18n-en";
import { dplusI18nJA } from "../i18n-data/dplus-i18n-ja";
import { dplusI18nZH } from "../i18n-data/dplus-i18n-zh";
import { dplusI18nID } from "../i18n-data/dplus-i18n-id";
import { dplusI18nVI } from "../i18n-data/dplus-i18n-vi";
import { dplusI18nTH } from "../i18n-data/dplus-i18n-th";
import { dplusI18nTW } from "../i18n-data/dplus-i18n-tw";
import { dplusI18nKO } from "../i18n-data/dplus-i18n-ko";

/**
 * @param locale - 언어 코드
 * @returns 언어 데이터
 */
export const getDplusI18n = (locale: string = SUPPORT_LANG_CODE_VALUE.ko) => {
  switch (locale) {
    case SUPPORT_LANG_CODE_VALUE.en:
      return dplusI18nEN;
    case SUPPORT_LANG_CODE_VALUE.ja:
      return dplusI18nJA;
    case SUPPORT_LANG_CODE_VALUE.zh:
      return dplusI18nZH;
    case SUPPORT_LANG_CODE_VALUE.id:
      return dplusI18nID;
    case SUPPORT_LANG_CODE_VALUE.vi:
      return dplusI18nVI;
    case SUPPORT_LANG_CODE_VALUE.th:
      return dplusI18nTH;
    case SUPPORT_LANG_CODE_VALUE.tw:
      return dplusI18nTW;
    default:
      return dplusI18nKO;
  }
};
