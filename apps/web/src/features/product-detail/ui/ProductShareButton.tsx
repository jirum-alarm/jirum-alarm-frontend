import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import ShareButton from '@shared/ui/ShareButton';

import { ProductQueries } from '@entities/product';

export default function ProductShareButton({ productId }: { productId: number }) {
  const { data: product, isLoading } = useSuspenseQuery(
    ProductQueries.productInfo({ id: productId }),
  );

  if (isLoading) {
    return null;
  }

  if (!product) {
    notFound();
  }

  const title = `${product.title} | 지름알림`;

  return <ShareButton title={title} page="DETAIL" />;
}
