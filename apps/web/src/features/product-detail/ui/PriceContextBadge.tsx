// "왜 핫딜인지" 가격 컨텍스트.
// 백엔드 priceContext resolver 가 게이트(카테고리/통화/양수/floor/sanity/mallCount) 통과 시에만
// 값을 내려준다 → 여기서는 "있으면 표시"만. 게이트 로직 재구현 금지(DRY, 백엔드 단일 진실원천).
// 디자인: 핫딜지수 섹션(회색 카드)과 같은 언어 — 라벨/값 행, 차분한 톤, % 만 primary 강조.
type PriceContextBadgeProps = {
  priceContext?: {
    dealPrice: number;
    danawaPrice: number;
    delta: number;
    normalPriceMin?: number | null;
    normalPriceMax?: number | null;
    danawaProductName?: string | null;
  } | null;
};

export default function PriceContextBadge({ priceContext }: PriceContextBadgeProps) {
  if (!priceContext) return null;

  const { danawaPrice, delta, normalPriceMin, normalPriceMax } = priceContext;
  const percent = Math.round(delta * 100);

  // 정상가 범위는 너무 넓으면(액세서리·변형 섞임) 신뢰를 깎으므로 숨김.
  // max/min > 3배면 비정상 분포로 보고 미표시.
  const hasRange =
    typeof normalPriceMin === 'number' &&
    typeof normalPriceMax === 'number' &&
    normalPriceMin > 0 &&
    normalPriceMax > 0 &&
    normalPriceMax / normalPriceMin <= 3;

  // 바깥 카드는 섹션(HotdealScore)이 제공 — 여기선 내용만(카드 중첩 방지).
  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">다나와 최저가 대비</span>
        <span className="text-primary-500 text-base font-semibold">{percent}% 저렴</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">다나와 최저가</span>
        <span className="text-sm font-medium text-gray-700">
          {danawaPrice.toLocaleString()}원
        </span>
      </div>
      {hasRange && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm text-gray-500">정상가 범위</span>
          <span className="text-sm text-gray-500">
            {normalPriceMin!.toLocaleString()} ~ {normalPriceMax!.toLocaleString()}원
          </span>
        </div>
      )}
    </div>
  );
}
