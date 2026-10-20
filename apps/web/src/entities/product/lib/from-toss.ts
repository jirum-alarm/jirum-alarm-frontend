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

// 판매가 행 판정·제목의 가격 떼기는 정본 @jirum/domain/toss(앱과 같은 규칙).
export { isPriceGuideTitle, stripPriceFromTitle } from '@jirum/domain/toss';
