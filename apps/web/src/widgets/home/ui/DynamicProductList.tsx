'use client';

import { ContentPromotionSection } from '@entities/promotion';

import { usePromotionProducts } from '../model/usePromotionProducts';

import DynamicProductListView from './DynamicProductListView';

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
