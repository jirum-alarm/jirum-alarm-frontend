/**
 * 상세 배지를 누르면 뜨는 뜻(토스 신뢰 배지·판매종료) — web·앱이 같은 문구를 쓴다.
 * 배지가 버튼처럼 보여 눌러 보는 사람이 많았는데 아무 일이 없었다(Clarity dead click, 2026-10-20).
 * 줄 단위 배열인 이유: 말풍선은 한 줄로 늘어나 폰 화면 밖으로 밀린다 — 각 플랫폼이 줄을 끊어 그린다.
 * 토스 배지 뜻은 코드에 정의가 없어 일반적인 의미로 짧게 적었다.
 */
export type TossBadgeKey = 'lpc' | 'ag' | 'sp' | 'l30';

export const TOSS_BADGE_EXPLAIN: Record<TossBadgeKey, readonly [string, string]> = {
  lpc: ['다른 곳이 더 싸면 토스가', '차액을 보상해 주는 상품이에요'],
  ag: ['약속한 날까지 도착을', '보장하는 상품이에요'],
  sp: ['토스쇼핑이 기간 한정으로', '할인하는 특가 상품이에요'],
  l30: ['최근 30일 토스 판매가 중', '가장 낮은 가격이에요'],
};

export const END_BADGE_EXPLAIN: readonly [string, string] = [
  '판매가 끝났거나 품절된 것으로',
  '확인된 딜이에요',
];
