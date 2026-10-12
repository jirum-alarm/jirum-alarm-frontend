import { HotDealType } from '@/shared/api/gql/graphql';

export const hotdealTextMap: Record<HotDealType, string> = {
  [HotDealType.HotDeal]: '핫딜',
  [HotDealType.SuperDeal]: '대박딜',
  [HotDealType.UltraDeal]: '초대박딜',
};

/** 낮은 배지부터 — 기준 시트가 이 순서로 보여 준다. */
export const HOTDEAL_TYPES_IN_ORDER = [
  HotDealType.HotDeal,
  HotDealType.SuperDeal,
  HotDealType.UltraDeal,
] as const;

/**
 * 배지 기준 — 서버 crawling-server `src/product-hot-deal-index/hot-deal-criteria.ts`(실제 판정)와
 * 앱 `shared/components/product/HotdealBadge.tsx` 가 같은 문장이다. 기준을 바꾸면 셋을 같이 고친다.
 * 핫딜은 반응(사람이 몰림), 대박·초대박은 가격 근거 — 축이 달라 둘 다면 높은 배지 하나만 보인다.
 * short 는 상세 배지 옆 한 줄(폰 375px 에서 배지·게시 시각과 한 줄에 들어가게 10자 안팎).
 */
export const hotdealCriteria: Record<
  HotDealType,
  { short: string; title: string; detail: string }
> = {
  [HotDealType.HotDeal]: {
    short: '커뮤니티 인기',
    title: '커뮤니티에서 반응이 뜨거운 딜',
    detail: '원 커뮤니티 인기글이거나 추천·댓글이 많이 달린 글이에요. 가격은 보지 않아요.',
  },
  [HotDealType.SuperDeal]: {
    short: '평소보다 15%↑ 쌈',
    title: '평소보다 확실히 싼 딜',
    detail: '같은 상품의 지난 1년 핫딜 보통가나 다나와 최저가(배송비 포함)보다 15% 이상 싸요.',
  },
  [HotDealType.UltraDeal]: {
    short: '1년 최저가',
    title: '1년 중 가장 싼 딜',
    detail: '같은 상품의 지난 1년 핫딜 중 가장 싸고, 보통가보다도 15% 이상 싸요.',
  },
};
