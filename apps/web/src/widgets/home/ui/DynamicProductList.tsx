import { CarouselProductList } from '@/entities/product-list/ui/carousel';
import DoubleRowCarouselProductList from '@/entities/product-list/ui/carousel/DoubleRowCarouselProductList';
import PaginatedProductGridList from '@/entities/product-list/ui/grid/PaginatedProductGridList';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';
import ListProductList from '@/entities/product-list/ui/list/ListProductList';
import { ContentPromotionSectionType } from '@/entities/promotion/model/types';

interface DynamicProductListProps {
  type: ContentPromotionSectionType;
  products: any[];
  isMobile: boolean;
  priorityCount?: number;
}

// 데이터를 스스로 가져오지 않는다. 탭 없는 섹션은 서버(DynamicProductSection)가,
// 탭 섹션은 클라이언트(TabbedDynamicProductSection)가 각각 products를 내려준다.
const DynamicProductList = ({
  type,
  products,
  isMobile,
  priorityCount = 0,
}: DynamicProductListProps) => {
  if (type === 'GRID') {
    return (
      <div className="pc:px-0 px-5">
        <ProductGridList
          products={products}
          priorityCount={priorityCount}
          source="home_promotion"
        />
      </div>
    );
  }

  if (type === 'PAGINATED_GRID') {
    return (
      <PaginatedProductGridList products={products} isMobile={isMobile} source="home_promotion" />
    );
  }

  if (type === 'GRID_TABBED') {
    return (
      <div className="pc:py-4 pc:px-0 px-5">
        <ProductGridList
          products={products}
          className="pc:grid-cols-6 grid-cols-3"
          displayTime={false}
          source="home_promotion"
        />
      </div>
    );
  }

  if (type === 'HORIZONTAL_SCROLL') {
    return <CarouselProductList products={products} source="home_promotion" />;
  }

  if (type === 'DOUBLE_ROW') {
    if (isMobile) {
      return <DoubleRowCarouselProductList products={products} source="home_promotion" />;
    }

    return (
      <div className="pc:px-0 px-5">
        <ListProductList products={products} source="home_promotion" />
      </div>
    );
  }

  if (type === 'LIST') {
    return (
      <div className="pc:px-0 px-5">
        <ListProductList products={products} source="home_promotion" />
      </div>
    );
  }

  return null;
};

export default DynamicProductList;
