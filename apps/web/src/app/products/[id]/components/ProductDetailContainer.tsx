import { getAccessToken } from '@/app/actions/token';
import { ProductQueries } from '@/entities/product';
import { QueryClient } from '@tanstack/react-query';
import ProductDetailLayout from './ProductDetailLayout';

export default async function ProductDetailContainer({ productId }: { productId: number }) {
  const queryClient = new QueryClient();

  const [productGuides, token] = await Promise.all([
    queryClient.fetchQuery(ProductQueries.productGuide({ productId })),
    getAccessToken(),
  ]);

  return (
    <ProductDetailLayout
      productId={productId}
      productGuides={productGuides.productGuides}
      isUserLogin={!!token}
    />
  );
}
