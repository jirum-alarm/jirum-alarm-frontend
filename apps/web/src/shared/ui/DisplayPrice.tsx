import { cn } from '@/lib/cn';
import { parsePrice } from '@/util/price';

type DisplayPriceProps = {
  price?: string | null;
  isMobile?: boolean;
};

const TEXT_SIZES = {
  mobile: {
    strong: 'text-[24px]',
    p: 'text-lg',
  },
  desktop: {
    strong: 'text-[28px]',
    p: 'text-2xl',
  },
};

export default function DisplayPrice({ price, isMobile }: DisplayPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);

  return (
    <p className={cn(TEXT_SIZES[isMobile ? 'mobile' : 'desktop'].p, 'font-bold text-gray-500')}>
      <strong
        className={cn(
          TEXT_SIZES[isMobile ? 'mobile' : 'desktop'].strong,
          'font-semibold text-gray-900',
        )}
      >
        {priceWithoutWon}
      </strong>
      {hasWon && '원'}
    </p>
  );
}
