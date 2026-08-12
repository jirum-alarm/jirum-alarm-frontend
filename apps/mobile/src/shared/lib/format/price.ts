type PriceValue = string | number | null | undefined;

const NUMERIC_PRICE_PATTERN = /^\d[\d,\s]*$/;
/** 문자열 안의 첫 숫자 덩어리(천단위 콤마 허용). "삼성카드46,080" · "￦ 8,780 (KRW)" 대응. */
const FIRST_NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/;
/** 원화가 아닌 통화 표기. 원을 붙이면 오표기라 원문을 그대로 살린다. */
const FOREIGN_CURRENCY_PATTERN = /(\$|USD|CNY|JPY|EUR|위안|엔)/i;

/**
 * apps/web 의 shared/lib/utils/price.ts 를 그대로 옮긴 것.
 *
 * 크롤링 원본이 정형(`12,900원`)만 오지 않는다 — 운영 260건 실측에서 16.5% 가 비정형:
 * `￦ 8,780원 (KRW)` · `삼성카드46,080` · `24,963원부터` · `$ 2.67 (USD)` · `선택` · null.
 * 규칙: 숫자를 뽑아낸 경우에만 원을 붙이고, 못 뽑으면 붙이지 않는다(원문 유지).
 *
 * ⚠️ 웹과 표기가 갈리면 같은 상품이 다르게 보여 유저는 버그로 읽는다. 임의 수정 금지 —
 * 고쳐야 하면 web 쪽과 같이 고칠 것.
 */
export function parsePrice(price?: PriceValue) {
  if (price === null || price === undefined || price === '') {
    return {hasWon: false, priceWithoutWon: '커뮤니티 확인'};
  }

  if (typeof price === 'number') {
    return {hasWon: true, priceWithoutWon: price.toLocaleString()};
  }

  const trimmed = price.trim();

  // 정형(`12,900원` / `12900`)은 기존 경로 그대로 — 90% 가 여기로 빠진다.
  const withoutWon = trimmed.replace('원', '').trim();
  if (NUMERIC_PRICE_PATTERN.test(withoutWon)) {
    const numeric = withoutWon.replaceAll(',', '').replaceAll(' ', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return {hasWon: true, priceWithoutWon: Number(numeric).toLocaleString()};
    }
  }

  // 외화는 숫자가 있어도 원을 붙이지 않는다("$ 2.67 (USD)" → 그대로).
  if (FOREIGN_CURRENCY_PATTERN.test(trimmed)) {
    return {hasWon: false, priceWithoutWon: trimmed};
  }

  // 비정형: 첫 숫자 덩어리를 뽑아 원화로 표기한다.
  const matched = trimmed.match(FIRST_NUMBER_PATTERN);
  if (matched) {
    const numeric = matched[0].replaceAll(',', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return {hasWon: true, priceWithoutWon: Number(numeric).toLocaleString()};
    }
  }

  // 숫자가 아예 없으면 가격이 아니다("선택", "커뮤니티 확인").
  return {hasWon: false, priceWithoutWon: trimmed};
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * web 의 displayTime 과 같은 구간 규칙.
 *
 * ponytail: web 은 dayjs 를 쓰지만 mobile 에는 dayjs 가 dependency 로 없다
 * (node_modules 에 hoisting 으로 올라와 있을 뿐이라 의존하면 부서진다).
 * 초 단위 뺄셈이면 충분해서 직접 계산한다.
 */
export function displayTime(createdAt: string | Date | null | undefined) {
  if (!createdAt) return '';

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return '';

  const seconds = Math.floor((Date.now() - created.getTime()) / 1000);
  if (seconds < 0) return '방금 전';
  if (seconds < MINUTE) return '방금 전';

  const minutes = Math.floor(seconds / MINUTE);
  if (minutes < 10) return '방금 전';
  if (minutes < 60) return `${Math.floor(minutes / 10) * 10}분 전`;

  const hours = Math.floor(seconds / HOUR);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(seconds / DAY);
  if (days < 7) return `${days}일 전`;

  const weeks = Math.floor(seconds / WEEK);
  if (weeks < 5) return `${weeks}주 전`;

  // 달·해는 길이가 일정하지 않아 초 나눗셈으로는 어긋난다. 달력 기준으로 센다.
  const months =
    (new Date().getFullYear() - created.getFullYear()) * 12 +
    (new Date().getMonth() - created.getMonth());
  if (months < 12) return `${Math.max(1, months)}달 전`;

  return '12달 전';
}
