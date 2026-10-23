/**
 * 키워드 허브의 「상품별 최저가 모음」 칩 — 무엇을 앞에 두고 어떻게 부르나.
 *
 * 2026-10-23: 칩 36개가 「오뚜기 진라면 매운맛」「오뚜기 열라면」… 같은 모양으로 깔려 읽을 수가 없었다.
 * ① 허브 이름(또는 모두 같은 브랜드)이 이미 말한 브랜드는 칩에서 뺀다 ② 지금 싼 상품(모델 페이지 판정
 * 기록상 최저·평소보다 쌈, 진행 중 딜 있음)을 앞으로 올리고 판정을 붙인다 ③ 나머지는 딜 많은 순으로 몇 개만 펼친다.
 * 판정은 서버 publishedModelPages 값을 그대로 쓴다 — 여기서 «싸다»를 새로 정하지 않는다.
 * 이 파일은 @/ 경로를 import 하지 않는다(node 테스트가 그대로 읽는다).
 */

export type HubModelPageLink = {
  slug: string;
  brand?: string | null;
  modelName: string;
  dealCount: number;
};

export type HubModelVerdict = {
  slug: string;
  priceTone?: string | null;
  savePct?: number | null;
  activeDealCount: number;
  activePrice?: number | null;
};

export type HubModelChip = {
  slug: string;
  label: string;
  /** 지금 싼 상품이면 판정 한마디(「기록상 최저」·「평소보다 12%↓」), 아니면 null. */
  good: string | null;
};

/** 접지 않고 보여 줄 칩 수 — 지금 싼 상품이 이보다 많으면 그것만은 다 펼친다. */
export const HUB_MODEL_VISIBLE = 12;

const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase();

function goodLabel(v: HubModelVerdict | undefined): string | null {
  if (!v || v.activeDealCount <= 0 || v.activePrice == null) return null;
  if (v.priceTone === 'lowest') return '기록상 최저';
  if (v.priceTone === 'cheap') return v.savePct ? `평소보다 ${v.savePct}%↓` : '평소보다 싸요';
  return null;
}

export function buildHubModelChips(
  hubName: string,
  pages: readonly HubModelPageLink[],
  verdicts: readonly HubModelVerdict[],
): { visible: HubModelChip[]; folded: HubModelChip[]; goodCount: number } {
  const bySlug = new Map(verdicts.map((v) => [v.slug, v]));
  const brands = new Set(pages.map((p) => squash(p.brand ?? '')));
  const oneBrand = brands.size === 1 && !brands.has('');
  const hub = squash(hubName);

  const chips = pages.map((p, index) => {
    const brand = p.brand?.trim() ?? '';
    const said = !brand || oneBrand || hub.includes(squash(brand));
    const startsWithBrand = brand && squash(p.modelName).startsWith(squash(brand));
    const verdict = bySlug.get(p.slug);
    return {
      chip: {
        slug: p.slug,
        label: said || startsWithBrand ? p.modelName : `${brand} ${p.modelName}`,
        good: goodLabel(verdict),
      },
      rank: verdict?.priceTone === 'lowest' ? 0 : 1,
      savePct: verdict?.savePct ?? 0,
      dealCount: p.dealCount,
      index,
    };
  });

  const good = chips
    .filter((c) => c.chip.good)
    .sort((a, b) => a.rank - b.rank || b.savePct - a.savePct || a.index - b.index);
  const rest = chips
    .filter((c) => !c.chip.good)
    .sort((a, b) => b.dealCount - a.dealCount || a.index - b.index);
  const ordered = [...good, ...rest].map((c) => c.chip);
  const cut = Math.max(HUB_MODEL_VISIBLE, good.length);
  return { visible: ordered.slice(0, cut), folded: ordered.slice(cut), goodCount: good.length };
}
