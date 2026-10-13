'use client';

import { emptyText } from '@jirum/design-system/recipes';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/shared/lib/cn';
import { LoadingSpinner } from '@/shared/ui/common/icons';

import TrackedProductGridList from '@/widgets/trending/ui/TrackedProductGridList';

import { beautyDealsQuery } from './beauty.query';

// 서버가 채운 첫 쪽(ISR 10분)을 그대로 쓴다. 기본 staleTime(1분)이면 하이드레이션 직후 다시 받아
// 읽던 카드 순서가 바뀐다 — 60일 반응 순 랭킹은 10분 안에 거의 안 움직인다.
const STALE_TIME_MS = 10 * 60 * 1000;

export default function BeautyDealList() {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery({
    ...beautyDealsQuery(),
    staleTime: STALE_TIME_MS,
  });

  const { ref } = useInView({
    rootMargin: '400px 0px',
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const products = useMemo(() => data.pages.flatMap(({ products }) => products), [data.pages]);

  if (products.length === 0) {
    return <p className={cn('py-20 text-center', emptyText)}>지금 진행 중인 뷰티 핫딜이 없어요.</p>;
  }

  return (
    <>
      <TrackedProductGridList
        products={products}
        source="beauty_landing"
        rankFrom={1}
        positionFrom={0}
        priorityCount={4}
      />
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
}
