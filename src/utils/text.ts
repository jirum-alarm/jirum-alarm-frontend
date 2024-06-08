export const endsWithConsonant = (char: string) => {
  const lastChar = char.charCodeAt(0);
  const jongseong = (lastChar - 0xac00) % 28;
  return jongseong !== 0;
};

export const getParticle = (word: string): string => {
  const lastChar = word[word.length - 1];
  return endsWithConsonant(lastChar) ? '을' : '를';
};
