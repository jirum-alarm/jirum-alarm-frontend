import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

interface ProductImageCardListProps {
  keyword: string;
  limit?: number;
}

const RecommendProductList = ({ keyword, limit = 12 }: ProductImageCardListProps) => {
  const collectProduct = useCollectProduct();
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProductsByKeywords({
      limit,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );
  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 sm:grid-cols-3">
        {data.pages.flatMap(({ productsByKeyword }) =>
          productsByKeyword.map((product) => (
            <ProductLiveHotdealsImageCard
              key={product.id}
              product={product}
              collectProduct={collectProduct}
              logging={{ page: 'RECOMMEND' }}
            />
          )),
        )}
      </div>
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

export default RecommendProductList;
