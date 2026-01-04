import {
  CarouselProductList,
  ListProductList,
  PaginatedProductGridList,
  ProductCardType,
  ProductGridList,
} from '@/entities/product-list';
import { ContentPromotionSection } from '@/entities/promotion';

type DynamicProductListViewProps = {
  section: ContentPromotionSection;
  products: ProductCardType[];
};

const DynamicProductListView = ({ section, products }: DynamicProductListViewProps) => {
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

export default DynamicProductListView;
