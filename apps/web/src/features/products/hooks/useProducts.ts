import {
  MutationAddWishlist,
  MutationRemoveWishlist,
  MutationCollectProduct,
  QueryProducts,
  QueryTogetherViewedProducts,
} from '@/graphql';
import {
  IProduct,
  IProductOutput,
  OrderOptionType,
  ProductOrderType,
  ProductThumbnailType,
} from '@/graphql/interface';
import { SuspenseQueryHookOptions, useMutation, useQuery, useSuspenseQuery } from '@apollo/client';

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

export const useGetProductTogetherViewed = (productId: number) => {
  return useSuspenseQuery<{ togetherViewedProducts: IProduct[] }>(QueryTogetherViewedProducts, {
    variables: {
      limit: 20,
      productId,
    },
    fetchPolicy: 'cache-and-network',
  });
};

export const useGetProductPopluar = (categoryId: number) => {
  return useSuspenseQuery<{ products: IProduct[] }>(QueryProducts, {
    variables: {
      limit: 20,
      categoryId,
      thumbnailType: ProductThumbnailType.MALL,
      isEnd: false,
    },
    fetchPolicy: 'cache-and-network',
  });
};

export const useGetProductTrendingList = (
  queryOptions: SuspenseQueryHookOptions<any, ProductTrendingVariables>,
) => {
  const { variables, ...rest } = queryOptions;
  return useSuspenseQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: variables?.limit,
      categoryId: variables?.categoryId,
      isHot: variables?.isHot,
      orderBy: variables?.orderBy,
      startDate: variables?.startDate,
      orderOption: OrderOptionType.DESC,
    },
    ...rest,
  });
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
