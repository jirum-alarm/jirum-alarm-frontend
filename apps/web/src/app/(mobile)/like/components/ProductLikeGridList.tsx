'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { Heart } from '@/components/common/icons';
import { EVENT } from '@/constants/mixpanel';
import ProductGridCard from '@/features/products/components/grid/ProductGridCard';
import { QueryWishlistsQuery } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';

type ProductGridListProps = {
  products: QueryWishlistsQuery['wishlists'][number]['product'][];
  loggingPage: keyof typeof EVENT.PAGE;
};

export default function ProductLikeGridList({ products, loggingPage }: ProductGridListProps) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 sm:grid-cols-3">
      {products.map((product) => (
        <ProductGridCard
          key={product.id}
          product={product}
          logging={{ page: loggingPage }}
          actionIcon={<ProductLikeAction productId={product.id} />}
        />
      ))}
    </div>
  );
}

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
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_WISH.NAME, {
      //   type: EVENT.PRODUCT_WISH.TYPE.REMOVE,
      //   page: EVENT.PAGE.LIKE,
      // });
      removeWishlist({ productId: +productId });
      setIsLiked(false);
      return;
    }

    if (!isLiked) {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_WISH.NAME, {
      //   type: EVENT.PRODUCT_WISH.TYPE.ADD,
      //   page: EVENT.PAGE.LIKE,
      // });
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
