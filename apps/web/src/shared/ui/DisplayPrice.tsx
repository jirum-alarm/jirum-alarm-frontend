import { cn } from '@/shared/lib/cn';
import { parsePrice } from '@/shared/lib/utils/price';

type DisplayPriceProps = {
  price?: string | null;
  className?: string;
};

export default function DisplayPrice({ price, className }: DisplayPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);

  return (
    <p className={cn('pc:text-2xl text-lg font-bold text-gray-500', className)}>
      <strong className="pc:text-[28px] text-[24px] font-semibold text-gray-900">
        {priceWithoutWon}
      </strong>
      {hasWon && '원'}
    </p>
  );
}
