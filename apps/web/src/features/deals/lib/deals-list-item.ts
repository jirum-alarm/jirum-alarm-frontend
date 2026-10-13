import type { PublishedModelPagesQuery } from '@/shared/api/gql/graphql';

/** /deals 목록 항목 — page.tsx(서버)·접힌 목록 API·클라이언트가 같이 쓴다. React 를 가져오지 않는다. */
export type DealItem = PublishedModelPagesQuery['publishedModelPages'][number];

/** 카드·줄이 실제로 읽는 필드만 — 접힌 목록을 클라이언트로 넘길 때 이것만 싣는다. */
export type ListItem = Pick<
  DealItem,
  | 'slug'
  | 'brand'
  | 'modelName'
  | 'heroImage'
  | 'activeDealCount'
  | 'activePrice'
  | 'activePostedAt'
  | 'priceTone'
  | 'savePct'
  | 'buyLine'
  | 'buyLineUnitLabel'
  | 'heroMinPrice'
  | 'lastDealAt'
  | 'trendPrices'
>;

export function toListItem(p: DealItem): ListItem {
  return {
    slug: p.slug,
    brand: p.brand,
    modelName: p.modelName,
    heroImage: p.heroImage,
    activeDealCount: p.activeDealCount,
    activePrice: p.activePrice,
    activePostedAt: p.activePostedAt,
    priceTone: p.priceTone,
    savePct: p.savePct,
    buyLine: p.buyLine,
    buyLineUnitLabel: p.buyLineUnitLabel,
    heroMinPrice: p.heroMinPrice,
    lastDealAt: p.lastDealAt,
    trendPrices: p.trendPrices,
  };
}
