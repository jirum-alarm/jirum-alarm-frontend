'use client';

import { cn } from '@/shared/lib/cn';

import { type ProductCardType } from '@/entities/product-list/model/types';

import { useRankingImpressionTracker } from '../model/useRankingImpressionTracker';

import TrackedProductGridCard from './TrackedProductGridCard';

interface Props {
  products: ProductCardType[];
  source: string;
  // 이 그리드의 첫 카드가 전체 랭킹에서 갖는 1-based rank(뱃지 표시용).
  rankFrom: number;
  // 이 그리드의 첫 카드가 전체 랭킹에서 갖는 0-based position(CTR 측정용).
  positionFrom: number;
  priorityCount?: number;
  displayTime?: boolean;
  className?: string;
  cardClassName?: string;
}

// ProductGridList 와 동일 레이아웃이되 노출/클릭 추적이 붙은 랭킹 탭 전용 그리드.
// 공유 ProductGridList 를 오염시키지 않기 위해 분리. tracker 는 두 그리드가 따로
// 가지지만 dedup 키가 (productId, position) 라 position 이 겹치지 않으면 안전하다.
export default function TrackedProductGridList({
  products,
  source,
  rankFrom,
  positionFrom,
  priorityCount = 0,
  displayTime = true,
  className,
  cardClassName,
}: Props) {
  const { recordImpression, recordClick } = useRankingImpressionTracker(source);

  return (
    <div
      className={cn(
        'pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3',
        className,
      )}
    >
      {products.map((product, index) => (
        <TrackedProductGridCard
          key={product.id}
          product={product}
          rank={rankFrom + index}
          position={positionFrom + index}
          priority={index < priorityCount}
          displayTime={displayTime}
          className={cardClassName}
          recordImpression={recordImpression}
          recordClick={recordClick}
        />
      ))}
    </div>
  );
}
