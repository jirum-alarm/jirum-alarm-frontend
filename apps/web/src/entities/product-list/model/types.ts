'use client';
import { HotDealType } from '@/shared/api/gql/graphql';

export interface ProductCardType {
  id: string;
  isEnd?: boolean | null;
  isHot?: boolean | null;
  thumbnail?: string | null;
  title: string;
  price?: string | null;
  hotDealType?: HotDealType | null;
  postedAt: Date;
  categoryId?: number | null;
  earliestExpiryDate?: Date | null;
}
