import { QueryProducts } from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { useQuery } from '@apollo/client';

const HOT_DEAL_CATEGORY_ID = 0;

export const HOT_DEAL_LIMIT = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

const now = new Date();
const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const twoDaysAgo = new Date(kstDate.getTime() - 2 * 24 * 60 * 60 * 1000);
const startDate = twoDaysAgo.toISOString();

export const useHotDeals = ({ limit = HOT_DEAL_LIMIT }: { limit?: number } = {}) => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId: HOT_DEAL_CATEGORY_ID,
      startDate,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderByOption: OrderOptionType.DESC,
    },
  });

  return result;
};

export const useHotDealsRandom = ({ limit = HOT_DEAL_LIMIT_RANDOM }: { limit?: number } = {}) => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      categoryId: HOT_DEAL_CATEGORY_ID,
      startDate,
      orderBy: ProductOrderType.COMMUNITY_RANKING_RANDOM,
      orderByOption: OrderOptionType.DESC,
    },
  });

  return result;
};
