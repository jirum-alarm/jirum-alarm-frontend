'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { cn } from '@/lib/cn';
import { getFromNow } from '@/util/date';

import { ProductQueries } from '@entities/product';

function ReactionKeywords({ productId }: { productId: number }) {
  const {
    data: { categorizedReactionKeywords },
  } = useSuspenseQuery(ProductQueries.reactionKeywords({ id: productId }));

  const { items, lastUpdatedAt: lastUpdatedAtString } = categorizedReactionKeywords;

  const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  if (!lastUpdatedAt || !items.length) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-2">
      {items.map((item) => (
        <li
          key={item.name}
          className={cn([
            'flex gap-x-1 rounded-[40px] border bg-white px-3.5 py-2',
            {
              'border-secondary-300': item.type === 'POSITIVE',
              'border-error-200': item.type === 'NEGATIVE',
              'border-gray-300': item.type === 'SYNONYM',
            },
          ])}
        >
          <span className="text-sm font-medium text-gray-500">{item.tag}</span>
          <span className="text-sm font-medium text-gray-900">{item.name}</span>
          <span
            className={cn([
              'text-sm font-semibold',
              {
                'text-secondary-700': item.type === 'POSITIVE',
                'text-error-400': item.type === 'NEGATIVE',
                'text-gray-500': item.type === 'SYNONYM',
              },
            ])}
          >
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default ReactionKeywords;
