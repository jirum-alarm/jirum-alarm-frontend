import { QueryProducts } from '@/graphql';
import { IProductOutput } from '@/graphql/interface';
import { useQuery } from '@apollo/client';

export const useHotDeals = () => {
  const result = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 10,
      categoryId: 0,
    },
  });

  return result;
};
