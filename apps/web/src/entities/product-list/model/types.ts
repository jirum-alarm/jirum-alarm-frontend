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
  /** 판매처(쇼핑몰). 전수 기준 ~70%만 채워짐 — 없으면 슬롯 자체를 렌더하지 않는다. */
  mallName?: string | null;
  /** 제보 커뮤니티. 100% 채워지며 판매처와 항상 다른 값(폴백 대상 아님). */
  provider?: { nameKr?: string | null } | null;
}
