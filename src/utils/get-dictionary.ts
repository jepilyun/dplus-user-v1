import "server-only";

const i18nData = {
  en: () => import("../i18n-data/en.json").then((module) => module.default),
  ja: () => import("../i18n-data/ja.json").then((module) => module.default),
  cn: () => import("../i18n-data/cn.json").then((module) => module.default),
  id: () => import("../i18n-data/id.json").then((module) => module.default),
  vi: () => import("../i18n-data/vi.json").then((module) => module.default),
  th: () => import("../i18n-data/th.json").then((module) => module.default),
  tw: () => import("../i18n-data/tw.json").then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const dictionaryLoader = i18nData[locale as keyof typeof i18nData];

  if (typeof dictionaryLoader === "function") {
    return dictionaryLoader();
  }

  // fallback to English
  return i18nData.en();
};
