'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getPromotionQueryOptions } from '@entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection } from '@entities/promotion/model/types';

import { GridProductList } from '@features/product-list';

interface CurationProductListProps {
  section: ContentPromotionSection;
}

const CurationProductList = ({ section }: CurationProductListProps) => {
  const sectionWithLimit = {
    ...section,
    dataSource: {
      ...section.dataSource,
      variables: {
        ...section.dataSource.variables,
        limit: 20,
      },
    },
  };

  const queryOptions = getPromotionQueryOptions(sectionWithLimit);

  const { data } = useSuspenseQuery(queryOptions as any);

  let products: any[] = [];

  if (section.dataSource.type === 'GRAPHQL_QUERY') {
    switch (section.dataSource.queryName) {
      case 'hotDealRankingProducts':
        products = (data as any).hotDealRankingProducts;
        break;
      case 'productsByKeyword':
        products = (data as any).productsByKeyword;
        break;
      default:
        products = [];
    }
  }

  if (!products || products.length === 0) {
    return <div className="py-10 text-center text-gray-500">상품이 없습니다.</div>;
  }

  return <GridProductList products={products} />;
};

export default CurationProductList;
