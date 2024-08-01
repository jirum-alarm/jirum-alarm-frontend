import { QueryTogetherViewedProducts } from '@/graphql';
import { IProduct } from '@/graphql/interface';
import { getClient } from '@/lib/client';

export const getProductRelated = async (productId: number) => {
  return getClient().query<{ togetherViewedProducts: IProduct[] }>({
    query: QueryTogetherViewedProducts,
    variables: {
      limit: 20,
      productId,
    },
  });
};
