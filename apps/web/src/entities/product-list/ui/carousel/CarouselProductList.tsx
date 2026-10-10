'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { ArrowLeft, ArrowRight } from '@/shared/ui/common/icons';

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
 * PC 는 좌우 화살표로 넘긴다 — swiper 의 마우스 드래그가 빠졌고 스크롤바도 숨겨져, 휠 마우스로는 넘길 길이 없었다.
 */
function CarouselProductList({
  products,
  maxItems,
  nested = false,
  priorityCount = 0,
  source,
}: CarouselProductListProps) {
  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;
  const listRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const updateEdge = () => {
    const el = listRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  };

  useEffect(updateEdge, [itemsToShow.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = listRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <ul
        ref={listRef}
        onScroll={updateEdge}
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
      {!edge.start && <ArrowButton dir={-1} onClick={() => scrollByPage(-1)} />}
      {!edge.end && <ArrowButton dir={1} onClick={() => scrollByPage(1)} />}
    </div>
  );
}

function ArrowButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  const Icon = dir === 1 ? ArrowRight : ArrowLeft;
  return (
    <button
      type="button"
      aria-label={dir === 1 ? '다음 상품' : '이전 상품'}
      onClick={onClick}
      // 사진(192px) 세로 가운데 = my-7(28) + 96. 좌우는 안쪽으로 — 상세는 조상 overflow-x-hidden 이 바깥 20px 를 자른다
      className={cn(
        'pc:flex shadow-card absolute top-[124px] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white',
        dir === 1 ? 'right-7' : 'left-7',
      )}
    >
      <Icon width={20} height={20} />
    </button>
  );
}

export default CarouselProductList;
