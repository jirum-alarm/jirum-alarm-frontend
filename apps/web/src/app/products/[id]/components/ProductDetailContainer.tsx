import { getAccessToken } from '@/app/actions/token';
import { ProductQueries } from '@/entities/product';
import { QueryClient } from '@tanstack/react-query';
import ProductDetaiLayout from './ProductDetailLayout';

export default async function ProductDetailContainer({ productId }: { productId: number }) {
  const queryClient = new QueryClient();
  const productGuides = await queryClient.fetchQuery(ProductQueries.productGuide({ productId }));
  const token = await getAccessToken();

  return (
    <ProductDetaiLayout
      productId={productId}
      productGuides={productGuides.productGuides}
      isUserLogin={!!token}
    />
  );
}
