'use client';

import { ProductGridCard } from '@/entities/product-list/ui/grid';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { QueryWishlistsQuery } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { EVENT } from '@/shared/config/mixpanel';
import { Heart } from '@/shared/ui/common/icons';


type ProductGridListProps = {
  products: QueryWishlistsQuery['wishlists'][number]['product'][];
};

export default function ProductLikeGridList({ products }: ProductGridListProps) {
  return (
    <div className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
      {products.map((product) => (
        <ProductGridCard
          key={product.id}
          product={product}
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
