'use client';
import { ProductLikeCard } from '@/features/products/components/ProductLikeCard';
import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Heart, LoadingSpinner } from '@/components/common/icons';
import { useInView } from 'react-intersection-observer';
import { WishlistQueries } from '@/entities/wishlist';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { useState } from 'react';
import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/components/Mixpanel';

const LIMIT = 18;

const ProductLikeContainer = () => {
  const { mutate } = useMutation({ mutationFn: ProductService.collectProduct });
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

  const wishlists = pages.flatMap((page) => page.wishlists);

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && wishlists.length >= LIMIT) {
        fetchNextPage();
      }
    },
  });

  return (
    <div>
      <div className="pb-3 text-sm">
        전체 <span className="font-semibold">{wishlistCount}</span>개
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {wishlists.map((wishlist) => (
          <ProductLikeCard
            key={wishlist.id}
            product={wishlist.product}
            collectProduct={(productId: number) => mutate({ productId })}
            logging={{ page: 'LIKE' }}
            actionIcon={<ProductLikeAction productId={wishlist.product.id} />}
          />
        ))}
      </div>
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default ProductLikeContainer;

const ProductLikeAction = ({ productId }: { productId: string }) => {
  const [isLiked, setIsLiked] = useState(true);

  const { mutate: addWishlist } = useMutation({
    mutationFn: WishlistService.addWishlist,
  });
  const { mutate: removeWishlist } = useMutation({
    mutationFn: WishlistService.removeWishlist,
  });

  const handleClickWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isLiked) {
      mp?.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.REMOVE,
        page: EVENT.PAGE.LIKE,
      });
      removeWishlist({ productId: +productId });
      setIsLiked(false);
      return;
    }

    if (!isLiked) {
      mp?.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.ADD,
        page: EVENT.PAGE.LIKE,
      });
      addWishlist({ productId: +productId });
      setIsLiked(true);
      return;
    }
  };

  return (
    <button className="p-3" onClick={handleClickWishlist}>
      <Heart isLiked={isLiked} />
    </button>
  );
};
