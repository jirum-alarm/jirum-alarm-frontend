'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import ImageComponent from '@/features/products/components/image/ProductImageComponent';

export default function ProductDetailImage({
  productId,
  fill,
}: {
  productId: number;
  fill: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  const thumbnail = product?.thumbnail ?? '';
  const title = product?.title ?? '';
  const categoryId = product?.categoryId;

  return (
    <ImageComponent
      src={thumbnail}
      alt={title}
      fill={fill}
      {...(!fill && { width: 512, height: 512, sizes: '512px' })}
      categoryId={categoryId}
      type="product-detail"
      priority
      loading="eager"
      fetchPriority="high"
      placeholder="empty"
      className="size-full object-contain"
    />
  );
}
