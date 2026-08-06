type PriceValue = string | number | null | undefined;

const NUMERIC_PRICE_PATTERN = /^\d[\d,\s]*$/;
/** 문자열 안의 첫 숫자 덩어리(천단위 콤마 허용). "삼성카드46,080" · "￦ 8,780 (KRW)" 대응. */
const FIRST_NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/;
/** 원화가 아닌 통화 표기. 원을 붙이면 오표기라 원문을 그대로 살린다. */
const FOREIGN_CURRENCY_PATTERN = /(\$|USD|CNY|JPY|EUR|위안|엔)/i;

/**
 * 카드·상세의 가격 표기를 정규화한다. 반환값 `hasWon` 이 true 일 때만 호출부가 "원" 을 붙인다.
 *
 * 크롤링 원본이 정형(`12,900원`)만 오지 않는다 — 운영 260건 실측에서 16.5% 가 비정형이었다:
 * `￦ 8,780원 (KRW)` · `삼성카드46,080` · `24,963원부터` · `$ 2.67 (USD)` · `선택` · null.
 * 옛 구현은 (a) 첫 '원' 하나만 지우고 (b) 문자열에 '원' 이 있으면 hasWon=true 로 둬서
 * `￦ 8,780원 (KRW)` → `￦ 8,780 (KRW)원` 처럼 **원이 덧붙는 표기**가 나왔다.
 *
 * 규칙: 숫자를 뽑아낸 경우에만 원을 붙이고, 못 뽑으면 원을 붙이지 않는다(원문 유지).
 * 외화 표기는 숫자가 있어도 원을 붙이지 않는다.
 */
export function parsePrice(price?: PriceValue) {
  if (price === null || price === undefined || price === '') {
    return { hasWon: false, priceWithoutWon: '커뮤니티 확인' };
  }

  if (typeof price === 'number') {
    return { hasWon: true, priceWithoutWon: price.toLocaleString() };
  }

  const trimmed = price.trim();

  // 정형(`12,900원` / `12900`)은 기존 경로 그대로 — 90% 가 여기로 빠진다.
  const withoutWon = trimmed.replace('원', '').trim();
  if (NUMERIC_PRICE_PATTERN.test(withoutWon)) {
    const numeric = withoutWon.replaceAll(',', '').replaceAll(' ', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return { hasWon: true, priceWithoutWon: Number(numeric).toLocaleString() };
    }
  }

  // 외화는 숫자가 있어도 원을 붙이지 않는다("$ 2.67 (USD)" → "$ 2.67 (USD)").
  if (FOREIGN_CURRENCY_PATTERN.test(trimmed)) {
    return { hasWon: false, priceWithoutWon: trimmed };
  }

  // 비정형: 첫 숫자 덩어리를 뽑아 원화로 표기한다.
  // "￦ 8,780원 (KRW)" → 8,780원 / "삼성카드46,080" → 46,080원 / "24,963원부터" → 24,963원
  const matched = trimmed.match(FIRST_NUMBER_PATTERN);
  if (matched) {
    const numeric = matched[0].replaceAll(',', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return { hasWon: true, priceWithoutWon: Number(numeric).toLocaleString() };
    }
  }

  // 숫자가 아예 없으면 가격이 아니다("선택", "커뮤니티 확인").
  return { hasWon: false, priceWithoutWon: trimmed };
}
