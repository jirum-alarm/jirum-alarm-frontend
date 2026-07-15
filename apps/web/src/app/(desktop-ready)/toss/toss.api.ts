import { QueryTossCategoryLabels, QueryTossProducts } from '@/graphql/toss';

import { execute } from '@/shared/lib/http-client';

import { type TossDeal } from './mock';

// 섹션 id → 서버 keyword 매핑. 서버 ProductKeywordCollection 과 일치해야 함.
export const TOSS_SECTION_KEYWORD: Record<string, string> = {
  all: '토스',
  daily: '토스_하루특가',
  best: '토스_지금인기',
  rising: '토스_급상승',
  category: '토스_카테고리인기',
  creator: '토스_크리에이터',
  lowest: '토스_최저가',
  conversion: '토스_전환율',
};

interface TossExt {
  section?: string;
  sellerName?: string;
  salePrice?: number;
  originalPrice?: number;
  discountRate?: number;
  lowestIn30Days?: boolean;
  delivery?: string;
  rating?: number;
  reviewCount?: number;
  bestSeller?: boolean;
  // 서버가 문자열("100g당 2,092원") 또는 객체({unitName,unitAmount,unitPrice})로 줄 수 있어 둘 다 방어.
  // 객체를 그대로 JSX 에 렌더하면 React #31 로 홈 전체가 크래시하므로 반드시 문자열로 정규화.
  unitPrice?: string | { unitName?: string; unitAmount?: number; unitPrice?: number };
  badge?: string;
}

// unitPrice 를 항상 문자열로. 객체면 "N<unit>당 X원" 조립, 문자열이면 그대로, 그 외 undefined.
function normalizeUnitPrice(u: TossExt['unitPrice']): string | undefined {
  if (typeof u === 'string') return u;
  if (u && typeof u === 'object' && u.unitPrice != null && u.unitName) {
    return `${u.unitAmount ?? 1}${u.unitName}당 ${u.unitPrice.toLocaleString()}원`;
  }
  return undefined;
}

function toDeal(p: {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  data?: unknown;
}): TossDeal {
  const t = ((p.data as { toss?: TossExt } | null)?.toss ?? {}) as TossExt;
  const priceNum = Number((p.price ?? '').replace(/[^0-9]/g, '')) || 0;
  return {
    id: p.id,
    productId: Number(p.id),
    title: p.title,
    price: t.salePrice ?? priceNum,
    image: p.thumbnail ?? undefined,
    discountRate: t.discountRate,
    lowestIn30Days: t.lowestIn30Days,
    delivery: t.delivery,
    rating: t.rating,
    reviewCount: t.reviewCount,
    bestSeller: t.bestSeller,
    badge: t.badge,
    unitPrice: normalizeUnitPrice(t.unitPrice),
  };
}

// 카테고리 인기 하위 탭(실제 존재하는 categoryLabel).
export async function fetchTossCategoryLabels(): Promise<string[]> {
  const res = await execute(QueryTossCategoryLabels, undefined);
  return res.data?.tossCategoryLabels ?? [];
}

export async function fetchTossDeals(opts: {
  section?: string;
  categoryLabel?: string;
  limit?: number;
}): Promise<TossDeal[]> {
  const keyword = TOSS_SECTION_KEYWORD[opts.section ?? 'all'] ?? '토스';
  const res = await execute(QueryTossProducts, {
    keyword,
    limit: opts.limit ?? 20,
    orderBy: 'POSTED_AT' as never,
    orderOption: 'DESC' as never,
    tossCategoryLabel: opts.categoryLabel ?? null,
  });
  return (res.data?.productsByKeyword ?? []).map(toDeal);
}
