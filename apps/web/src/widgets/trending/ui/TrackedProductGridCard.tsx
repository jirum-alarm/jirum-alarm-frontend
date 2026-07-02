'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductGridCard from '@/entities/product-list/ui/grid/ProductGridCard';

interface Props {
  product: ProductCardType;
  rank?: number;
  position: number;
  priority?: boolean;
  displayTime?: boolean;
  className?: string;
  recordImpression: (productId: number, position: number) => void;
  recordClick: (productId: number, position: number) => void;
}

// 노출/클릭 추적이 붙은 랭킹 탭 전용 카드. 공유 ProductGridCard 는 건드리지 않고
// opt-in props(onCardClick, cardRef)만 사용. viewport 50% 이상 보이면 1회 노출 기록.
export default function TrackedProductGridCard({
  product,
  rank,
  position,
  priority,
  displayTime,
  className,
  recordImpression,
  recordClick,
}: Props) {
  const productId = Number(product.id);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (inView && Number.isFinite(productId)) {
      recordImpression(productId, position);
    }
  }, [inView, productId, position, recordImpression]);

  return (
    <ProductGridCard
      product={product}
      rank={rank}
      priority={priority}
      displayTime={displayTime}
      className={className}
      cardRef={ref}
      source="ranking_tab"
      onCardClick={() => {
        if (Number.isFinite(productId)) recordClick(productId, position);
      }}
    />
  );
}
