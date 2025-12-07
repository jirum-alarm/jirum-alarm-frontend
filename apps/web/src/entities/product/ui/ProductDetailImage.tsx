'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';
import NoImage from '@/shared/ui/NoImage';

export default function ProductDetailImage({
  productId,
  fill,
}: {
  productId: number;
  fill: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  const thumbnail = convertToWebp(product?.thumbnail) ?? '';
  const originalThumbnail = product?.thumbnail ?? '';
  const title = product?.title ?? '';
  const categoryId = product?.categoryId;

  return (
    <ImageComponent
      src={thumbnail}
      fallbackSrc={originalThumbnail}
      alt={title}
      fill={fill}
      {...(!fill && { width: 512, height: 512, sizes: '512px' })}
      fallback={<NoImage type="product-detail" categoryId={categoryId} />}
      priority
      loading="eager"
      fetchPriority="high"
      className="size-full object-cover"
    />
  );
}
