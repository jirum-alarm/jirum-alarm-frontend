'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

import { ProductQueries } from '@entities/product';

import { cn } from '@/shared/lib/cn';

interface ViewerCountProps {
  productId: number;
}

export default function ViewerCount({ productId }: ViewerCountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });

  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  const count = product.viewCount;

  if (count < 10) return null;

  return (
    <>
      <div ref={ref} className="relative top-0 h-0 w-full translate-y-7" />
      <div className="sticky top-14 z-50 h-[48px] w-full">
        <div className="flex w-full items-center justify-center">
          <motion.div
            layout
            initial={{
              opacity: 0,
              width: 1,
              y: 0,
            }}
            animate={{
              opacity: 1,
              width: isInView ? '100%' : 'auto',
              y: isInView ? 0 : 8,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            <motion.div
              layout
              className={cn(
                `bg-secondary-50 flex h-[48px] items-center justify-center border px-5`,
                'shrink-0 whitespace-nowrap',
              )}
              initial={{
                borderRadius: 0,
                borderColor: '#F3F7FF',
              }}
              animate={{
                borderRadius: isInView ? 0 : 48,
                borderColor: isInView ? '#F3F7FF' : '#B5CBFD',
              }}
            >
              <span className="text-sm text-gray-700">
                <strong className="text-secondary-500 font-semibold" suppressHydrationWarning>
                  {count.toLocaleString('ko-kr')}명
                </strong>
                이 살펴본 상품
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
