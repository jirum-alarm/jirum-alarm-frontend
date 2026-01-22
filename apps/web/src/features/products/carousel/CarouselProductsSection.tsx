import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { cn } from '@/lib/cn';

import { ProductCardType } from '../type';

import CarouselProductList from './CarouselProductList';
import CarouselProductListSkeleton from './CarouselProductListSkeleton';

export default function CarouselProductsSection({
  title,
  products,
  nested = false,
  shouldShowMobileHeader = true,
  isFullWidth = false,
  priorityCount = 0,
  displayTime = true,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
  shouldShowMobileHeader?: boolean;
  isFullWidth?: boolean;
  priorityCount?: number;
  displayTime?: boolean;
}) {
  return (
    <section>
      <div className="pc:px-0 px-5">
        <SectionHeader shouldShowMobileUI={shouldShowMobileHeader} title={title} />
      </div>
      <div className={cn({ 'pc:px-5': nested, 'pc:-px-5': isFullWidth })}>
        <Suspense fallback={<CarouselProductListSkeleton />}>
          <CarouselProductList
            products={products}
            nested={nested}
            priorityCount={priorityCount}
            displayTime={displayTime}
          />
        </Suspense>
      </div>
    </section>
  );
}
