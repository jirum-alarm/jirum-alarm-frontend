import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';

import { ProductCardType } from '../type';

import CarouselProductList from './CarouselProductList';
import CarouselProductListSkeleton from './CarouselProductListSkeleton';

export default function CarouselProductsSection({
  title,
  products,
  nested = false,
}: {
  title: string;
  products: ProductCardType[];
  nested?: boolean;
}) {
  return (
    <section>
      <SectionHeader shouldShowMobileUI title={title} />
      <Suspense fallback={<CarouselProductListSkeleton />}>
        <CarouselProductList products={products} type="hotDeal" nested={nested} />
      </Suspense>
    </section>
  );
}
