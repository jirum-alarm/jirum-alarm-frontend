import { cn } from '@/shared/lib/cn';
import { parsePrice } from '@/shared/lib/utils/price';

type DisplayPriceProps = {
  price?: string | null;
  className?: string;
};

export default function DisplayPrice({ price, className }: DisplayPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);

  return (
    <p className={cn('pc:text-2xl typography-title-18b text-fg-secondary', className)}>
      <strong className="pc:text-[28px] text-fg-primary text-[24px] font-semibold">
        {priceWithoutWon}
      </strong>
      {hasWon && '원'}
    </p>
  );
}
