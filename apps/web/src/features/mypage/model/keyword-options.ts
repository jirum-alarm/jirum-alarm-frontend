const MAX_EXCLUDE_KEYWORDS = 10;
/** 서버 검증(Length 1~20)과 같은 값 */
const MAX_EXCLUDE_KEYWORD_LENGTH = 20;

/** "콜라겐, 콜라보" → ['콜라겐', '콜라보'] (공백·중복 정리, 단어당 20자·최대 10개) */
export const parseExcludeKeywords = (value: string) =>
  [...new Set(value.split(',').map((word) => word.trim().slice(0, MAX_EXCLUDE_KEYWORD_LENGTH)))]
    .filter((word) => word.length > 0)
    .slice(0, MAX_EXCLUDE_KEYWORDS);

/** "1,000,000원" → 1000000, 빈칸 → null */
export const parsePrice = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
};
