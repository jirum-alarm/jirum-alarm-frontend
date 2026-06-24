'use client';

import { Fragment, type ReactNode } from 'react';

import { EVENT } from '@/shared/config/mixpanel';
import { cn } from '@/shared/lib/cn';

import { type ProductCardSource } from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';

import ProductGridCard from './ProductGridCard';

type ProductGridListProps = {
  products: ProductCardType[];
  rankFrom?: number;
  className?: string;
  cardClassName?: string;
  displayTime?: boolean;
  logging?: { page: keyof typeof EVENT.PAGE };
  priorityCount?: number;
  source?: ProductCardSource;
  /** 이 개수만큼 카드를 렌더한 뒤 `slot`을 그리드 전체 폭(col-span-full)으로 끼운다. */
  slotAfter?: number;
  slot?: ReactNode;
};

export default function ProductGridList({
  products,
  rankFrom,
  className,
  cardClassName,
  displayTime = true,
  logging,
  priorityCount = 0,
  source,
  slotAfter,
  slot,
}: ProductGridListProps) {
  return (
    <div
      className={cn(
        'pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3',
        className,
      )}
    >
      {products.map((product, index) => (
        <Fragment key={product.id}>
          <ProductGridCard
            product={product}
            rank={rankFrom ? rankFrom + index : undefined}
            displayTime={displayTime}
            priority={index < priorityCount}
            className={cardClassName}
            source={source}
          />
          {/* 단일 그리드 흐름을 유지한 채 광고를 한 줄(전체 폭)로 끼워 빈칸을 막는다 */}
          {slot && slotAfter != null && index === slotAfter - 1 && (
            <div className="col-span-full w-full">{slot}</div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
