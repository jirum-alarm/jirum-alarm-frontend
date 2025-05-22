import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import RecommendedProductTabsFetcher from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabsFetcher';
import RecommendContainer from '@/app/recommend/components/RecommendContainer';
import RecommendPageHeader from '@/app/recommend/components/RecommendPageHeader';
import BasicLayout from '@/components/layout/BasicLayout';
import { ProductQueries } from '@/entities/product';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';

const RecommendPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ recommend: string }>;
}) => {
  const { recommend } = await searchParams;
  const queryClient = new QueryClient();

  const { productKeywords } = await ProductService.getProductKeywords();

  queryClient.setQueryData(ProductQueries.productKeywords().queryKey, {
    productKeywords,
  });

  const isValid = recommend && productKeywords.includes(recommend);
  const keyword = isValid ? recommend : productKeywords[0];
  await queryClient.prefetchInfiniteQuery(
    ProductQueries.infiniteProductsByKeywords({
      limit: 12,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  return (
    <BasicLayout header={<RecommendPageHeader />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="px-[20px] pt-14">
          <RecommendContainer />
        </div>
      </HydrationBoundary>
    </BasicLayout>
  );
};

export default RecommendPage;
