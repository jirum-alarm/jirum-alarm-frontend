import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';

import { ProductCardType } from '../type';

import CarouselProductList from './CarouselProductList';
import CarouselProductListSkeleton from './CarouselProductListSkeleton';

export default function CarouselProductsSection({
  title,
  products,
  nested = false,
  shouldShowMobileUI = true,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
  shouldShowMobileUI?: boolean;
}) {
  const { device } = useDevice();

  return (
    <section className="-mx-5">
      <div className="px-5">
        <SectionHeader
          shouldShowMobileUI={shouldShowMobileUI}
          title={title}
          titleClassName="pc:text-[20px]"
        />
      </div>
      <Suspense fallback={<CarouselProductListSkeleton />}>
        <CarouselProductList
          products={products}
          type={device.isMobile ? 'mobile' : 'pc'}
          nested={nested}
        />
      </Suspense>
    </section>
  );
}
