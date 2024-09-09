import { useQuery } from '@apollo/client';

import { QueryCommunityRandomRankingProducts, QueryProducts } from '@/graphql';
import {
  CommunityRandomRankingProductsOutPut,
  IProductOutput,
  OrderOptionType,
  ProductOrderType,
} from '@/graphql/interface';

export const HOT_DEAL_LIMIT = 20;

const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

export const useHotDeals = ({
  limit = HOT_DEAL_LIMIT,
  skip = false,
}: { limit?: number; skip?: boolean } = {}) => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      orderBy: ProductOrderType.POSTED_AT,
      orderByOption: OrderOptionType.DESC,
      isHot: true,
    },
    skip,
  });

  return result;
};

export const useHotDealsRandom = ({
  count = HOT_DEAL_COUNT_RANDOM,
  limit = HOT_DEAL_LIMIT_RANDOM,
}: { count?: number; limit?: number } = {}) => {
  const result = useQuery<CommunityRandomRankingProductsOutPut>(
    QueryCommunityRandomRankingProducts,
    {
      variables: {
        count,
        limit,
      },
    },
  );

  return result;
};
