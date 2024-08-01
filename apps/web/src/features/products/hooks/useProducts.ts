import {
  MutationAddWishlist,
  MutationRemoveWishlist,
  MutationCollectProduct,
  QueryProducts,
} from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { skipToken, SuspenseQueryHookOptions, useMutation, useSuspenseQuery } from '@apollo/client';

export const useCollectProduct = () => {
  const result = useMutation<unknown, { productId: number }>(MutationCollectProduct);

  const handleCollectProduct = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleCollectProduct;
};

interface ProductTrendingVariables {
  limit: number;
  categoryId: number | null;
  startDate?: Date;
  orderBy: ProductOrderType;
  isHot: boolean;
}

export const useGetProductTrendingList = (
  queryOptions: SuspenseQueryHookOptions<any, ProductTrendingVariables>,
  skip?: { suspenseSkip: boolean },
) => {
  const { variables, ...rest } = queryOptions;
  return useSuspenseQuery<IProductOutput>(
    QueryProducts,
    skip?.suspenseSkip
      ? skipToken
      : {
          variables: {
            limit: variables?.limit,
            categoryId: variables?.categoryId,
            isHot: variables?.isHot,
            orderBy: variables?.orderBy,
            startDate: variables?.startDate,
            orderOption: OrderOptionType.DESC,
          },
          ...rest,
        },
  );
};

export const useAddWishlist = () => {
  const result = useMutation<unknown, { productId: number }>(MutationAddWishlist);

  const handleAddWishlist = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleAddWishlist;
};

export const useRemoveWishlist = () => {
  const result = useMutation<unknown, { productId: number }>(MutationRemoveWishlist);

  const handleRemoveWishlist = (productId: number) => {
    result[0]({ variables: { productId } });
  };

  return handleRemoveWishlist;
};
