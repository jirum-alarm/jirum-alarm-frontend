import { cn } from '@/shared/lib/cn';
import { parsePrice, splitPriceNote } from '@/shared/lib/utils/price';

type DisplayPriceProps = {
  price?: string | null;
  className?: string;
};

export default function DisplayPrice({ price, className }: DisplayPriceProps) {
  const { hasWon, priceWithoutWon } = parsePrice(price);
  const { main, note } = splitPriceNote(priceWithoutWon);

  return (
    <p className={cn('pc:text-2xl text-lg font-bold text-gray-500', className)}>
      <strong className="pc:text-28 text-2xl font-semibold text-gray-900">{main}</strong>
      {hasWon && '원'}
      {note && <span className="ml-1 text-sm font-medium">{note}</span>}
    </p>
  );
}
