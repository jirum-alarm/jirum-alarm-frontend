import { QueryProduct } from '@/graphql';
import { IProduct } from '@/graphql/interface';
import { getClient } from '@/lib/client';

export const getProductDetail = async (id: number) => {
  return getClient().query<{ product: IProduct }>({
    query: QueryProduct,
    variables: {
      id: id,
    },
  });
};
