import { UseSuspenseQueryOptions } from '@tanstack/react-query';

import {
  QueryHotDealRankingProductsQuery,
  QueryProductsByKeywordQuery,
  QueryProductsQuery,
} from '@/shared/api/gql/graphql';

import { ProductCardType } from '@/entities/product';

import { ContentPromotionSection, PromotionQueryName } from '../model/types';

import { getPromotionQueryOptions } from './getPromotionQueryOptions';

type PromotionRawResponse =
  | QueryHotDealRankingProductsQuery
  | QueryProductsByKeywordQuery
  | QueryProductsQuery;

type PromotionQueryResponse = PromotionRawResponse | null | undefined;

const promotionProductSelector: Record<
  PromotionQueryName,
  (data: PromotionQueryResponse) => ProductCardType[] | null
> = {
  hotDealRankingProducts: (data) =>
    (data as QueryHotDealRankingProductsQuery)?.hotDealRankingProducts ?? null,
  productsByKeyword: (data) => (data as QueryProductsByKeywordQuery)?.productsByKeyword ?? null,
  products: (data) => (data as QueryProductsQuery)?.products ?? null,
};

export const createPromotionSectionQuery = (
  section: ContentPromotionSection,
): UseSuspenseQueryOptions<PromotionRawResponse, Error, ProductCardType[] | null> => {
  const { queryName } = section.dataSource;
  const selectProducts = promotionProductSelector[queryName];

  if (!selectProducts) {
    throw new Error(`Unsupported promotion query name: ${queryName}`);
  }

  const baseQueryOptions = getPromotionQueryOptions(section);

  return {
    ...baseQueryOptions,
    select: (data) => selectProducts(data),
  } as UseSuspenseQueryOptions<PromotionRawResponse, Error, ProductCardType[] | null>;
};
