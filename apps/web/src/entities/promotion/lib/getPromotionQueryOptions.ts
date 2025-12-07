import { ProductQueries } from '@entities/product/product.queries';

import {
  QueryHotDealRankingProductsQueryVariables,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
} from '@/shared/api/gql/graphql';

import { ContentPromotionSection, PromotionQueryName } from '../model/types';

type PromotionQueryVariablesMap = {
  hotDealRankingProducts: QueryHotDealRankingProductsQueryVariables;
  productsByKeyword: QueryProductsByKeywordQueryVariables;
  products: QueryProductsQueryVariables;
};

type PromotionQueryReturnMap = {
  hotDealRankingProducts: ReturnType<typeof ProductQueries.hotDealRankingProducts>;
  productsByKeyword: ReturnType<typeof ProductQueries.productsByKeywords>;
  products: ReturnType<typeof ProductQueries.products>;
};

const promotionQueryFactories: {
  [K in PromotionQueryName]: (
    variables: PromotionQueryVariablesMap[K],
  ) => PromotionQueryReturnMap[K];
} = {
  hotDealRankingProducts: ProductQueries.hotDealRankingProducts,
  productsByKeyword: ProductQueries.productsByKeywords,
  products: ProductQueries.products,
};

export const getPromotionQueryOptions = <K extends PromotionQueryName>(
  section: ContentPromotionSection & { dataSource: { queryName: K } },
) => {
  const { dataSource } = section;
  const { type, queryName, variables } = dataSource;

  if (type === 'GRAPHQL_QUERY') {
    const factory = promotionQueryFactories[queryName];
    if (!factory) {
      throw new Error(`Unknown query name: ${queryName}`);
    }
    return factory(variables as PromotionQueryVariablesMap[K]);
  }
  throw new Error(`Unsupported data source type: ${type}`);
};
