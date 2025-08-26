import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { useDevice } from '@/hooks/useDevice';

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
    <section>
      <SectionHeader
        shouldShowMobileUI={shouldShowMobileUI}
        title={title}
        titleClassName="pc:text-2xl"
      />
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
