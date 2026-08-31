/**
 * 홈 SDUI 섹션 모델.
 * web 정본: apps/web/src/entities/promotion/model/types.ts
 *
 * 섹션 구성은 서버가 주는 데이터다. 레이아웃을 하드코딩하지 않는다 —
 * OTA 가 없는 앱(mobile-no-ota-store-review-required)에서 섹션 순서·추가를
 * 배포 없이 바꿀 수 있는 유일한 통로다.
 *
 * ★ web 의 'BANNER' 타입은 타입 선언에만 있고 렌더러가 null 을 반환한다.
 *   실제로 안 쓰이므로 여기선 뺐다(쓰게 되면 그때 추가).
 */

export type ContentPromotionSectionType =
  | 'GRID'
  | 'HORIZONTAL_SCROLL'
  | 'LIST'
  | 'DOUBLE_ROW'
  | 'GRID_TABBED'
  | 'PAGINATED_GRID';

export type PromotionSectionType =
  | ContentPromotionSectionType
  | 'GROUP'
  | 'TOSS';

export type PromotionQueryName =
  | 'hotDealRankingProducts'
  | 'guestRecommendedHotDeals'
  | 'productsByKeyword'
  | 'products'
  | 'expiringSoonHotDealProducts';

export type PromotionDataSource = {
  type: 'GRAPHQL_QUERY';
  queryName: PromotionQueryName;
  variables: Record<string, unknown>;
};

export interface PromotionTab {
  id: string;
  label: string;
  variables: Record<string, unknown>;
  viewMoreLink?: string;
}

interface BasePromotionSection {
  id: string;
  title: string;
  subTitle?: string;
  displayOrder: number;
}

export interface ContentPromotionSection extends BasePromotionSection {
  type: ContentPromotionSectionType;
  dataSource: PromotionDataSource;
  tabs?: PromotionTab[];
  viewMoreLink?: string;
}

export interface GroupPromotionSection extends BasePromotionSection {
  type: 'GROUP';
  sections: ContentPromotionSection[];
}

export interface TossPromotionSection extends BasePromotionSection {
  type: 'TOSS';
  viewMoreLink?: string;
}

export type PromotionSection =
  | ContentPromotionSection
  | GroupPromotionSection
  | TossPromotionSection;

/**
 * 카드가 그리는 상품 형태.
 * web: apps/web/src/entities/product-list/model/types.ts
 */
export interface ProductCardType {
  id: string;
  isEnd?: boolean | null;
  isHot?: boolean | null;
  thumbnail?: string | null;
  title: string;
  price?: string | null;
  hotDealType?: string | null;
  postedAt: string;
  categoryId?: number | null;
  earliestExpiryDate?: string | null;
  /** 판매처(쇼핑몰). 전수 기준 ~70%만 채워짐 — 없으면 슬롯 자체를 렌더하지 않는다. */
  mallName?: string | null;
  /** 제보 커뮤니티. 100% 채워지며 판매처와 항상 다른 값(폴백 대상 아님). */
  provider?: {nameKr?: string | null} | null;
}
