'use client';

import { ContentPromotionSection } from '@entities/promotion';

import DynamicProductListView from './DynamicProductListView';
import { usePromotionProducts } from './model/usePromotionProducts';

interface DynamicProductListProps {
  section: ContentPromotionSection;
}

const DynamicProductList = ({ section }: DynamicProductListProps) => {
  const products = usePromotionProducts(section);

  if (products === null) {
    return null;
  }

  return <DynamicProductListView section={section} products={products} />;
};

export default DynamicProductList;
