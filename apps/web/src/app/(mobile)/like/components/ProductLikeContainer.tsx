'use client';

import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { LoadingSpinner } from '@/components/common/icons';
import { WishlistQueries } from '@/entities/wishlist';
import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';

import ProductLikeGridList from './ProductLikeGridList';

const LIMIT = 18;

const ProductLikeContainer = () => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    WishlistQueries.infiniteWishlists({
      orderBy: WishlistOrderType.Id,
      orderOption: OrderOptionType.Desc,
      limit: LIMIT,
    }),
  );
  const {
    data: { wishlistCount },
  } = useSuspenseQuery(WishlistQueries.wishlistCount());

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && wishlists.length >= LIMIT) {
        fetchNextPage();
      }
    },
  });

  const wishlists = pages.flatMap((page) => page.wishlists);

  return (
    <div>
      <div className="pb-3 text-sm">
        전체 <span className="font-semibold">{wishlistCount}</span>개
      </div>
      <ProductLikeGridList products={wishlists.map((w) => w.product)} loggingPage={'LIKE'} />
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default ProductLikeContainer;
