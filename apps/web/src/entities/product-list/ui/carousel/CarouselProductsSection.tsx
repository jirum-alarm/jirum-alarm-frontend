import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';
import SectionHeader from '@/shared/ui/SectionHeader';

import { type ProductCardSource } from '@/entities/product-list/model/card-tracking';
import { ProductCardType } from '@/entities/product-list/model/types';

import CarouselProductList from './CarouselProductList';
import CarouselProductListSkeleton from './CarouselProductListSkeleton';

export default function CarouselProductsSection({
  title,
  products,
  nested = false,
  shouldShowMobileHeader = true,
  isFullWidth = false,
  priorityCount = 0,
  source,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
  shouldShowMobileHeader?: boolean;
  isFullWidth?: boolean;
  priorityCount?: number;
  source?: ProductCardSource;
}) {
  return (
    <section>
      <div className="pc:px-0 px-5">
        <SectionHeader shouldShowMobileUI={shouldShowMobileHeader} title={title} />
      </div>
      {/* 리스트가 -mx-5 로 양옆 20px 를 빼 쓰므로 모바일은 여기서 px-5 로 받아준다. 없으면 페이지가
          20px 가로로 밀린다(상세·검색, 2026-10-08 실측 scrollWidth 380/360). */}
      <div className={cn('pc:px-0 px-5', { 'pc:px-5': nested, 'pc:-px-5': isFullWidth })}>
        <Suspense fallback={<CarouselProductListSkeleton />}>
          <CarouselProductList
            products={products}
            nested={nested}
            priorityCount={priorityCount}
            source={source}
          />
        </Suspense>
      </div>
    </section>
  );
}
