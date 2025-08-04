import "server-only";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  ja: () => import("../dictionaries/ja.json").then((module) => module.default),
  cn: () => import("../dictionaries/cn.json").then((module) => module.default),
  id: () => import("../dictionaries/id.json").then((module) => module.default),
  vi: () => import("../dictionaries/vi.json").then((module) => module.default),
  th: () => import("../dictionaries/th.json").then((module) => module.default),
  tw: () => import("../dictionaries/tw.json").then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const dictionaryLoader = dictionaries[locale as keyof typeof dictionaries];

  if (typeof dictionaryLoader === "function") {
    return dictionaryLoader();
  }

  // fallback to English
  return dictionaries.en();
};
