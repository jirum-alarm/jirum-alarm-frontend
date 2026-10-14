import { ReactNode, Suspense } from 'react';

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
  priorityCount = 0,
  source,
  right,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
  shouldShowMobileHeader?: boolean;
  priorityCount?: number;
  source?: ProductCardSource;
  /** 제목 오른쪽(더보기 링크 등). */
  right?: ReactNode;
}) {
  return (
    <section>
      <div className="pc:px-0 px-5">
        <SectionHeader shouldShowMobileUI={shouldShowMobileHeader} title={title} right={right} />
      </div>
      {/* 모바일: 리스트가 -mx-5 로 양옆 20px 를 빼 쓰므로 여기서 px-5 로 받아준다. 없으면 페이지가
          20px 가로로 밀린다(상세·검색, 2026-10-08 실측 scrollWidth 380/360).
          PC: 둘 다 0 — 리스트가 제목과 같은 선에서 시작한다. 예전엔 PC 에도 -mx-5 가 남아 첫 카드가 제목보다
          20px 왼쪽에서 시작했고, 상세는 조상 overflow-x-hidden 이 그 20px 를 잘라 첫 카드가 깨져 보였다(2026-10-14). */}
      <div className="pc:px-0 px-5">
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
