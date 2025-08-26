import { cn } from '@/lib/cn';
import { parsePrice } from '@/util/price';

type DisplayPriceProps = {
  price?: string | null;
  className?: string;
};

export default function DisplayPrice({ price, className }: DisplayPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);

  return (
    <p className={cn('text-lg pc:text-2xl font-bold text-gray-500', className)}>
      <strong className="text-[24px] pc:text-[28px] font-semibold text-gray-900">
        {priceWithoutWon}
      </strong>
      {hasWon && '원'}
    </p>
  );
}
