import { MutationCollectProduct } from '@/graphql';
import { useMutation } from '@apollo/client';

export const useCollectProduct = () => {
  const result = useMutation<unknown, { productId: number }>(MutationCollectProduct);

  return result;
};
