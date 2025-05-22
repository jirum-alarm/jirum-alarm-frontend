import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';
import { ProductQueries } from '@/entities/product/product.queries';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendedProductTabsFetcher from './RecommendedProductTabsFetcher';

const RecommendedProductContainer = async ({ recommend }: { recommend?: string }) => {
  const queryClient = new QueryClient();

  const { productKeywords } = await ProductService.getProductKeywords();

  await queryClient.setQueryData(ProductQueries.productKeywords().queryKey, {
    productKeywords,
  });

  const isValid = recommend && productKeywords.includes(recommend);
  const keyword = isValid ? recommend : productKeywords[0];
  await queryClient.prefetchQuery(
    ProductQueries.productsByKeywords({
      limit: 10,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  return (
    <div className="px-5">
      <SectionHeader
        title="지름알림 추천"
        right={<RecommendedMoreLink>더보기</RecommendedMoreLink>}
      />
      <div className="pb-5">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ApiErrorBoundary>
            <RecommendedProductTabsFetcher>
              <Suspense>
                <RecommendedProductList />
              </Suspense>
            </RecommendedProductTabsFetcher>
          </ApiErrorBoundary>
        </HydrationBoundary>
      </div>
    </div>
  );
};

export default RecommendedProductContainer;
