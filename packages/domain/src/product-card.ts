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
