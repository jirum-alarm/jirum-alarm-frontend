/**
 * 상품 카드 사진 위 표시 규칙 — web ProductCardStatus·앱 ProductCardStatus 가 같이 쓴다.
 * (전엔 두 파일에 같은 조건식을 적고 앱 테스트가 문자열로 대조했다, 2026-10-20)
 */

/**
 * 사진 왼쪽 아래 핫딜 배지로 보일 등급. 유통기한 띠가 있으면 같은 자리(사진 아래)를 띠가 쓰므로 배지를 숨긴다.
 * 판매종료·오픈 예정 라벨이 먼저인 건 호출부의 분기 순서다.
 */
export function visibleHotDealType<T extends string>(
  hotDealType: T | null | undefined,
  earliestExpiryDate: string | Date | null | undefined,
): T | null {
  if (earliestExpiryDate) return null;
  return hotDealType || null;
}

/** 카드 「기준가 대비 X%」의 기준 — 서버 PriceSavingBasis 와 같은 값. */
export type PriceSavingBasis = 'USUAL' | 'COUPANG' | 'DANAWA';

const SAVING_BASIS_LABEL: Record<PriceSavingBasis, string> = {
  USUAL: '평소보다',
  COUPANG: '쿠팡보다',
  DANAWA: '다나와보다',
};
/** 좁은 사진(목록 카드 76px) 위 짧은 꼴 — 「쿠팡보다 21%↓」(7자)는 76px 에서 잘렸다(2026-10-23 하네스). */
const SAVING_BASIS_SHORT: Record<PriceSavingBasis, string> = {
  USUAL: '평소',
  COUPANG: '쿠팡',
  DANAWA: '다나와',
};

/**
 * 사진 오른쪽 위 「쿠팡보다 21%↓」 라벨 — 서버가 상세 근거 블록 헤드라인과 같은 기준·숫자만 준다(판정은 서버, 여기는 문구만).
 * 모르는 기준·0 이하면 null(다음 서버 값이 먼저 나가도 엉뚱한 말을 하지 않게).
 */
export function priceSavingLabel(
  saving: { basis: string; percent: number } | null | undefined,
  /** compact = 좁은 사진 위 「쿠팡 21%↓」. */
  size: 'full' | 'compact' = 'full',
): string | null {
  if (!saving || !(saving.percent > 0)) return null;
  const table = size === 'compact' ? SAVING_BASIS_SHORT : SAVING_BASIS_LABEL;
  const basis = table[saving.basis as PriceSavingBasis];
  return basis ? `${basis} ${Math.floor(saving.percent)}%↓` : null;
}
