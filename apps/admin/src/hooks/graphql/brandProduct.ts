import { QueryHookOptions, useLazyQuery, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  QueryBrandProductMatchCount,
  QueryBrandProductsByMatchCountTotalCount,
  QueryBrandProductsOrderByMatchCount,
  QuerySimilarProducts,
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

export interface SimilarProduct {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  price: number | null;
  categoryId: number | null;
  providerId: number;
  provider: {
    name: string;
  } | null;
  postedAt: string;
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

export interface QuerySimilarProductsQuery {
  similarProducts: SimilarProduct[];
}

export interface QuerySimilarProductsQueryVariables {
  id: number;
}

export const useGetBrandProductsOrderByMatchCount = (
  variables?: Partial<QueryBrandProductsOrderByMatchCountQueryVariables>,
  options?: QueryHookOptions<
    QueryBrandProductsOrderByMatchCountQuery,
    QueryBrandProductsOrderByMatchCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandProductsOrderByMatchCountQuery,
    QueryBrandProductsOrderByMatchCountQueryVariables
  >(QueryBrandProductsOrderByMatchCount, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetSimilarProducts = (
  variables: QuerySimilarProductsQueryVariables,
  options?: QueryHookOptions<QuerySimilarProductsQuery, QuerySimilarProductsQueryVariables>,
) => {
  return useQuery<QuerySimilarProductsQuery, QuerySimilarProductsQueryVariables>(
    QuerySimilarProducts,
    {
      variables,
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useGetSimilarProductsLazy = () => {
  return useLazyQuery<QuerySimilarProductsQuery, QuerySimilarProductsQueryVariables>(
    QuerySimilarProducts,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useGetBrandProductsOrderByMatchCountLazy = () => {
  return useLazyQuery<
    QueryBrandProductsOrderByMatchCountQuery,
    QueryBrandProductsOrderByMatchCountQueryVariables
  >(QueryBrandProductsOrderByMatchCount, {
    fetchPolicy: 'network-only',
  });
};

// TotalCount 쿼리 타입 정의
export interface QueryBrandProductsByMatchCountTotalCountQuery {
  brandProductsByMatchCountTotalCount: number;
}

export interface QueryBrandProductsByMatchCountTotalCountQueryVariables {
  brandItemId?: number;
  title?: string;
}

export const useGetBrandProductsByMatchCountTotalCount = (
  variables?: QueryBrandProductsByMatchCountTotalCountQueryVariables,
  options?: QueryHookOptions<
    QueryBrandProductsByMatchCountTotalCountQuery,
    QueryBrandProductsByMatchCountTotalCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandProductsByMatchCountTotalCountQuery,
    QueryBrandProductsByMatchCountTotalCountQueryVariables
  >(QueryBrandProductsByMatchCountTotalCount, {
    variables: {
      brandItemId: variables?.brandItemId ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetBrandProductsByMatchCountTotalCountLazy = () => {
  return useLazyQuery<
    QueryBrandProductsByMatchCountTotalCountQuery,
    QueryBrandProductsByMatchCountTotalCountQueryVariables
  >(QueryBrandProductsByMatchCountTotalCount, {
    fetchPolicy: 'network-only',
  });
};

// BrandProductMatchCount 쿼리 타입 정의
export interface QueryBrandProductMatchCountQuery {
  brandProductMatchCount: number;
}

export interface QueryBrandProductMatchCountQueryVariables {
  brandProductId: number;
}

export const useGetBrandProductMatchCount = (
  variables: QueryBrandProductMatchCountQueryVariables,
  options?: QueryHookOptions<
    QueryBrandProductMatchCountQuery,
    QueryBrandProductMatchCountQueryVariables
  >,
) => {
  return useQuery<QueryBrandProductMatchCountQuery, QueryBrandProductMatchCountQueryVariables>(
    QueryBrandProductMatchCount,
    {
      variables,
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useGetBrandProductMatchCountLazy = () => {
  return useLazyQuery<QueryBrandProductMatchCountQuery, QueryBrandProductMatchCountQueryVariables>(
    QueryBrandProductMatchCount,
    {
      fetchPolicy: 'network-only',
    },
  );
};
