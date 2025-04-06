'use client';

import useEmblaCarousel from 'embla-carousel-react';

import { EVENT } from '@/constants/mixpanel';
import { ProductImageCard } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';

interface HorizontalProductCarouselProps {
  products: IProduct[] | QueryProductsQuery['products'];
  itemWidth?: string;
  type?: 'product' | 'hotDeal';
  logging: { page: keyof typeof EVENT.PAGE };
  maxItems?: number;
}

function HorizontalProductCarousel({
  products,
  itemWidth = 'w-[120px]',
  type,
  logging,
  maxItems,
}: HorizontalProductCarouselProps) {
  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    skipSnaps: true,
    dragFree: false,
    loop: false,
    inViewThreshold: 0.5,
  });

  return (
    <div className="overflow-hidden">
      <div ref={emblaRef} onMouseMove={(e) => e.stopPropagation()}>
        <div className="flex gap-3">
          {itemsToShow.map((product, i) => (
            <div key={product.id || i} className={itemWidth}>
              <ProductImageCard product={product} type={type} logging={logging} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HorizontalProductCarousel;
