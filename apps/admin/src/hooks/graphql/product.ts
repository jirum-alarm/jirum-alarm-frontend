import { QueryHookOptions, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import { QueryProduct, QueryProducts } from '@/graphql/product';

export interface ProductListItem {
  id: number;
  title: string;
  mallId: string;
  url: string;
  isHot: boolean;
  isEnd: boolean;
  price: number;
  providerId: number;
  categoryId: number;
  category: string;
  thumbnail: string;
  hotDealType: string;
  provider: { nameKr: string } | null;
  searchAfter: string[];
  postedAt: string;
}

export interface GetProductsVariables {
  limit?: number;
  searchAfter?: string[];
  startDate?: string;
  orderBy?: string;
  orderOption?: string;
  categoryId?: number;
  keyword?: string;
  thumbnailType?: string;
  isEnd?: boolean;
  isHot?: boolean;
}

export const useGetProducts = (variables?: GetProductsVariables, options?: QueryHookOptions) => {
  return useQuery<{ products: ProductListItem[] }, GetProductsVariables>(QueryProducts, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
      orderBy: variables?.orderBy ?? 'POSTED_AT',
      orderOption: variables?.orderOption ?? 'DESC',
      categoryId: variables?.categoryId,
      keyword: variables?.keyword,
      isEnd: variables?.isEnd,
      isHot: variables?.isHot,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export interface ProductDetailData {
  id: number;
  providerId: number;
  category: string;
  categoryId: number;
  categoryName: string;
  mallId: string;
  title: string;
  url: string;
  detailUrl: string;
  isHot: boolean;
  isEnd: boolean;
  price: number;
  postedAt: string;
  thumbnail: string;
  wishlistCount: number;
  positiveCommunityReactionCount: number;
  negativeCommunityReactionCount: number;
  author: { id: number; nickname: string } | null;
  provider: { id: number; name: string; nameKr: string; host: string } | null;
  viewCount: number;
  mallName: string;
  prices: Array<{ id: number; target: string; type: string; price: number; createdAt: string }>;
  hotDealType: string;
  hotDealIndex: {
    id: number;
    message: string;
    highestPrice: number;
    currentPrice: number;
    lowestPrice: number;
  } | null;
  likeCount: number;
  dislikeCount: number;
}

export const useGetProduct = (
  variables: { id: number },
  options?: Omit<QueryHookOptions<{ product: ProductDetailData }, { id: number }>, 'variables'>,
) => {
  return useQuery<{ product: ProductDetailData }, { id: number }>(QueryProduct, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });
};
