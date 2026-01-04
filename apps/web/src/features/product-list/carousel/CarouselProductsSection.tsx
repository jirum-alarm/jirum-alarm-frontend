import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';
import SectionHeader from '@/shared/ui/SectionHeader';

import { type ProductCardType } from '@/entities/product';

import CarouselProductList from './CarouselProductList';
import CarouselProductListSkeleton from './CarouselProductListSkeleton';

export default function CarouselProductsSection({
  title,
  products,
  nested = false,
  shouldShowMobileHeader = true,
  isFullWidth = false,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
  shouldShowMobileHeader?: boolean;
  isFullWidth?: boolean;
}) {
  return (
    <section>
      <div className="pc:px-0 px-5">
        <SectionHeader shouldShowMobileUI={shouldShowMobileHeader} title={title} />
      </div>
      <div className={cn({ 'pc:px-5': nested, 'pc:-px-5': isFullWidth })}>
        <Suspense fallback={<CarouselProductListSkeleton />}>
          <CarouselProductList products={products} nested={nested} />
        </Suspense>
      </div>
    </section>
  );
}
