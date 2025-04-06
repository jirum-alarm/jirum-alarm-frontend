'use client';

import { useContext } from 'react';

import { WatchDragContext } from '@/app/trending/components/trending-container';
import { EVENT } from '@/constants/mixpanel';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { IProduct } from '@/graphql/interface';

export default function RecommendationProduct({
  hotDeals,
  logging,
}: {
  hotDeals: IProduct[];
  logging: { page: keyof typeof EVENT.PAGE };
}) {
  const { setWatchDrag } = useContext(WatchDragContext);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setWatchDrag(false);
  };

  const handlePointerEnd = () => {
    setWatchDrag(true);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onPointerOut={handlePointerEnd}
    >
      <HorizontalProductCarousel
        products={hotDeals}
        type="hotDeal"
        logging={logging}
        maxItems={10}
      />
    </div>
  );
}
