import { useMutation } from '@apollo/client';

import { MutationCollectProduct } from '@/graphql';

export const useProductsRanking = () => {
  const result = useMutation<unknown, { productId: number }>(MutationCollectProduct);

  const handleCollectProduct = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleCollectProduct;
};
