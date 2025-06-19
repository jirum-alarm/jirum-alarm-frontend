import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import BasicLayout from '@/components/layout/BasicLayout';
import { ProductQueries } from '@/entities/product';
import { ProductGuidesQuery, ProductQuery } from '@/shared/api/gql/graphql';

import ProductDetailPageHeader from './ProductDeatilPageHeader';
import ProductDetailContainer from './ProductDetailContainer';

type Product = NonNullable<ProductQuery['product']>;
type ProductGuides = ProductGuidesQuery['productGuides'];

const ProductDetailContainerServer = async ({
  productId,
  product,
  productGuides,
}: {
  productId: number;
  product: Product;
  productGuides: ProductGuides;
}) => {
  const queryClient = new QueryClient();

  queryClient.setQueryData(ProductQueries.product({ id: productId }).queryKey, { product });
  await queryClient.prefetchQuery(ProductQueries.reportUserNames({ productId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BasicLayout header={<ProductDetailPageHeader productId={productId} />}>
        <ProductDetailContainer productId={productId} productGuides={productGuides} />
      </BasicLayout>
    </HydrationBoundary>
  );
};

export default ProductDetailContainerServer;
