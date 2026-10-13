import dayjs from 'dayjs';

/**
 * 카드 표기 — apps/web 의 같은 함수를 옮겼다(같은 상품이 web·뷰티를 오가며 같은 글자로 보여야 한다).
 *   parsePrice   ← web shared/lib/utils/price.ts
 *   displayTime·toIsoInstant ← web shared/lib/utils/displayTime.ts
 *   convertToWebp ← web shared/lib/utils/image.ts
 * 규칙을 바꾸면 web 쪽도 같이 바꾼다.
 */

type PriceValue = string | number | null | undefined;

const NUMERIC_PRICE_PATTERN = /^\d[\d,\s]*$/;
const FIRST_NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/;
const FOREIGN_CURRENCY_PATTERN = /(\$|USD|CNY|JPY|EUR|위안|엔)/i;

/** 반환값 hasWon 이 true 일 때만 호출부가 "원" 을 붙인다. 비정형 원문(`￦ 8,780원 (KRW)`·`삼성카드46,080`)도 다룬다. */
export function parsePrice(price?: PriceValue) {
  if (price === null || price === undefined || price === '') {
    return { hasWon: false, priceWithoutWon: '커뮤니티 확인' };
  }
  if (typeof price === 'number') {
    return { hasWon: true, priceWithoutWon: price.toLocaleString() };
  }
  const trimmed = price.trim();
  const withoutWon = trimmed.replace('원', '').trim();
  if (NUMERIC_PRICE_PATTERN.test(withoutWon)) {
    const numeric = withoutWon.replaceAll(',', '').replaceAll(' ', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return { hasWon: true, priceWithoutWon: Number(numeric).toLocaleString() };
    }
  }
  if (FOREIGN_CURRENCY_PATTERN.test(trimmed)) {
    return { hasWon: false, priceWithoutWon: trimmed };
  }
  const matched = trimmed.match(FIRST_NUMBER_PATTERN);
  if (matched) {
    const numeric = matched[0].replaceAll(',', '');
    if (numeric !== '' && Number.isFinite(Number(numeric))) {
      return { hasWon: true, priceWithoutWon: Number(numeric).toLocaleString() };
    }
  }
  return { hasWon: false, priceWithoutWon: trimmed };
}

export function formatPrice(price?: PriceValue): string {
  const { hasWon, priceWithoutWon } = parsePrice(price);
  return hasWon ? `${priceWithoutWon}원` : priceWithoutWon;
}

/** `<time datetime>` 에 넣을 절대 시각(UTC ISO). 파싱 실패 시 null. */
export function toIsoInstant(time: string | Date): string | null {
  if (!time) return null;
  const date = time instanceof Date ? time : new Date(time);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function displayTime(createdAt: string | Date) {
  if (!createdAt) return '';
  const now = dayjs();
  const created = dayjs(createdAt);
  if (!created.isValid()) return '';

  const seconds = now.diff(created, 'second');
  if (seconds < 60) return '방금 전';
  const minutes = now.diff(created, 'minute');
  if (minutes < 10) return '방금 전';
  if (minutes < 60) return `${Math.floor(minutes / 10) * 10}분 전`;
  const hours = now.diff(created, 'hour');
  if (hours < 24) return `${hours}시간 전`;
  const days = now.diff(created, 'day');
  if (days < 7) return `${days}일 전`;
  const weeks = now.diff(created, 'week');
  if (weeks < 5) return `${weeks}주 전`;
  const months = now.diff(created, 'month');
  if (months < 12) return `${months}달 전`;
  return '12달 전';
}

export const convertToWebp = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
};
