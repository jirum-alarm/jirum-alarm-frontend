import { QueryProductGuides } from '@/graphql';
import { IProductGuide } from '@/graphql/interface';
import { getClient } from '@/lib/client';

export const getProductGuides = async (productId: number) => {
  return getClient().query<{ productGuides: IProductGuide[] }>({
    query: QueryProductGuides,
    variables: {
      productId,
    },
  });
};
