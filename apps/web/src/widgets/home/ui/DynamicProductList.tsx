'use client';

import { ContentPromotionSection } from '@/entities/promotion';

import { usePromotionProducts } from '../model/usePromotionProducts';

import DynamicProductListView from './DynamicProductListView';

interface DynamicProductListProps {
  isMobile: boolean;
  section: ContentPromotionSection;
}

const DynamicProductList = ({ isMobile, section }: DynamicProductListProps) => {
  const products = usePromotionProducts(section);

  if (products === null) {
    return null;
  }

  return <DynamicProductListView isMobile={isMobile} section={section} products={products} />;
};

export default DynamicProductList;
