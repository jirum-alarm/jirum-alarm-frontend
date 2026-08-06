import { ProductQueries } from '@/entities/product';

import { ContentPromotionSection } from '../model/types';

export const getPromotionQueryOptions = (section: ContentPromotionSection) => {
  const { dataSource } = section;
  const { type, queryName, variables } = dataSource;

  if (type === 'GRAPHQL_QUERY') {
    switch (queryName) {
      case 'hotDealRankingProducts':
        return ProductQueries.hotDealRankingProducts(variables as any);
      case 'guestRecommendedHotDeals':
        return ProductQueries.guestRecommendedHotDeals(variables as any);
      case 'productsByKeyword':
        return ProductQueries.productsByKeywords(variables as any);
      case 'products':
        return ProductQueries.products(variables as any);
      case 'expiringSoonHotDealProducts':
        return ProductQueries.expiringSoonHotDealProducts(variables as any);
      default:
        throw new Error(`Unknown query name: ${queryName}`);
    }
  }
  throw new Error(`Unsupported data source type: ${type}`);
};

// GraphQL 응답에서 상품 배열을 꺼낸다. queryName과 응답 필드명이 항상 같지는 않다
// (productsByKeyword → ProductQueries.productsByKeywords, 응답 필드는 productsByKeyword).
export const selectPromotionProducts = (section: ContentPromotionSection, data: unknown): any[] => {
  if (!data) return [];
  return (data as Record<string, any[]>)[section.dataSource.queryName] ?? [];
};

// 섹션 데이터를 서버에서 직접 가져온다. react-query 캐시를 거치지 않으므로
// 하이드레이션 이후 재요청이 발생하지 않는다.
export const fetchPromotionProducts = async (section: ContentPromotionSection) => {
  const { queryFn } = getPromotionQueryOptions(section) as { queryFn: (ctx: any) => Promise<any> };
  const data = await queryFn({});
  return selectPromotionProducts(section, data);
};
