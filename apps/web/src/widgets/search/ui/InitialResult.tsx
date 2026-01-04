'use client';

import { cn } from '@/shared/lib/cn';

import { CarouselProductsSection } from '@/entities/product-list';

import { useHotDealsRandom } from '@/features/product-list';

import RecentKeywords from './RecentKeywords';
import RecommendationKeywords from './RecommendationKeywords';

export default function InitialResult({ show }: { show: boolean }) {
  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      <div className="pc:space-y-8 pc:pt-6 space-y-5 pt-2">
        <RecentKeywords />
        <RecommendationKeywords />
        {!hotDeals?.length ? (
          <div className="flex min-h-[500px]">
            <></>
          </div>
        ) : (
          <CarouselProductsSection title="추천 핫딜" products={hotDeals} />
        )}
      </div>
    </div>
  );
}
