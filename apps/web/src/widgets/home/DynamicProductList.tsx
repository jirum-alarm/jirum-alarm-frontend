'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getPromotionQueryOptions } from '@/entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection } from '@/entities/promotion/model/types';

import { CarouselProductList } from '@features/products/carousel';
import ProductGridList from '@features/products/grid/GridProductList';
import PaginatedProductGridList from '@features/products/grid/PaginatedProductGridList';
import ListProductList from '@features/products/list/ListProductList';

interface DynamicProductListProps {
  section: ContentPromotionSection;
}

const DynamicProductList = ({ section }: DynamicProductListProps) => {
  const queryOptions = getPromotionQueryOptions(section);
  const { data } = useSuspenseQuery(queryOptions as any);

  let products: any[] = [];

  if (data === null) {
    return null;
  }

  if (section.dataSource.type === 'GRAPHQL_QUERY') {
    switch (section.dataSource.queryName) {
      case 'hotDealRankingProducts':
        products = (data as any).hotDealRankingProducts;
        break;
      case 'productsByKeyword':
        products = (data as any).productsByKeyword;
        break;
      case 'products':
        products = (data as any).products;
        break;
      default:
        products = [];
    }
  }

  if (section.type === 'GRID') {
    return (
      <div className="pc:px-0 px-5">
        <ProductGridList products={products} />
      </div>
    );
  }

  if (section.type === 'PAGINATED_GRID') {
    return <PaginatedProductGridList products={products} />;
  }

  if (section.type === 'GRID_TABBED') {
    return (
      <div className="pc:py-4 pc:px-0 px-5">
        <ProductGridList
          products={products}
          className="pc:grid-cols-6 grid-cols-3"
          displayTime={false}
        />
      </div>
    );
  }

  if (section.type === 'HORIZONTAL_SCROLL') {
    return <CarouselProductList products={products} />;
  }

  if (section.type === 'LIST') {
    return (
      <div className="pc:px-0 px-5">
        <ListProductList products={products} />
      </div>
    );
  }

  return null;
};

export default DynamicProductList;
