/**
 * 키워드 허브의 「상품별 최저가 모음」 — 무엇을 앞에 두고, 무엇끼리 묶고, 어떻게 부르나.
 *
 * 2026-10-23: 칩 35개가 「오뚜기 진라면 매운맛」「오뚜기 진라면 순한맛」… 같은 모양으로 깔려 읽을 수가 없었다.
 * ① 허브 이름(또는 모두 같은 브랜드)이 이미 말한 브랜드는 뺀다
 * ② 같은 상품 줄(진라면 매운맛·순한맛·컵, 버즈3·버즈4)은 한 줄로 묶고 다른 부분만 칩으로 — 줄 이름은 상품 이름에
 *    두 번 이상 나오는 낱말(숫자 꼬리는 떼고). 꾸밈말(고소한·옛날·프로)·거의 모든 상품에 붙는 말(캡형)은 줄 이름이 못 된다
 * ③ 「신라면5개 + 짜파게티5개」 같은 묶음 구성은 한 줄로 ④ 브랜드가 섞인 허브는 남은 것을 브랜드로 묶는다
 * ⑤ 지금 싼 상품(모델 페이지 판정 기록상 최저·평소보다 쌈, 진행 중 딜)을 앞에 판정과 함께 ⑥ 묶이지 않은 것은 몇 개만 펼친다.
 * 판정은 서버 publishedModelPages 값을 그대로 쓴다 — 여기서 «싸다»를 새로 정하지 않는다.
 * web 허브·모델 페이지(같은 줄 칩)와 앱 허브가 같은 묶음을 그리도록 여기 둔다(2026-10-24 web 에서 옮김).
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
  /** 칩에 보이는 말 — 묶음 안에선 줄 이름을 뺀 나머지(「매운맛」). */
  label: string;
  /** 링크 글에 앞붙일 줄 이름(화면엔 숨김) — 링크 글이 「진라면 매운맛」으로 읽히게. 없으면 null. */
  prefix: string | null;
  /** 지금 싼 상품이면 판정 한마디(「기록상 최저」·「평소보다 12%↓」), 아니면 null. */
  good: string | null;
};

export type HubModelGroup = { name: string; chips: HubModelChip[] };

/** 묶이지 않은 칩 중 접지 않고 보여 줄 수 — 지금 싼 상품이 이보다 많으면 그것만은 다 펼친다. */
export const HUB_MODEL_SINGLES_VISIBLE = 10;
export const BUNDLE_GROUP = '여러 개 묶음';

/** 줄 이름이 못 되는 말 — 크기·포장·꾸밈. */
const NOT_A_LINE = new Set([
  '맛',
  '컵',
  '세트',
  '대용량',
  '미니',
  '큰컵',
  '작은컵',
  '용기',
  '봉지',
  '멀티팩',
  '번들',
  '옛날',
  '프로',
  '플러스',
  '울트라',
  '자급제',
  '블루투스',
  'FE',
  'Wi-Fi',
  '오리지널',
  '오리지날',
  '무라벨',
  '제로',
  '라이트',
  '박스',
  '기획',
  '정품',
  '국내',
  '해외',
  '직구',
  '업소용',
  'NEW',
  '신제품',
  '해외구매',
  // 맛·향의 정도 — 「마일드」로 맥심 모카골드와 카누를 한 상품으로 묶었다(2026-10-24).
  '마일드',
  // 맛·색 — 「초코」로 다이제와 통크를 한 상품으로 묶었다.
  '초코',
  '치즈',
  '딸기',
  '바닐라',
  '레몬',
  '블루',
  '레드',
  '골드',
  '블랙',
  '화이트',
  '라임',
]);
/** 「고소한」「맛있는」「매운」 — 꾸밈말 꼴. */
const MODIFIER = /(한|는|운|은|인)$/;
/** 「버즈3」→「버즈」, 「갤럭시탭S10」→「갤럭시탭」 — 세대·모델 번호 꼬리. */
const NUMBER_TAIL = /[A-Za-z]?\d+[A-Za-z]*$/;

const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase();
const words = (s: string) => s.split(/\s+/).filter(Boolean);

function goodLabel(v: HubModelVerdict | undefined): string | null {
  if (!v || v.activeDealCount <= 0 || v.activePrice == null) return null;
  if (v.priceTone === 'lowest') return '기록상 최저';
  if (v.priceTone === 'cheap') return v.savePct ? `평소보다 ${v.savePct}%↓` : '평소보다 싸요';
  return null;
}

/** 낱말 하나가 줄 이름으로 낼 수 있는 후보(그대로·숫자 꼬리 뗀 것). */
const lineCandidates = (word: string) => [...new Set([word, word.replace(NUMBER_TAIL, '')])];

/**
 * 줄 이름을 뺀 나머지 — 낱말째면 지우고, 낱말의 앞부분이면 남은 꼬리만(「갤럭시탭S10」→「S10」).
 * 꼬리가 숫자뿐이면 낱말을 그대로 둔다(「버즈4」를 「4」로 줄이면 못 읽는다).
 */
function withoutLine(ws: string[], line: string): string[] {
  const at = ws.findIndex((w) => w === line || w.startsWith(line));
  if (at < 0) return ws;
  const rest = ws[at].slice(line.length);
  const keep = rest && /^\d+$/.test(rest) ? [ws[at]] : rest ? [rest] : [];
  return [...ws.slice(0, at), ...keep, ...ws.slice(at + 1)];
}

type Item = {
  page: HubModelPageLink;
  /** 묶이지 않을 때 칩 이름(브랜드 규칙 ①을 거친 것). */
  display: string;
  good: string | null;
  rank: number;
  savePct: number;
  index: number;
};

/**
 * 이름까지 같은 칩은 한 상품의 페이지가 둘인 것(카탈로그 중복 — 「코카콜라 제로」가 두 페이지)이라 앞(지금 싼·딜 많은) 것만 남긴다.
 * 공백·대소문자만 다른 것(「제로제로」·「제로 제로」)도 같다.
 */
function uniqueChips(chips: HubModelChip[]): HubModelChip[] {
  const seen = new Set<string>();
  return chips.filter((c) => {
    const key = squash(`${c.prefix ?? ''} ${c.label}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const byGoodThenDeals = (a: Item, b: Item) =>
  Number(!a.good) - Number(!b.good) ||
  a.rank - b.rank ||
  b.savePct - a.savePct ||
  b.page.dealCount - a.page.dealCount ||
  a.index - b.index;

export function buildHubModelGroups(
  hubName: string,
  pages: readonly HubModelPageLink[],
  verdicts: readonly HubModelVerdict[],
): {
  groups: HubModelGroup[];
  visible: HubModelChip[];
  folded: HubModelChip[];
  goodCount: number;
  /** 보이는 칩 수(같은 상품 중복 페이지를 하나로 센 것) — 제목 옆 「N개」. */
  total: number;
} {
  const bySlug = new Map(verdicts.map((v) => [v.slug, v]));
  const brandSet = new Set(pages.map((p) => squash(p.brand ?? '')));
  const oneBrand = brandSet.size === 1 && !brandSet.has('');
  const hub = squash(hubName);
  const saidBrand = (brand: string) => !brand || oneBrand || hub.includes(squash(brand));

  const items: Item[] = pages.map((page, index) => {
    const brand = page.brand?.trim() ?? '';
    const startsWithBrand = brand && squash(page.modelName).startsWith(squash(brand));
    const verdict = bySlug.get(page.slug);
    return {
      page,
      display: saidBrand(brand) || startsWithBrand ? page.modelName : `${brand} ${page.modelName}`,
      good: goodLabel(verdict),
      rank: verdict?.priceTone === 'lowest' ? 0 : 1,
      savePct: verdict?.savePct ?? 0,
      index,
    };
  });

  // ② 줄 이름 후보의 빈도 — 상품마다 한 번씩. 거의 모든 상품에 붙는 말은 줄 이름이 아니다.
  // 괄호로 시작하는 낱말(「(업소용)」「(파우치)」)은 구성·판매 조건이라 줄 이름이 아니다(「피지(FiJi)」는 이름).
  const usable = (line: string) =>
    line.length >= 2 &&
    !/\d/.test(line) &&
    !/^[([]/.test(line) &&
    !NOT_A_LINE.has(line) &&
    !MODIFIER.test(line) &&
    !hub.includes(squash(line));
  const candidatesOf = (item: Item) =>
    [...new Set(words(item.page.modelName).flatMap(lineCandidates))].filter(usable);
  const brandOf = (item: Item) => squash(item.page.brand ?? '');
  const freq = new Map<string, number>();
  // 같은 브랜드 안 빈도 — 줄은 같은 브랜드 안에서만 묶이니 거기서 두 번 이상 나와야 줄이 된다.
  const brandFreq = new Map<string, number>();
  const brandsWith = new Map<string, Set<string>>();
  for (const item of items)
    for (const c of candidatesOf(item)) {
      freq.set(c, (freq.get(c) ?? 0) + 1);
      const k = `${brandOf(item)}|${c}`;
      brandFreq.set(k, (brandFreq.get(k) ?? 0) + 1);
      brandsWith.set(c, (brandsWith.get(c) ?? new Set()).add(brandOf(item)));
    }
  const tooCommon = Math.max(2, Math.floor(items.length * 0.6));
  // 칩 이름에서 빼는 말 — 허브 이름이 이미 말한 것(「물티슈」)·거의 모든 상품에 붙는 것(「캡형」).
  const wordFreq = new Map<string, number>();
  for (const item of items)
    for (const w of new Set(words(item.page.modelName)))
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  const noise = (w: string) =>
    hub.includes(squash(w)) || (items.length >= 4 && (wordFreq.get(w) ?? 0) > tooCommon);

  // 줄은 같은 브랜드 안에서만 — 「시그니처」가 두 브랜드에 있으면 다른 상품이다.
  const lines = new Map<string, { line: string; brand: string; items: Item[] }>();
  const loose: Item[] = [];
  for (const item of items) {
    const brand = item.page.brand?.trim() ?? '';
    // 같은 브랜드 안에서 많이 나오는 말 → 다른 브랜드 여럿에 붙는 말은 뒤로(맛·성분 — 「베지밀」이 네 브랜드에 붙는
    // 「검은콩」에 밀려 두유 허브 줄 이름이 「검은콩」이 됐다, 2026-10-24) → 허브 전체에서 많이 나오는 말 순.
    const local = (c: string) => brandFreq.get(`${brandOf(item)}|${c}`) ?? 0;
    const shared = (c: string) => Number((brandsWith.get(c)?.size ?? 0) > 2);
    const best = item.page.modelName.includes('+')
      ? BUNDLE_GROUP
      : candidatesOf(item)
          .filter((c) => local(c) >= 2 && (freq.get(c) ?? 0) <= tooCommon)
          .sort(
            (a, b) =>
              local(b) - local(a) || shared(a) - shared(b) || freq.get(b)! - freq.get(a)!,
          )[0];
    if (!best) {
      loose.push(item);
      continue;
    }
    const key = best === BUNDLE_GROUP ? best : `${squash(brand)}|${best}`;
    const entry = lines.get(key) ?? { line: best, brand, items: [] };
    entry.items.push(item);
    lines.set(key, entry);
  }

  // 줄 이름엔 브랜드를 안 붙인다(「LG생활건강 홈스타」「LG생활건강 피지」가 줄마다 반복됐다) — 다른 브랜드에
  // 같은 줄 이름이 있을 때만 구분하려고 붙인다.
  const kept = [...lines.values()].filter((l) => l.items.length >= 2);
  const lineCount = new Map<string, number>();
  for (const l of kept) lineCount.set(l.line, (lineCount.get(l.line) ?? 0) + 1);

  const groups: (HubModelGroup & { items: Item[] })[] = [];
  for (const { line, brand, items: members } of lines.values()) {
    if (members.length < 2) {
      loose.push(...members);
      continue;
    }
    const name = (lineCount.get(line) ?? 0) > 1 && brand ? `${brand} ${line}` : line;
    const chipOf = (item: Item, dropNoise: boolean): HubModelChip => {
      if (line === BUNDLE_GROUP) {
        return { slug: item.page.slug, label: item.display, prefix: null, good: item.good };
      }
      const rest = withoutLine(words(item.page.modelName), line)
        .filter((w) => !dropNoise || !noise(w))
        .join(' ');
      return rest
        ? { slug: item.page.slug, label: rest, prefix: name, good: item.good }
        : { slug: item.page.slug, label: line, prefix: null, good: item.good };
    };
    const sorted = [...members].sort(byGoodThenDeals);
    // 흔한 말(「제로」)을 빼다 「칠성사이다 제로」와 「칠성사이다」가 둘 다 「칠성사이다」가 됐다 — 이름이 겹치면 그 칩만 다 쓴다.
    const trimmed = sorted.map((item) => chipOf(item, true));
    const clashes = new Set(trimmed.map((c) => c.label).filter((l, i, all) => all.indexOf(l) !== i));
    const chips = uniqueChips(
      sorted.map((item, i) => (clashes.has(trimmed[i].label) ? chipOf(item, false) : trimmed[i])),
    );
    groups.push({ name, chips, items: members });
  }

  // ④ 브랜드가 섞인 허브 — 줄로 안 묶인 것을 브랜드로.
  let singles = loose;
  if (!oneBrand) {
    const byBrand = new Map<string, Item[]>();
    for (const item of loose) {
      const brand = item.page.brand?.trim() ?? '';
      if (!saidBrand(brand)) byBrand.set(brand, [...(byBrand.get(brand) ?? []), item]);
    }
    const grouped = new Set<Item>();
    for (const [brand, members] of byBrand) {
      if (members.length < 2) continue;
      members.forEach((m) => grouped.add(m));
      const chips = uniqueChips(
        [...members].sort(byGoodThenDeals).map((item) => ({
          slug: item.page.slug,
          label:
            words(item.page.modelName)
              .filter((w) => !noise(w))
              .join(' ') || item.page.modelName,
          prefix: brand,
          good: item.good,
        })),
      );
      groups.push({ name: brand, chips, items: members });
    }
    singles = loose.filter((item) => !grouped.has(item));
  }

  // 줄 순서: 지금 싼 상품이 든 줄 → 딜 많은 줄, 여러 개 묶음은 맨 뒤.
  const weight = (g: { name: string; items: Item[] }) => ({
    bundle: g.name === BUNDLE_GROUP ? 1 : 0,
    good: g.items.some((i) => i.good) ? 0 : 1,
    deals: g.items.reduce((sum, i) => sum + i.page.dealCount, 0),
  });
  groups.sort((a, b) => {
    const x = weight(a);
    const y = weight(b);
    return x.bundle - y.bundle || x.good - y.good || y.deals - x.deals;
  });

  const loneChips = uniqueChips(
    [...singles].sort(byGoodThenDeals).map((item) => ({
      slug: item.page.slug,
      label:
        words(item.display)
          .filter((w) => !hub.includes(squash(w)))
          .join(' ') || item.display,
      prefix: null,
      good: item.good,
    })),
  );
  const goodSingles = loneChips.filter((c) => c.good).length;
  const cut = Math.max(HUB_MODEL_SINGLES_VISIBLE, goodSingles);
  return {
    groups: groups.map(({ name, chips }) => ({ name, chips })),
    visible: loneChips.slice(0, cut),
    folded: loneChips.slice(cut),
    goodCount: items.filter((i) => i.good).length,
    total: groups.reduce((n, g) => n + g.chips.length, 0) + loneChips.length,
  };
}

/**
 * 모델 페이지 위 「같은 줄」 — 허브에서 이 상품이 묶인 줄(진라면 → 순한맛·매운맛·매운맛 컵). 허브 칩을 눌러 온 사람이
 * 옆 맛·구성으로 바로 건너가게 허브와 같은 묶음·순서를 그대로 쓴다. 줄에 안 묶였거나 「여러 개 묶음」(서로 다른 구성의 모음)이면 null.
 */
export function findHubModelLine(
  groups: readonly HubModelGroup[],
  slug: string,
): HubModelGroup | null {
  const line = groups.find((g) => g.chips.some((c) => c.slug === slug));
  return line && line.name !== BUNDLE_GROUP ? line : null;
}
