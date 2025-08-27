'use client';

import { cn } from '@/lib/cn';

import { CarouselProductsSection } from '@features/products/carousel';
import { useHotDealsRandom } from '@features/products/hooks';

import RecentKeywords from './RecentKeywords';
import RecommendationKeywords from './RecommendationKeywords';

export default function InitialResult({ show }: { show: boolean }) {
  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      <div className="flex flex-col gap-y-5 pt-2">
        <RecentKeywords />
        <RecommendationKeywords />
        {!hotDeals?.length ? (
          <div className="flex min-h-[500px]">
            <></>
          </div>
        ) : (
          <div className="px-5">
            <CarouselProductsSection title="추천 핫딜" products={hotDeals} />
          </div>
        )}
      </div>
    </div>
  );
}
