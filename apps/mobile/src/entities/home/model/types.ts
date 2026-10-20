/**
 * 홈 SDUI 섹션 모델 — 정본은 @jirum/domain/home-sections(web 과 같은 타입).
 *
 * 섹션 구성은 서버가 주는 데이터다. 레이아웃을 하드코딩하지 않는다 —
 * 섹션 순서·추가를 앱 배포 없이 바꿀 수 있는 통로다.
 */
export type {
  ContentPromotionSection,
  ContentPromotionSectionType,
  GroupPromotionSection,
  PromotionDataSource,
  PromotionQueryName,
  PromotionSection,
  PromotionSectionType,
  PromotionTab,
  TossPromotionSection,
} from '@jirum/domain/home-sections';

export type {ProductCardType} from '@/shared/types/product-card';
