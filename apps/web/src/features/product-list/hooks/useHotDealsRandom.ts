import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

export const useHotDealsRandom = () => {
  const { data } = useSuspenseQuery(
    ProductQueries.hotdealProductsRandom({
      count: HOT_DEAL_COUNT_RANDOM,
      limit: HOT_DEAL_LIMIT_RANDOM,
    }),
  );
  return { data };
};
