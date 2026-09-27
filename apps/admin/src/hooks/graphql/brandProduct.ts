import { QueryHookOptions, useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationAddProductMapping,
  QueryBrandItemsByMatchCountTotalCount,
  QueryBrandItemsOrderByTotalMatchCount,
  QueryBrandProductsOrderByMatchCount,
  QuerySimilarProductsByTitle,
} from '@/graphql/brandProduct';

// 타입 정의 (codegen 전까지 임시 사용)
export interface BrandProduct {
  id: string;
  danawaProductId: string;
  brandItemId: number;
  brandName: string;
  productName: string;
  volume: string | null;
  amount: string | null;
  matchCount: number;
  pendingVerificationCount: number;
  createdAt: string;
  searchAfter: string[];
}

export interface QueryBrandProductsOrderByMatchCountQuery {
  brandProductsOrderByMatchCount: BrandProduct[];
}

export interface QueryBrandProductsOrderByMatchCountQueryVariables {
  limit: number;
  searchAfter?: string[];
  brandItemId?: number;
  title?: string;
}

export const useGetBrandProductsOrderByMatchCountLazy = () => {
  return useLazyQuery<
    QueryBrandProductsOrderByMatchCountQuery,
    QueryBrandProductsOrderByMatchCountQueryVariables
  >(QueryBrandProductsOrderByMatchCount, {
    fetchPolicy: 'network-only',
  });
};

// BrandItem 타입 정의
export interface BrandItem {
  id: string;
  brandName: string;
  productName: string;
  totalMatchCount: number;
  pendingVerificationCount: number;
  searchAfter: string[];
}

export interface QueryBrandItemsOrderByTotalMatchCountQuery {
  brandItemsOrderByTotalMatchCount: BrandItem[];
}

export interface QueryBrandItemsOrderByTotalMatchCountQueryVariables {
  limit: number;
  searchAfter?: string[];
  title?: string;
}

export const useGetBrandItemsOrderByTotalMatchCount = (
  variables?: Partial<QueryBrandItemsOrderByTotalMatchCountQueryVariables>,
  options?: QueryHookOptions<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >(QueryBrandItemsOrderByTotalMatchCount, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetBrandItemsOrderByTotalMatchCountLazy = () => {
  return useLazyQuery<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >(QueryBrandItemsOrderByTotalMatchCount, {
    fetchPolicy: 'network-only',
  });
};

// BrandItem TotalCount
export interface QueryBrandItemsByMatchCountTotalCountQuery {
  brandItemsByMatchCountTotalCount: number;
}

export interface QueryBrandItemsByMatchCountTotalCountQueryVariables {
  title?: string;
}

export const useGetBrandItemsByMatchCountTotalCount = (
  variables?: QueryBrandItemsByMatchCountTotalCountQueryVariables,
  options?: QueryHookOptions<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >(QueryBrandItemsByMatchCountTotalCount, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetBrandItemsByMatchCountTotalCountLazy = () => {
  return useLazyQuery<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >(QueryBrandItemsByMatchCountTotalCount, {
    fetchPolicy: 'network-only',
  });
};

export interface SimilarProductByTitle {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  price: string | null;
  similarity: number | null;
  provider: { name: string } | null;
  /** 서빙되는(verified) 매핑만 온다 — null 이면 미매핑이거나 pending 뿐인 딜 */
  productMapping: {
    target: string | null;
    targetId: number | null;
    verificationStatus: string | null;
  } | null;
}

export interface QuerySimilarProductsByTitleQuery {
  similarProductsByTitle: SimilarProductByTitle[];
}

export interface QuerySimilarProductsByTitleQueryVariables {
  title: string;
  limit: number;
}

export const useGetSimilarProductsByTitleLazy = () => {
  return useLazyQuery<QuerySimilarProductsByTitleQuery, QuerySimilarProductsByTitleQueryVariables>(
    QuerySimilarProductsByTitle,
    { fetchPolicy: 'network-only' },
  );
};

export interface MutationAddProductMappingMutation {
  addProductMapping: boolean;
}

export interface MutationAddProductMappingMutationVariables {
  productId: number;
  brandProductId: number;
}

/** 어드민 수동 매핑 — 서버가 matched+verified 로 넣는다 (matching-api adminAddMapping) */
export const useAddProductMapping = () => {
  return useMutation<MutationAddProductMappingMutation, MutationAddProductMappingMutationVariables>(
    MutationAddProductMapping,
  );
};
