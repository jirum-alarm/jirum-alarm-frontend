// "왜 핫딜인지" 가격 컨텍스트.
// 백엔드 priceContext resolver 가 게이트(카테고리/통화/양수/floor/sanity/mallCount) 통과 시에만
// 값을 내려준다 → 여기서는 "있으면 표시"만. 게이트 로직 재구현 금지(DRY, 백엔드 단일 진실원천).
// 디자인: 연한 빨강 카드 + 할인율 빨강 강조(기존 핫딜배지 #EB001C 톤) — 눈에 띄게.
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

  // 정상가 범위는 너무 넓으면(액세서리·변형 섞임) 신뢰를 깎으므로 숨김. max/min > 3배면 미표시.
  const hasRange =
    typeof normalPriceMin === 'number' &&
    typeof normalPriceMax === 'number' &&
    normalPriceMin > 0 &&
    normalPriceMax > 0 &&
    normalPriceMax / normalPriceMin <= 3;

  return (
    <div className="mt-3 rounded-[12px] border border-[#FFD6D0] bg-[#FFF1F0] px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">다나와 최저가 대비</span>
        <span className="text-[18px] font-bold text-[#EB001C]">{percent}% 저렴</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-[#FFD6D0] pt-2.5">
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
