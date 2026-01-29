import { checkDevice } from '@/app/actions/agent';

import {
  CarouselProductList,
  DoubleRowCarouselProductList,
  ListProductList,
  PaginatedProductGridList,
  ProductCardType,
  ProductGridList,
} from '@/entities/product-list';
import { ContentPromotionSection } from '@/entities/promotion';

type DynamicProductListViewProps = {
  isMobile: boolean;
  section: ContentPromotionSection;
  products: ProductCardType[];
};

const DynamicProductListView = ({ isMobile, section, products }: DynamicProductListViewProps) => {
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

  if (section.type === 'DOUBLE_ROW') {
    return isMobile ? (
      <DoubleRowCarouselProductList products={products} />
    ) : (
      <ListProductList products={products} />
    );
  }

  return null;
};

export default DynamicProductListView;
