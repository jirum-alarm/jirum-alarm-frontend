/**
 * 키워드 알림 조건 입력 파싱. web `features/mypage/model/keyword-options.ts` 와 같은 규칙.
 */
const MAX_EXCLUDE_KEYWORDS = 10;
/** 서버 검증(Length 1~20)과 같은 값 */
const MAX_EXCLUDE_KEYWORD_LENGTH = 20;

/** "콜라겐, 콜라보" → ['콜라겐', '콜라보'] (공백·중복 정리, 단어당 20자·최대 10개) */
export const parseExcludeKeywords = (value: string) =>
  [
    ...new Set(
      value
        .split(',')
        .map(word => word.trim().slice(0, MAX_EXCLUDE_KEYWORD_LENGTH)),
    ),
  ]
    .filter(word => word.length > 0)
    .slice(0, MAX_EXCLUDE_KEYWORDS);

/** "1,000,000원" → 1000000, 빈칸 → null */
export const parsePrice = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
};

const formatWon = (price: number) =>
  price >= 10000 && price % 10000 === 0
    ? `${(price / 10000).toLocaleString('ko-KR')}만원`
    : `${price.toLocaleString('ko-KR')}원`;

/** 접힌 줄에 보일 요약. "~150만원 · 제외 2" */
export const summarizeKeywordOptions = ({
  excludeKeywords,
  minPrice,
  maxPrice,
}: {
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
}) => {
  const parts: string[] = [];
  if (minPrice != null || maxPrice != null) {
    parts.push(
      `${minPrice != null ? formatWon(minPrice) : ''}~${
        maxPrice != null ? formatWon(maxPrice) : ''
      }`,
    );
  }
  if (excludeKeywords.length) parts.push(`제외 ${excludeKeywords.length}`);
  return parts.join(' · ');
};
