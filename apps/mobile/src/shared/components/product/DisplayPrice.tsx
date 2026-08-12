import React from 'react';
import {Text} from 'react-native';

import {parsePrice} from '@/shared/lib/format/price';
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

  return (
    <Text className={cn('text-lg font-bold text-gray-500', className)}>
      <Text className="text-[24px] font-semibold text-gray-900">
        {priceWithoutWon}
      </Text>
      {hasWon ? '원' : ''}
    </Text>
  );
}
