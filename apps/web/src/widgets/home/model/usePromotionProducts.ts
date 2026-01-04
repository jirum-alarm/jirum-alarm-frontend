'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductCardType } from '@/entities/product-list';
import { ContentPromotionSection, createPromotionSectionQuery } from '@/entities/promotion';

export const usePromotionProducts = (
  section: ContentPromotionSection,
): ProductCardType[] | null => {
  const queryOptions = createPromotionSectionQuery(section);
  const { data } = useSuspenseQuery(queryOptions);

  return data;
};
