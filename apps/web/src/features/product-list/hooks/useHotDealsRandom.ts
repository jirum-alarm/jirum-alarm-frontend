import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductListQueries } from '@/entities/product-list';

const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

export const useHotDealsRandom = () => {
  const { data } = useSuspenseQuery(
    ProductListQueries.hotdealProductsRandom({
      count: HOT_DEAL_COUNT_RANDOM,
      limit: HOT_DEAL_LIMIT_RANDOM,
    }),
  );
  return { data };
};
