import { QueryProducts } from '@/graphql';
import { IProduct } from '@/graphql/interface';
import { getClient } from '@/lib/client';

export const getProductPopular = async (categoryId: number) => {
  return getClient().query<{ products: IProduct[] }>({
    query: QueryProducts,
    variables: {
      limit: 20,
      categoryId,
    },
  });
};
