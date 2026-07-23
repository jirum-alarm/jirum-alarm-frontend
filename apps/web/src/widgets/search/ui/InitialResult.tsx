'use client';

import { cn } from '@/shared/lib/cn';

import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';
import CarouselProductListSkeleton from '@/entities/product-list/ui/carousel/CarouselProductListSkeleton';

import { useHotDealsRandom } from '@/features/product-list/hooks';

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
          // 로딩 중 500px 빈 공간 대신 스켈레톤 — 화면 구조가 유지돼 완성도 인상 보존
          <div className="min-h-[500px]">
            <CarouselProductListSkeleton />
          </div>
        ) : (
          <CarouselProductsSection
            title="추천 핫딜"
            products={hotDeals}
            source="search_recommend"
          />
        )}
      </div>
    </div>
  );
}
