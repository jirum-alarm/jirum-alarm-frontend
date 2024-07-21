import { MutationCollectProduct, QueryProducts } from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { skipToken, SuspenseQueryHookOptions, useMutation, useSuspenseQuery } from '@apollo/client';

export const useCollectProduct = () => {
  const result = useMutation<unknown, { productId: number }>(MutationCollectProduct);

  const handleCollectProduct = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleCollectProduct;
};

interface ProductTrendingVariables {
  limit: number;
  categoryId: number | null;
  startDate?: Date;
  orderBy: ProductOrderType;
  isHot: boolean;
}

export const useGetProductTrendingList = (
  queryOptions: SuspenseQueryHookOptions<any, ProductTrendingVariables>,
  skip?: { suspenseSkip: boolean },
) => {
  const { variables, ...rest } = queryOptions;
  return useSuspenseQuery<IProductOutput>(
    QueryProducts,
    skip?.suspenseSkip
      ? skipToken
      : {
          variables: {
            limit: variables?.limit,
            categoryId: variables?.categoryId,
            isHot: variables?.isHot,
            orderBy: variables?.orderBy,
            startDate: variables?.startDate,
            // ProductOrderType.POSTED_AT
            orderByOption: OrderOptionType.DESC,
          },
          ...rest,
        },
  );
};
