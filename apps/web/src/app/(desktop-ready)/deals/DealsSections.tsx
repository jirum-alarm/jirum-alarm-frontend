import { buildModelDisplayName } from '@/features/deals/lib/model-page-insights';

import DealsFoldedMore, { type FoldedLink } from './DealsFoldedMore';
import { DealGrid, type DealItem } from './DealsListParts';

import type { ReactNode } from 'react';

// /deals 목록과 /keywords 목록이 같이 쓰는 판정 섹션 조각(서버 컴포넌트). 키워드가 위층·상품이 아래층으로 바뀌면서
// 「지금 사기 좋아요」가 /keywords 첫 화면으로도 올라갔다(2026-10-17).

/**
 * ①② 에서 접지 않고 보여줄 개수 — PC 5열 × 2줄, 모바일 2열 × 5줄. 발행 페이지가 1,136개로 늘자(2026-10-13)
 * ① 25개가 다 펼쳐져 모바일에선 ② 가 화면 6장 아래에서야 시작했다. 12개면 PC 마지막 줄에 2개만 남는다.
 */
export const BUY_NOW_VISIBLE = 10;
export const RECENT_VISIBLE = 10;
const GOOD_TONES = new Set(['lowest', 'cheap']);

/**
 * 판정으로 세 덩어리. ①② 는 최근 올라온 딜 순(새 딜이 위), ③ 은 카테고리 섹션이 정렬한다.
 * ①② 를 할인율 순으로 두지 않는 이유: 추이 점이 5~9개인 상품이 대부분이라 % 의 정밀도가 낮다.
 */
export function splitByVerdict(pages: DealItem[]) {
  const byRecent = (a: DealItem, b: DealItem) =>
    Date.parse(b.activePostedAt ?? '') - Date.parse(a.activePostedAt ?? '');
  const active = pages.filter((p) => p.activeDealCount > 0 && p.activePrice != null);
  const activeSlugs = new Set(active.map((p) => p.slug));
  return {
    buyNow: active.filter((p) => GOOD_TONES.has(p.priceTone ?? '')).sort(byRecent),
    recent: active.filter((p) => !GOOD_TONES.has(p.priceTone ?? '')).sort(byRecent),
    waiting: pages.filter((p) => !activeSlugs.has(p.slug)),
  };
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** 앞 `visible` 개만 서버에서 그리고, 나머지는 DealsFoldedMore 가 접어 둔다(닫힌 동안엔 이름 링크만 — HTML 을 가볍게). */
export function FoldedGrid({ items, visible }: { items: DealItem[]; visible: number }) {
  return (
    <>
      <DealGrid items={items.slice(0, visible)} />
      {items.length > visible && (
        <DealsFoldedMore variant="grid" links={items.slice(visible).map(toFoldedLink)} />
      )}
    </>
  );
}

export const toFoldedLink = (p: DealItem): FoldedLink => ({
  slug: p.slug,
  name: buildModelDisplayName(p.brand, p.modelName),
});
