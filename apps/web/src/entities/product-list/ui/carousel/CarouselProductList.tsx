import { cn } from '@/shared/lib/cn';

import { type ProductCardSource } from '@/entities/product-list/model/card-tracking';
import { ProductCardType } from '@/entities/product-list/model/types';

import CarouselProductCard from './CarouselProductCard';

interface CarouselProductListProps {
  products: ProductCardType[];
  itemWidth?: string;
  maxItems?: number;
  /** 부모가 Swiper 일 때(트렌딩). 이 영역의 터치를 부모가 가져가지 않게 한다. */
  nested?: boolean;
  priorityCount?: number;
  source?: ProductCardSource;
}

/**
 * 가로 상품 캐러셀. swiper 대신 네이티브 overflow 스크롤.
 * 쓰던 옵션이 slidesPerView:'auto' + spaceBetween(12/24) + 양끝 offset(20/0) 뿐이라 flex + gap + padding 으로
 * 같다. 덕분에 상세·검색·추천에서 swiper 28KB(gz) 와 swiper/css 가 빠지고, init 전 패딩 보정(isInit)도 없다.
 * `swiper-no-swiping` 은 Swiper 의 noSwiping 기본 클래스 — 부모 Swiper 가 이 안의 터치로 슬라이드하지 않는다.
 */
function CarouselProductList({
  products,
  maxItems,
  nested = false,
  priorityCount = 0,
  source,
}: CarouselProductListProps) {
  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <ul
      className={cn(
        'pc:my-7 pc:gap-6 pc:px-0 scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5',
        nested && 'swiper-no-swiping',
      )}
    >
      {itemsToShow.map((product, i) => (
        <li key={product.id || i} className="shrink-0">
          <CarouselProductCard product={product} priority={i < priorityCount} source={source} />
        </li>
      ))}
    </ul>
  );
}

export default CarouselProductList;
