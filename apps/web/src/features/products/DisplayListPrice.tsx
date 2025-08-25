import { parsePrice } from '@/util/price';

type DisplayListPriceProps = {
  price?: string | null;
};

export default function DisplayListPrice({ price }: DisplayListPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);

  return (
    <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900">
      {hasWon ? `${priceWithoutWon}원` : priceWithoutWon}
    </span>
  );
}
