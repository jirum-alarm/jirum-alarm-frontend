import { MutationCollectProduct, QueryProductsRanking } from '@/graphql';
import { IProductsRankingOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { SuspenseQueryHookOptions, useMutation, useSuspenseQuery } from '@apollo/client';
import dayjs from 'dayjs';

export const useCollectProduct = () => {
  const result = useMutation<unknown, { productId: number }>(MutationCollectProduct);

  const handleCollectProduct = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleCollectProduct;
};

export const useProductsRanking = (queryOptions?: SuspenseQueryHookOptions) => {
  const { ...rest } = queryOptions ?? {};
  return useSuspenseQuery<IProductsRankingOutput>(QueryProductsRanking, {
    ...rest,
    variables: {
      limit: 10,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderOption: OrderOptionType.DESC,
      startDate: '2024-07-17T12:56:05.316Z',
      // dayjs().add(-1, 'day').toDate()
    },
  });
};
