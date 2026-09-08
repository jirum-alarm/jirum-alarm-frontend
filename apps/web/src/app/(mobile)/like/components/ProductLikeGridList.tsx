'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { QueryWishlistsQuery } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { Heart } from '@/shared/ui/common/icons';

import { ProductGridCard } from '@/entities/product-list/ui/grid';

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
          source="wishlist"
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
      removeWishlist({ productId: +productId });
      setIsLiked(false);
      return;
    }

    if (!isLiked) {
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
