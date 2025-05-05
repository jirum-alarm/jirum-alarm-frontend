import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

interface ProductImageCardListProps {
  keyword: string;
}

const RecommendProductList = ({ keyword }: ProductImageCardListProps) => {
  const collectProduct = useCollectProduct();
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProductsByKeywords({
      limit: 12,
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
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
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
