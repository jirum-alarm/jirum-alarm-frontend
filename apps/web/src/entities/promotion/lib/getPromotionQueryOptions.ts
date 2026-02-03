import { ProductQueries } from '@/entities/product';

import { ContentPromotionSection } from '../model/types';

export const getPromotionQueryOptions = (section: ContentPromotionSection) => {
  const { dataSource } = section;
  const { type, queryName, variables } = dataSource;

  if (type === 'GRAPHQL_QUERY') {
    switch (queryName) {
      case 'hotDealRankingProducts':
        return ProductQueries.hotDealRankingProducts(variables as any);
      case 'productsByKeyword':
        return ProductQueries.productsByKeywords(variables as any);
      case 'products':
        return ProductQueries.products(variables as any);
      default:
        throw new Error(`Unknown query name: ${queryName}`);
    }
  }
  throw new Error(`Unsupported data source type: ${type}`);
};
