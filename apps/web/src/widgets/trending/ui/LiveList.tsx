'use client';

import { memo, useEffect } from 'react';
import { useSwiper } from 'swiper/react';

import { ProductGridList, ProductGridListSkeleton } from '@/entities/product-list/ui/grid';

import useLiveViewModel from '../model/useLiveViewModel';

interface LiveListProps {
  categoryId: number | null;
}

const SIZE = 10;

const LiveList = ({ categoryId }: LiveListProps) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveViewModel({
    categoryId,
  });

  const swiper = useSwiper();

  // 무한스크롤로 상품이 늘어나면 activeSlide 높이가 커지는데, Swiper의 observer
  // 옵션(MutationObserver)만으론 이 변화를 놓쳐 autoHeight가 갱신되지 않는다.
  // 결과: wrapper height가 낡은 값에 고정되어 로딩 sentinel이 IntersectionObserver
  // 유효 범위 밖으로 밀려나고 다음 페이지 요청이 멈춘다. 개수 변화에 맞춰 직접 갱신.
  useEffect(() => {
    swiper.updateAutoHeight(0);
  }, [products.length, swiper]);

  return (
    <div className="pc:space-y-10 space-y-8">
      <div className="px-5">
        <ProductGridList products={products} />
      </div>
      <div
        className="flex min-h-10 w-full items-center justify-center px-5"
        ref={loadingCallbackRef}
      >
        {isFetchingNextPage && <ProductGridListSkeleton length={SIZE} />}
      </div>
    </div>
  );
};

export default memo(LiveList);
