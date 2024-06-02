import { QueryCommunityRandomRankingProducts, QueryProducts } from '@/graphql';
import {
  CommunityRandomRankingProductsOutPut,
  IProductOutput,
  OrderOptionType,
  ProductOrderType,
} from '@/graphql/interface';
import { useQuery } from '@apollo/client';

const HOT_DEAL_CATEGORY_ID = 0;

export const HOT_DEAL_LIMIT = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

export const useHotDeals = ({ limit = HOT_DEAL_LIMIT }: { limit?: number } = {}) => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId: HOT_DEAL_CATEGORY_ID,
      orderBy: ProductOrderType.ID,
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
