// 우선순위: i18n → base → default(dict)
export const pick = (...values: (string | null | undefined)[]) => {
  for (const value of values) {
    if (value) return value;
  }
  return undefined;
};

// tag_set은 배열일 수 있으니 keywords 조합 헬퍼
export const buildKeywords = (
  tagSet?: string[] | null,
  baseKeywords?: string | null,
  dictKeywords?: string | string[] | null,
): string | string[] | undefined => {
  const parts: string[] = [];
  if (Array.isArray(tagSet) && tagSet.length) parts.push(...tagSet);
  if (baseKeywords) parts.push(baseKeywords);
  if (Array.isArray(dictKeywords)) parts.push(...dictKeywords);
  else if (typeof dictKeywords === "string" && dictKeywords)
    parts.push(dictKeywords);

  const uniq = Array.from(new Set(parts.map((s) => s.trim()).filter(Boolean)));
  if (uniq.length === 0) return undefined;
  // Next Metadata는 string | string[] 모두 허용. 태그가 많으면 배열 유지.
  return uniq.length === 1 ? uniq[0] : uniq;
};
