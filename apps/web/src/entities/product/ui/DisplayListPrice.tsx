import { parsePrice } from '@shared/lib/utils/price';

type DisplayListPriceProps = {
  price?: string | null;
  forceString?: boolean;
  widthType?: 'default' | 'wide';
  beforePrice?: string;
};

export default function DisplayListPrice({
  price,
  forceString,
  widthType = 'default',
  beforePrice,
}: DisplayListPriceProps) {
  let displayString: string;
  if (forceString) {
    displayString = price ?? '';
  } else {
    const { hasWon, priceWithoutWon } = parsePrice(price);
    displayString = hasWon ? `${priceWithoutWon}원` : priceWithoutWon;
  }

  // 개발코멘트 (by 김소연)
  // 1. tailwind에서 dynamic className 최적화가 되는지 기억이 안나서 방어적으로 전체 className을 두개로 분기 처리
  // 2. wide를 나눈 이유는 max width 98px이 왜 있는지 몰라서 선택적으로 사용하기 위해 (side effect 예측 안됨)
  // 3. forceString도 parsePrice의 동작을 바꾸었을 때 사이드이펙트 예측이 어렵기도 하고, 의도를 잘 모르겠어서 추가하였습니다.
  // 기본 동작은 모두 기존과 같으며 추가된 옵션들은 AdProductRakingImageCard에서만 한정적으로 사용하였습니다.
  return (
    <div className="flex items-center gap-x-2">
      {beforePrice && (
        <span className="line-clamp-1 text-sm! font-semibold text-gray-500 line-through">
          {beforePrice}
        </span>
      )}
      <span
        className={
          widthType === 'wide'
            ? 'line-clamp-1 max-w-[120px] text-lg font-semibold text-gray-900'
            : 'line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900'
        }
      >
        {displayString}
      </span>
    </div>
  );
}
