// 토스 특가 코너에서 상세로 넘길 때 붙이는 쿼리.
// referrer 는 앱·인앱웹뷰에서 비는 경우가 많아 쿼리로 경로를 명시한다.
export const FROM_TOSS_PARAM = 'from';
export const FROM_TOSS_VALUE = 'toss';

export function tossDetailHref(productId: number): string {
  return `/products/${productId}?${FROM_TOSS_PARAM}=${FROM_TOSS_VALUE}`;
}

export function isFromToss(from: string | string[] | null | undefined): boolean {
  const value = Array.isArray(from) ? from[0] : from;
  return value === FROM_TOSS_VALUE;
}

/** productGuides 중 판매가 행. 토스 코너 유입 상세에서 숨긴다. */
export function isPriceGuideTitle(title: string): boolean {
  return /가격|할인가|판매가|정가/.test(title);
}

/**
 * 토스 소싱 제목에 붙는 판매가("23,800원")·단위가("100g당 2,092원")를 뗀다.
 * "원피스"처럼 원 이 글자인 경우는 숫자가 없어 건드리지 않는다.
 */
export function stripPriceFromTitle(title: string): string {
  return title
    .replace(/\s*\d+(?:g|ml|kg|l|개|매|롤|포|장|입)?당\s*\d{1,3}(?:,\d{3})*원/gi, '')
    .replace(/\s*\d{1,3}(?:,\d{3})+원/g, '')
    .replace(/\s*\d{4,}원/g, '')
    .replace(/\s+\d{1,3}원(?=\s|$)/g, '')
    .replace(/[\s,·|/]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
