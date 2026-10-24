'use client';

import { emptyText } from '@jirum/design-system/recipes';
import { HOT_FEED_CARD_SOURCE, HOT_FEED_COPY } from '@jirum/domain/ranking';
import { memo, useEffect } from 'react';
import { useSwiper } from 'swiper/react';

import { type ProductCardType } from '@/entities/product-list/model/types';
import { ProductGridListSkeleton } from '@/entities/product-list/ui/grid';

import useHotFeedViewModel from '../model/useHotFeedViewModel';
import useLiveViewModel from '../model/useLiveViewModel';

import TrackedProductGridList from './TrackedProductGridList';

export type FeedKind = 'live' | 'hot';

interface FeedListProps {
  feed: FeedKind;
  categoryId: number | null;
}

const SIZE = 10;
/** 「핫딜만」 끔 = 올라온 딜 전부. 앱과 같은 출처 값(앱은 전부터 이 값으로 노출을 보냈다). */
const LIVE_CARD_SOURCE = 'live_tab';

/**
 * 발견 탭 「실시간」 목록 — 「핫딜만」 칩을 켜면 문턱 넘은 딜만 핫딜 된 시각순(/trending/hot), 끄면 올라온 딜 전부 최신순(/trending/live).
 * 두 주소는 그대로 둔다(검색 색인·딥링크). 데이터만 다르고 모양은 하나라 FeedGrid 를 같이 쓴다.
 * 칩은 카테고리 줄 끝(LiveContainer → TabBarV2 trailing)에 있다 — 목록 위에 한 줄을 더 쌓지 않는다.
 */
const FeedList = ({ feed, categoryId }: FeedListProps) =>
  feed === 'hot' ? <HotFeed categoryId={categoryId} /> : <LiveFeed categoryId={categoryId} />;

const HotFeed = ({ categoryId }: { categoryId: number | null }) => (
  <FeedGrid feed="hot" {...useHotFeedViewModel({ categoryId })} />
);

const LiveFeed = ({ categoryId }: { categoryId: number | null }) => (
  <FeedGrid feed="live" {...useLiveViewModel({ categoryId })} />
);

const FeedGrid = ({
  feed,
  products,
  loadingCallbackRef,
  isFetchingNextPage,
}: {
  feed: FeedKind;
  products: ProductCardType[];
  loadingCallbackRef: (node?: Element | null) => void;
  isFetchingNextPage: boolean;
}) => {
  const swiper = useSwiper();

  // 무한스크롤로 상품이 늘어나면 activeSlide 높이가 커지는데, Swiper의 observer
  // 옵션(MutationObserver)만으론 이 변화를 놓쳐 autoHeight가 갱신되지 않는다.
  // 결과: wrapper height가 낡은 값에 고정되어 로딩 sentinel이 IntersectionObserver
  // 유효 범위 밖으로 밀려나고 다음 페이지 요청이 멈춘다. 개수 변화에 맞춰 직접 갱신.
  useEffect(() => {
    swiper.updateAutoHeight(0);
  }, [products.length, swiper]);

  const isHot = feed === 'hot';

  return (
    <div className="pc:space-y-10 space-y-8">
      <div className="space-y-4 px-5">
        {products.length === 0 ? (
          <p className={emptyText}>{HOT_FEED_COPY.empty}</p>
        ) : (
          <TrackedProductGridList
            products={products}
            source={isHot ? HOT_FEED_CARD_SOURCE : LIVE_CARD_SOURCE}
            positionFrom={0}
            priorityCount={4}
          />
        )}
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

export default memo(FeedList);
