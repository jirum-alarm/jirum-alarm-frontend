/** /deals/[slug] payload에서 구매 판단·목록 우선순위를 프론트에서 파생. */

export interface Deal {
  productId: number;
  title: string;
  price: number | null;
  unitPrice?: number | null;
  unitLabel?: string | null;
  isEnd?: boolean;
  url: string;
  providerId: number;
  mallName: string | null;
  postedAt: string | null;
  thumbnail: string | null;
}

export interface Representative {
  label: string;
  danawaPrice: number | null;
  mallCount: number | null;
  priceRank: string | null;
  danawaUrl: string | null;
  activeDeals: number;
  dealMinPrice: number | null;
  unitPrice: number | null;
  unitLabel: string | null;
}

export interface HeroPrice {
  minPrice: number | null;
  label: string;
  unitPrice: number | null;
  unitLabel: string | null;
}

export type HistBasis = 'unit' | 'total';

/** 증정·포인트·사은품 등으로 단위가가 왜곡될 수 있는 딜. */
const BUNDLE_TITLE_RE =
  /증정|포인트|원권|쿠폰|치킨|햄버거|버거|사은품|라이브|카드.?할|스마일페이|롯데카드/i;

export function isLikelyBundleDeal(title: string): boolean {
  return BUNDLE_TITLE_RE.test(title);
}

/** 목록/히어로 비교에 쓸 가격 (단위축이면 동일 unitLabel의 unitPrice). */
export function dealComparePrice(
  deal: Deal,
  basis: HistBasis,
  unitLabel?: string | null,
): number | null {
  if (basis === 'unit' && unitLabel && deal.unitLabel === unitLabel && deal.unitPrice != null) {
    return deal.unitPrice;
  }
  return deal.price;
}

export type TimingTone = 'good' | 'fair' | 'high' | 'unknown';

export interface TimingInsight {
  tone: TimingTone;
  label: string;
  current: number;
  avg: number | null;
  buyLine: number | null;
  saveVsAvg: number | null;
  savePct: number | null;
  basis: HistBasis;
  unitLabel?: string | null;
  packLabel?: string | null;
  totalPrice?: number | null;
  activeDealCount: number;
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * 진행 중(비종료) 딜 기준 현재가 + 추이 평균으로 타이밍 판정.
 * 백엔드 신규 필드 없이 payload만으로 동작.
 */
export function buildTimingInsight(input: {
  deals: Deal[];
  histPrices: number[];
  histBasis: HistBasis;
  histUnitLabel?: string | null;
  heroPrice?: HeroPrice | null;
}): TimingInsight {
  const { deals, histPrices, histBasis, histUnitLabel, heroPrice } = input;
  const active = deals.filter((d) => !d.isEnd && !isLikelyBundleDeal(d.title));
  const pool = active.length ? active : deals.filter((d) => !d.isEnd);

  let best: { price: number; deal: Deal } | null = null;
  for (const deal of pool) {
    const p = dealComparePrice(deal, histBasis, histUnitLabel);
    if (p == null) continue;
    if (!best || p < best.price) best = { price: p, deal };
  }

  // 진행 딜이 없으면 히어로가를 폴백(판정은 unknown에 가깝게).
  const current =
    best?.price ??
    (histBasis === 'unit' && heroPrice?.unitPrice != null
      ? heroPrice.unitPrice
      : (heroPrice?.minPrice ?? null));

  const avg = mean(histPrices);
  const histMin = histPrices.length ? Math.min(...histPrices) : null;
  // "이하면 사도 됨" — 추이 하위 ~30% 구간(최저~최고 선형).
  const histMax = histPrices.length ? Math.max(...histPrices) : null;
  const buyLine =
    histMin != null && histMax != null ? histMin + (histMax - histMin) * 0.3 : histMin;

  if (current == null) {
    return {
      tone: 'unknown',
      label: '가격 정보 부족',
      current: 0,
      avg,
      buyLine,
      saveVsAvg: null,
      savePct: null,
      basis: histBasis,
      unitLabel: histUnitLabel,
      packLabel: heroPrice?.label ?? null,
      totalPrice: heroPrice?.minPrice ?? null,
      activeDealCount: pool.length,
    };
  }

  const saveVsAvg = avg != null ? avg - current : null;
  const savePct = avg != null && avg > 0 ? Math.round(((avg - current) / avg) * 100) : null;

  let tone: TimingTone = 'fair';
  let label = '평소 수준';
  if (histMin != null && current <= histMin * 1.02) {
    tone = 'good';
    label = '역대급 · 사기 좋은 구간';
  } else if (avg != null && current <= avg * 0.9) {
    tone = 'good';
    label = '평소보다 저렴 · 사기 좋은 구간';
  } else if (avg != null && current <= avg) {
    tone = 'fair';
    label = '평소 수준';
  } else if (avg != null && current > avg) {
    tone = 'high';
    label = '다소 높은 편';
  } else {
    tone = 'unknown';
    label = '추이 대비 판단 불가';
  }

  return {
    tone,
    label,
    current,
    avg,
    buyLine,
    saveVsAvg,
    savePct,
    basis: histBasis,
    unitLabel: histUnitLabel,
    packLabel: best?.deal ? undefined : (heroPrice?.label ?? null),
    totalPrice: best?.deal.price ?? heroPrice?.minPrice ?? null,
    activeDealCount: pool.length,
  };
}

export interface RankedRepresentative extends Representative {
  /** 단위가 최저(유효 값만). */
  isBestUnit: boolean;
  danawaSaving: number | null;
}

/** 단위가 낮은 순 + 가성비 1위 플래그. 다나와 0/음수는 절약 계산에서 제외. */
export function rankRepresentatives(reps: Representative[]): RankedRepresentative[] {
  const withUnit = reps.filter((r) => r.unitPrice != null && r.unitPrice > 0);
  const bestUnit = withUnit.length ? Math.min(...withUnit.map((r) => r.unitPrice as number)) : null;

  const ranked = reps.map((r) => {
    const danawaOk = r.danawaPrice != null && r.danawaPrice > 0;
    const danawaSaving =
      danawaOk && r.dealMinPrice != null && r.dealMinPrice < r.danawaPrice!
        ? r.danawaPrice! - r.dealMinPrice
        : null;
    return {
      ...r,
      isBestUnit: bestUnit != null && r.unitPrice === bestUnit,
      danawaSaving,
    };
  });

  return ranked.sort((a, b) => {
    // 핫딜 있는 팩 우선, 그다음 단위가 낮은 순
    const aHot = a.activeDeals > 0 || a.dealMinPrice != null ? 0 : 1;
    const bHot = b.activeDeals > 0 || b.dealMinPrice != null ? 0 : 1;
    if (aHot !== bHot) return aHot - bHot;
    const au = a.unitPrice ?? Number.POSITIVE_INFINITY;
    const bu = b.unitPrice ?? Number.POSITIVE_INFINITY;
    return au - bu;
  });
}

export function splitDealsForList(
  deals: Deal[],
  basis: HistBasis,
  unitLabel?: string | null,
): { active: Deal[]; history: Deal[] } {
  const active = deals.filter((d) => !d.isEnd);
  const history = deals;

  const byPrice = (a: Deal, b: Deal) => {
    const pa = dealComparePrice(a, basis, unitLabel);
    const pb = dealComparePrice(b, basis, unitLabel);
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  };

  // 진행 중: 번들 아닌 것 먼저, 그다음 단위/총액 싼 순
  const activeSorted = [...active].sort((a, b) => {
    const ab = Number(isLikelyBundleDeal(a.title)) - Number(isLikelyBundleDeal(b.title));
    if (ab !== 0) return ab;
    return byPrice(a, b);
  });

  return { active: activeSorted, history: [...history].sort(byPrice) };
}

/** 숫자 읽기의 종성 유무 — "4060은"(영=ㅇ), "삼다수는". 조사 선택에만 쓴다. */
const DIGIT_HAS_FINAL: Record<string, boolean> = {
  '0': true, // 영
  '1': true, // 일
  '2': false, // 이
  '3': true, // 삼
  '4': false, // 사
  '5': false, // 오
  '6': true, // 육
  '7': true, // 칠
  '8': true, // 팔
  '9': false, // 구
};

/**
 * 은/는 조사를 붙인다. 361개 모델 페이지의 첫 문장에 쓰이므로 틀리면 바로 눈에 띈다.
 * 한글 음절은 종성 유무로, 숫자는 읽는 소리로 판단. 그 외(영문 등)는 "는".
 */
export function withTopicParticle(word: string): string {
  const trimmed = word.trim();
  const last = trimmed.slice(-1);
  if (!last) return trimmed;

  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? `${trimmed}는` : `${trimmed}은`;
  }
  if (last in DIGIT_HAS_FINAL) {
    return DIGIT_HAS_FINAL[last] ? `${trimmed}은` : `${trimmed}는`;
  }
  return `${trimmed}는`;
}

/**
 * 모델 페이지 리드 문장 — "답을 먼저, 근거를 뒤에".
 *
 * 왜: 이 페이지의 판단 근거(적정가·평균·현재 최저가)가 전부 UI 토큰으로만 흩어져 있어서
 * 문장으로 추출되지 않았다. AI 답변 엔진은 인용할 **문장**이 필요하고, 네이버 AI 브리핑은
 * 정보형 질의에서 "첫 문단 정의문"을 인용한다. 같은 문장을 JSON-LD `description` 에도 쓴다.
 *
 * 가격 표기는 호출자가 넘긴 `formatPrice` 로만 한다 — 단위가/총액·통화 규칙이 페이지에 있다.
 */
export function buildDealsLeadSentence(input: {
  modelName: string;
  timing: TimingInsight;
  dealCount: number;
  formatPrice: (price: number) => string;
}): string | null {
  const { modelName, timing, dealCount, formatPrice } = input;
  const name = modelName.trim();
  if (!name) return null;

  const sentences: string[] = [];

  if (timing.buyLine != null && timing.buyLine > 0) {
    sentences.push(
      `${withTopicParticle(name)} ${formatPrice(timing.buyLine)} 이하면 사도 되는 가격입니다.`,
    );
  }

  const evidence: string[] = [];
  if (dealCount > 0) {
    evidence.push(`최근 핫딜 ${dealCount.toLocaleString('ko-KR')}건`);
  }
  if (timing.avg != null && timing.avg > 0) {
    evidence.push(`추이 평균 ${formatPrice(timing.avg)}`);
  }
  if (timing.current > 0) {
    const cheaper =
      timing.savePct != null && timing.savePct > 0 ? ` (평균보다 약 ${timing.savePct}% 저렴)` : '';
    evidence.push(`지금 진행 중 최저가 ${formatPrice(timing.current)}${cheaper}`);
  }
  if (evidence.length > 0) {
    sentences.push(`${evidence.join(' · ')}.`);
  }

  return sentences.length > 0 ? sentences.join(' ') : null;
}
