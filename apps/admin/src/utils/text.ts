export const endsWithConsonant = (char: string) => {
  const lastChar = char.charCodeAt(0);
  const jongseong = (lastChar - 0xac00) % 28;
  return jongseong !== 0;
};

export const getParticle = (word: string): string => {
  const lastChar = word[word.length - 1];
  return endsWithConsonant(lastChar) ? '을' : '를';
};

export const getJaccardSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;

  const s1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const s2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));

  if (s1.size === 0 && s2.size === 0) return 1;

  const intersection = new Set([...s1].filter((x) => s2.has(x)));
  const union = new Set([...s1, ...s2]);

  return intersection.size / union.size;
};
