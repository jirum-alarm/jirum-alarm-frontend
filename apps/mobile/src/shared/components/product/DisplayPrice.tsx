import React from 'react';
import {Text} from '@/shared/components/ui/Text/AppText';

import {parsePrice, splitPriceNote} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';

/**
 * 상세 상단의 큰 가격 표기. web DisplayPrice 와 같은 규칙 —
 * 숫자는 24px/gray-900, "원"은 18px/gray-500 로 크기가 다르다.
 */
export default function DisplayPrice({
  price,
  className,
}: {
  price?: string | number | null;
  className?: string;
}) {
  const {hasWon, priceWithoutWon} = parsePrice(price);
  const {main, note} = splitPriceNote(priceWithoutWon);

  return (
    <Text className={cn('text-lg font-bold text-gray-500', className)}>
      <Text className="text-2xl font-semibold text-gray-900">{main}</Text>
      {hasWon ? '원' : ''}
      {note ? <Text className="text-sm font-medium"> {note}</Text> : null}
    </Text>
  );
}
