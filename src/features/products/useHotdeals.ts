import { QueryCommunityRandomRankingProducts, QueryProducts } from '@/graphql';
import {
  CommunityRandomRankingProductsOutPut,
  IProductOutput,
  OrderOptionType,
  ProductOrderType,
} from '@/graphql/interface';
import { useQuery } from '@apollo/client';

export const HOT_DEAL_LIMIT = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

export const useHotDeals = ({ limit = HOT_DEAL_LIMIT }: { limit?: number } = {}) => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      isHot: true,
      orderBy: ProductOrderType.POSTED_AT,
      orderByOption: OrderOptionType.DESC,
    },
  });

  return result;
};

export const useHotDealsRandom = ({ limit = HOT_DEAL_LIMIT_RANDOM }: { limit?: number } = {}) => {
  const result = useQuery<CommunityRandomRankingProductsOutPut>(
    QueryCommunityRandomRankingProducts,
    {
      variables: {
        count: 10,
        limit,
        isApp: false,
        isReward: false,
        isGame: false,
      },
    },
  );

  return result;
};
