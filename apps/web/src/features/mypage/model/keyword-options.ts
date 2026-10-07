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

const formatWon = (price: number) =>
  price >= 10000 && price % 10000 === 0
    ? `${(price / 10000).toLocaleString('ko-KR')}만원`
    : `${price.toLocaleString('ko-KR')}원`;

/**
 * 키워드 카드에 늘 보이는 한 줄 — "지금 이 키워드로 어떤 알림이 오는지"를 말로 적는다.
 * 예: "평소보다 쌀 때만 · 100만원 이하 · ‘케이스’ 외 1개 제외"
 */
export const summarizeKeywordAlert = ({
  priceDropOnly,
  excludeKeywords,
  minPrice,
  maxPrice,
}: {
  priceDropOnly: boolean;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
}) => {
  const parts = [priceDropOnly ? '평소보다 쌀 때만' : '새 핫딜 모두'];
  if (minPrice != null && maxPrice != null)
    parts.push(`${formatWon(minPrice)}~${formatWon(maxPrice)}`);
  else if (maxPrice != null) parts.push(`${formatWon(maxPrice)} 이하`);
  else if (minPrice != null) parts.push(`${formatWon(minPrice)} 이상`);
  const [first, ...rest] = excludeKeywords;
  if (first) parts.push(rest.length ? `‘${first}’ 외 ${rest.length}개 제외` : `‘${first}’ 제외`);
  return parts.join(' · ');
};
