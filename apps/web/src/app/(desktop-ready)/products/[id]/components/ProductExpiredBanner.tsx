'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ProductQueries } from '@/entities/product';
import { ProductQuery } from '@/shared/api/gql/graphql';

type Product = NonNullable<ProductQuery['product']>;

export default function ProductExpiredBanner({ product }: { product: Product }) {
  const {
    data: { reportUserNames },
  } = useSuspenseQuery(ProductQueries.reportUserNames({ productId: +product.id }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (reportUserNames.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reportUserNames.length);
    }, 1000 * 5);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reportUserNames.length]);

  const visibleMessages = useMemo(() => {
    if (reportUserNames.length === 0) {
      return [];
    } else if (reportUserNames.length === 1) {
      return [reportUserNames[0]];
    } else {
      const prevIndex = (currentIndex - 1 + reportUserNames.length) % reportUserNames.length;
      const nextIndex = (currentIndex + 1) % reportUserNames.length;
      return [
        reportUserNames[prevIndex],
        reportUserNames[currentIndex],
        reportUserNames[nextIndex],
      ];
    }
  }, [reportUserNames, currentIndex]);

  return visibleMessages.length > 0 ? (
    <div className="relative flex h-[48px] items-center justify-center overflow-hidden bg-gray-100">
      <div className="h-full w-full">
        {visibleMessages.map((item, idx) => {
          let translateY;
          if (visibleMessages.length === 1) {
            translateY = 0;
          } else {
            translateY = (idx - 1) * 100;
          }
          return (
            <div
              key={item}
              className="absolute left-0 top-0 flex h-[48px] w-full items-center justify-center"
              style={{
                transform: `translateY(${translateY}%)`,
                width: '100%',
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              <p className="font-medium text-gray-600">
                {item}님이 <strong className="font-semibold text-gray-900">판매종료</strong>로
                제보했어요!
              </p>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="h-2 bg-gray-100" />
  );
}
