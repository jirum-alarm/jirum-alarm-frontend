import { useMutation } from '@tanstack/react-query';

import { ProductService } from '@/shared/api/product';

export const useCollectProduct = () => {
  const { mutate: collectProduct } = useMutation({
    mutationFn: ProductService.collectProduct,
  });

  return collectProduct;
};
