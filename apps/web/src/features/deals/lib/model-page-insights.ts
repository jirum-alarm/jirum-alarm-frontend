/** /deals/[slug] 화면 문구·목록 순서. 구매 판단(지금 살까)은 서버 priceVerdict 를 읽는다. */

import { deriveKeyword } from '@jirum/domain/derive-keyword';
import { relativeTimeLabel } from '@jirum/domain/relative-time';

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

/** 목록/히어로 비교에 쓸 가격 (단위축이면 동일 unitLabel의 unitPrice). */
export function dealComparePrice(
  deal: Deal,
  basis: HistBasis,
  unitLabel?: string | null,
): number | null {
  if (basis === 'unit' && unitLabel) {
    // 단가 축 페이지에서 단가가 없거나 다른 축인 딜은 비교할 수 없다 — 총액으로 대신하면 「개당 662원」이 100ml당 추이와 비교돼
    // "1425% 비쌈" 이 나갔다(2026-10-17 삼다수). 서버 판정(model-page-price-verdict.ts comparePrice)과 같은 축.
    return deal.unitLabel === unitLabel && deal.unitPrice != null ? deal.unitPrice : null;
  }
  return deal.price;
}

/** 최근 딜 목록에서 «종료»로 흐리게 보일 게시 후 일수 — 서버 판정의 «진행 중»(ACTIVE_DEAL_MAX_DAYS)과 같은 값. */
const ACTIVE_DEAL_MAX_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 원화 페이지 딜 목록에 섞여 오는 직구 딜의 달러 가격($219.76). 원 가격은 정수라 소수면 원화가 아니다 —
 * 원 축 판정·"지금 최저가"에 넣으면 "GB당 220원 · 135% 비쌈" 이 된다(2026-10-09 WD SN850X).
 * 백엔드 model-page-price-verdict.ts 와 같은 규칙(그쪽은 같은 딜이 Int 필드에 실려 /deals 목록이 500 이었다).
 */
export function isForeignPriceDeal(deal: Deal, currency: 'KRW' | 'USD' = 'KRW'): boolean {
  return currency === 'KRW' && deal.price != null && !Number.isInteger(deal.price);
}

/** 딜 한 줄 가격 — 직구 딜(달러 페이지 전체, 또는 원화 페이지에 섞인 소수 가격 딜)은 달러로(예전엔 $219.76 이 "220원"으로 보였다). */
export function formatDealPrice(deal: Deal, currency: 'KRW' | 'USD'): string {
  if (deal.price == null) return '-';
  return currency === 'USD' || isForeignPriceDeal(deal, currency)
    ? `$${deal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : `${Math.round(deal.price).toLocaleString()}원`;
}

/** 크롤링 제목에 섞여 온 HTML 태그(`<img src=...>`)·엔티티 제거. */
export function cleanDealTitle(title: string): string {
  return title
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) =>
      e === 'amp' ? '&' : e === 'lt' ? '<' : e === 'gt' ? '>' : e === 'quot' ? '"' : "'",
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** mall = 같은 구성이 상시몰(다나와)에서 더 싸거나 같다 — 추이 판정보다 앞선다(백엔드 mall_cheaper). */
export type TimingTone = 'good' | 'fair' | 'high' | 'mall' | 'unknown';

export interface TimingInsight {
  tone: TimingTone;
  label: string;
  current: number;
  avg: number | null;
  buyLine: number | null;
  savePct: number | null;
  basis: HistBasis;
  unitLabel?: string | null;
  packLabel?: string | null;
  totalPrice?: number | null;
  activeDealCount: number;
  /** current 가 진행 중 딜 가격인가. false 면 히어로가(지난 핫딜) 폴백 — "지금" 이라고 부르면 안 된다. */
  isActivePrice: boolean;
  /** 판정한 딜의 구성(「350ml 24개」) — 판정이 어느 구성 기준인지 보여 준다. */
  bestPackLabel: string | null;
  /** 판정한 딜과 같은 구성의 다나와 최저가. */
  mallPrice: number | null;
  /** 추이 점 수 — 판정 근거 표시용. */
  historyPoints: number;
}

/**
 * 서버 판정 — modelPage.priceVerdict(crawling-server model-page-price-verdict.ts buildPriceVerdict). /deals 목록 카드와 같은 계산이다.
 * 예전엔 같은 규칙을 여기서 따로 들고 있다가 구성 키·같은 딜 묶기가 서버와 어긋났다(2026-10-19). 여기는 문구만 만든다.
 */
export interface PriceVerdict {
  tone?: string | null;
  pendingReason?: string | null;
  activeDealCount: number;
  activeProductIds: number[];
  bundleProductIds: number[];
  bestProductId?: number | null;
  comparePrice?: number | null;
  activePrice?: number | null;
  bestPackLabel?: string | null;
  mallPrice?: number | null;
  avgPrice?: number | null;
  savePct?: number | null;
  buyLine?: number | null;
  historyPoints: number;
}

const TONE_LABEL: Record<string, { tone: TimingTone; label: string }> = {
  // "역대"라고 부르지 않는다 — 추이는 우리가 모은 핫딜 몇 주치다(점 5개면 판정한다).
  lowest: { tone: 'good', label: '기록상 최저 · 사기 좋은 구간' },
  cheap: { tone: 'good', label: '평소보다 저렴 · 사기 좋은 구간' },
  fair: { tone: 'fair', label: '평소 수준' },
  high: { tone: 'high', label: '다소 높은 편' },
  mall_cheaper: { tone: 'mall', label: '다나와가 더 쌈 · 핫딜 아님' },
};

// 지난 가격으로 "사기 좋은 구간"이라 하면 /deals 목록("핫딜을 기다리는 상품")과 모순된다 — 진행 딜이 없으면 판정하지 않는다.
const PENDING_LABEL: Record<string, string> = {
  NOT_COMPARABLE: '진행 중 · 단가 비교 불가',
  BUNDLE_ONLY: '증정·혜택 딜만 진행 중',
  NO_ACTIVE: '진행 중인 핫딜 없음',
  THIN_HISTORY: '추이 대비 판단 불가',
};

/**
 * 추이 점이 이보다 적으면 서버가 판정도 «이하면 사도 됨»(buyLine)도 내지 않는다(model-page-price-verdict.ts MIN_HISTORY_POINTS).
 * 여기선 그 이유를 말로 하는 데만 쓴다(「기록이 짧아 …」).
 */
export const MIN_HISTORY_POINTS = 5;

/** 서버 판정을 화면 문구로. 진행 딜이 없으면 히어로가(지난 핫딜 최저)를 보여 주되 "지금"이라 부르지 않는다. */
export function timingFromVerdict(input: {
  verdict: PriceVerdict | null | undefined;
  histBasis: HistBasis;
  histUnitLabel?: string | null;
  heroPrice?: HeroPrice | null;
}): TimingInsight {
  const { verdict, histBasis, histUnitLabel, heroPrice } = input;
  const isActivePrice = verdict?.comparePrice != null;
  const fallback =
    histBasis === 'unit' && heroPrice?.unitPrice != null
      ? heroPrice.unitPrice
      : (heroPrice?.minPrice ?? null);
  const current = isActivePrice ? (verdict?.comparePrice as number) : fallback;
  const known = verdict?.tone ? TONE_LABEL[verdict.tone] : undefined;
  const historyPoints = verdict?.historyPoints ?? 0;
  // 지난 가격이 없어도 서버가 «진행 중인 핫딜 없음»이라 했으면 그게 답이다 — 「가격 정보 부족」은 판정 자체가 없을 때만.
  const pending = verdict ? PENDING_LABEL[verdict.pendingReason ?? 'NO_ACTIVE'] : undefined;
  return {
    tone: current == null ? 'unknown' : (known?.tone ?? 'unknown'),
    label:
      known?.label ?? pending ?? (current == null ? '가격 정보 부족' : PENDING_LABEL.NO_ACTIVE),
    current: current ?? 0,
    avg: verdict?.avgPrice ?? null,
    buyLine: verdict?.buyLine ?? null,
    savePct: verdict?.savePct ?? null,
    basis: histBasis,
    unitLabel: histUnitLabel,
    packLabel: isActivePrice ? undefined : (heroPrice?.label ?? null),
    totalPrice: isActivePrice ? (verdict?.activePrice ?? null) : (heroPrice?.minPrice ?? null),
    activeDealCount: verdict?.activeDealCount ?? 0,
    isActivePrice,
    bestPackLabel: isActivePrice ? (verdict?.bestPackLabel ?? null) : null,
    mallPrice: isActivePrice ? (verdict?.mallPrice ?? null) : null,
    historyPoints,
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

/** 진행 중·증정 딜은 서버 판정이 고른 것(같은 딜 재게시 묶기·3일 기준이 판정과 같다). 여기선 줄 순서만 정한다. */
export function splitDealsForList(
  deals: Deal[],
  basis: HistBasis,
  unitLabel: string | null | undefined,
  verdict: Pick<PriceVerdict, 'activeProductIds' | 'bundleProductIds'> | null | undefined,
  currency: 'KRW' | 'USD' = 'KRW',
): { active: Deal[]; history: Deal[] } {
  const activeIds = new Set(verdict?.activeProductIds ?? []);
  const bundleIds = new Set(verdict?.bundleProductIds ?? []);
  const active = deals.filter((d) => activeIds.has(d.productId));

  // 외화 딜은 원 축에서 비교할 수 없으니 뒤로 — 첫 줄이 "지금 추천"이다.
  const foreignLast = (a: Deal, b: Deal) =>
    Number(isForeignPriceDeal(a, currency)) - Number(isForeignPriceDeal(b, currency));
  const byPrice = (a: Deal, b: Deal) => {
    const fl = foreignLast(a, b);
    if (fl !== 0) return fl;
    const pa = dealComparePrice(a, basis, unitLabel);
    const pb = dealComparePrice(b, basis, unitLabel);
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  };

  // 진행 중: 번들 아닌 것 먼저, 그다음 단위/총액 싼 순
  const activeSorted = [...active].sort((a, b) => {
    const fl = foreignLast(a, b);
    if (fl !== 0) return fl;
    const ab = Number(bundleIds.has(a.productId)) - Number(bundleIds.has(b.productId));
    if (ab !== 0) return ab;
    return byPrice(a, b);
  });

  return { active: activeSorted, history: [...deals].sort(byPrice) };
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

const KOREAN_DATE = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** 「2026년 9월 29일」 — 한국 날짜로(운영 파드는 UTC 라 그대로 찍으면 밤 딜이 하루 앞당겨진다). */
function koreanDate(at: string): string | null {
  const t = Date.parse(at);
  return Number.isNaN(t) ? null : KOREAN_DATE.format(t);
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
  /** 진행 딜이 없을 때 마지막 딜 — 「지금 사도 될까?」 아래 첫 문단이 지금 상태를 날짜로 답한다(인용돼도 낡지 않게 날짜로). */
  lastDeal?: { postedAt: string; price?: number | null } | null;
}): string | null {
  const { modelName, timing, dealCount, formatPrice, lastDeal } = input;
  const name = modelName.trim();
  if (!name) return null;

  const sentences: string[] = [];
  const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

  // 상시몰이 더 싸면 그게 답이다 — "○원 이하면 사도 됨"보다 먼저, 그리고 대신.
  if (timing.tone === 'mall' && timing.mallPrice != null && timing.totalPrice != null) {
    const pack = timing.bestPackLabel ? `${timing.bestPackLabel} ` : '';
    // 같은 값이면 「더 쌉니다」가 틀린 말이다(2026-10-24 진라면 매운맛 3,050원 = 3,050원).
    sentences.push(
      timing.mallPrice < timing.totalPrice
        ? // eslint-disable-next-line no-restricted-syntax -- AI 답변·네이버 브리핑이 인용하는 정의문(JSON-LD description 과 같은 문장) — 평서문 유지
          `${withTopicParticle(name)} 지금 핫딜(${pack}${won(timing.totalPrice)})보다 다나와 최저가(${won(timing.mallPrice)})가 더 쌉니다.`
        : // eslint-disable-next-line no-restricted-syntax -- 위와 같은 인용용 정의문
          `${withTopicParticle(name)} 지금 핫딜(${pack}${won(timing.totalPrice)})이 다나와 최저가와 같습니다.`,
    );
  } else if (timing.buyLine != null && timing.buyLine > 0) {
    sentences.push(
      // eslint-disable-next-line no-restricted-syntax -- 위와 같은 인용용 정의문
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
  if (timing.current > 0 && timing.isActivePrice) {
    const cheaper =
      timing.savePct != null && timing.savePct > 0 ? ` (평균보다 약 ${timing.savePct}% 저렴)` : '';
    evidence.push(`지금 진행 중 최저가 ${formatPrice(timing.current)}${cheaper}`);
  }
  if (timing.activeDealCount === 0 && lastDeal) {
    const price = lastDeal.price != null && lastDeal.price > 0 ? `(${won(lastDeal.price)})` : '';
    const day = koreanDate(lastDeal.postedAt);
    if (day) evidence.push(`마지막 핫딜 ${day}${price}`);
  }
  if (evidence.length > 0) {
    sentences.push(`${evidence.join(' · ')}.`);
  }

  return sentences.length > 0 ? sentences.join(' ') : null;
}

/**
 * 모델 페이지의 보이는 이름 = 제목·h1·빵부스러기·JSON-LD 이름.
 *
 * modelName(brand_item.name)엔 브랜드가 빠진 게 많다 — "M90", "포터블 SSD T7", "생수".
 * 네이버는 제목 문서 주제로 매칭하는데 "생수 핫딜 최저가 모음" 으론 무슨 생수인지 모른다(2026-09-23 실측).
 * 그래서 브랜드가 이름에 없으면 앞에 붙이고, 수집 노이즈인 연속 중복 토큰("제로 제로")을 줄인다.
 *
 * ponytail: 브랜드가 이미 들어 있는지는 포함 여부 + "브랜드가 모델 첫 토큰으로 시작"(코카콜라음료 ↔ 코카콜라) 두 가지만 본다.
 */
export function buildModelDisplayName(brand: string | null | undefined, modelName: string): string {
  const tokens = modelName.trim().split(/\s+/).filter(Boolean);
  const deduped = tokens.filter(
    (t, i) => i === 0 || t.toLowerCase() !== tokens[i - 1].toLowerCase(),
  );
  const name = deduped.join(' ');

  const b = brand?.trim();
  if (!b || !name) return name;

  const lowerName = name.toLowerCase();
  const lowerBrand = b.toLowerCase();
  const firstToken = deduped[0].toLowerCase();
  if (lowerName.includes(lowerBrand) || lowerBrand.startsWith(firstToken)) return name;

  return `${b} ${name}`;
}

/** 상세 "최근 올라온 핫딜" 한 줄 = 서버 modelPage.recentDeals(매칭이 이 모델에 붙인 최근 딜). */
export interface RecentDealRow {
  productId: number;
  title: string;
  priceText: string | null;
  mallName: string | null;
  postedAt: string;
  thumbnail: string | null;
  isEnd: boolean;
  /** verified = 검수된 딜(가격 추이에 들어감), pending = 매칭이 같은 상품으로 붙였지만 검수 전. */
  source: 'verified' | 'pending';
}

export interface RecentDeal {
  productId: number;
  title: string;
  price?: number | null;
  priceCurrency?: string | null;
  mallName?: string | null;
  postedAt: string;
  thumbnail?: string | null;
  isEnd: boolean;
  isVerified: boolean;
}

/**
 * 「같은 상품인가」는 서버(matching-api 매칭 판정)가 정한다 — 예전엔 여기서 이름 검색 결과를 제목 낱말로 골랐는데,
 * 매칭 판정이 있는 34건 중 23건이 다른 상품이었다(갈배사이다 제로·갤럭시탭 보호필름, 2026-10-20). 여기선 표기만.
 */
export function recentDealRows(deals: RecentDeal[], now = Date.now()): RecentDealRow[] {
  return deals.map((d) => ({
    productId: d.productId,
    title: cleanDealTitle(d.title),
    priceText:
      d.price == null
        ? null
        : d.priceCurrency === 'USD'
          ? `$${d.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
          : `${Math.round(d.price).toLocaleString('ko-KR')}원`,
    mallName: d.mallName ?? null,
    postedAt: d.postedAt,
    thumbnail: d.thumbnail ?? null,
    isEnd: d.isEnd || now - Date.parse(d.postedAt) > ACTIVE_DEAL_MAX_DAYS * DAY_MS,
    source: d.isVerified ? 'verified' : 'pending',
  }));
}

/** 답 카드 배지 색 — 좋음=success·비쌈(다나와가 더 쌈 포함)=warning·그 밖=gray(/deals 목록 판정 배지와 같다). */
export type DealsAnswerTone = 'success' | 'warning' | 'gray';

/**
 * 「지금 사도 될까?」 바로 아래 답 카드의 글. 숫자 세 칸(지금 최저·평균 대비·이하면 사도 됨)을 나란히 두면 진행 딜이 없을 때
 * 아무 답도 안 보였다 — 판정 배지는 진행 딜이 있을 때만 그려져(tone=unknown 이면 숨김) 「진행 중인 핫딜 없음」이 화면에 한 번도
 * 안 나갔고, 모델 페이지 대부분이 그 상태다(2026-10-24). 그래서 지금 상태를 큰 글씨 한 줄로 먼저 말하고, 비교·기준은 문장으로 붙인다.
 */
export interface DealsAnswer {
  /** 판정 배지. 진행 딜이 없으면 큰 글씨가 같은 말을 해서 null. */
  badge: { label: string; tone: DealsAnswerTone } | null;
  /** 「지금 가장 싼 핫딜 25,910원」·「지금은 진행 중인 핫딜이 없어요」. */
  headline: string;
  /** 구성·단위가(「140g 40개 · 100g당 463원」), 진행 딜이 없으면 「마지막 핫딜 25일 전 · 9,000원」. */
  detail: string | null;
  /** 평소와 비교 — 「평소 핫딜가(100g당 611원)보다 24% 싸요」. 진행 딜이 없으면 null. */
  compare: string | null;
  /**
   * 기다릴 가격 — 「100g당 541원 이하로 올라오면 사기 좋은 가격이에요」. 진행 딜이 이미 싸거나(배지가 답) 다나와가 답이거나
   * 추이가 짧으면(서버가 기준선을 안 준다) null.
   */
  guide: string | null;
}

export function buildDealsAnswer(input: {
  timing: TimingInsight;
  /** 판정 축 가격 표기(단위 축이면 「100g당 463원」). */
  formatPrice: (price: number) => string;
  lastDeal?: { postedAt: string; price?: number | null } | null;
  now?: number;
}): DealsAnswer {
  const { timing: t, formatPrice, lastDeal, now = Date.now() } = input;
  const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
  const tone: DealsAnswerTone =
    t.tone === 'good' ? 'success' : t.tone === 'high' || t.tone === 'mall' ? 'warning' : 'gray';
  const badge = { label: t.label, tone };
  // 기준선(추이 최저~최고의 아래 30%)은 평균보다 높게 나올 때가 있어(값이 한쪽에 몰린 추이) 평균과 나란히 두면
  // 「평소 375원 / 381원 이하면 사기 좋아요」처럼 서로 어긋나 보였다 — 기다릴 때(진행 딜 없음·평소 수준·비쌈)만 쓴다.
  const guide =
    t.buyLine != null && t.buyLine > 0 && t.tone !== 'mall' && t.tone !== 'good'
      ? `${formatPrice(t.buyLine)} 이하${t.activeDealCount > 0 ? '면' : '로 올라오면'} 사기 좋은 가격이에요`
      : null;

  if (t.isActivePrice) {
    const price = t.totalPrice != null ? won(t.totalPrice) : formatPrice(t.current);
    const unit = t.basis === 'unit' && t.totalPrice != null ? formatPrice(t.current) : null;
    let compare: string | null = null;
    if (t.tone === 'mall' && t.mallPrice != null && t.totalPrice != null) {
      compare =
        t.mallPrice < t.totalPrice
          ? `다나와 같은 구성 최저가 ${won(t.mallPrice)} — 핫딜보다 ${won(t.totalPrice - t.mallPrice)} 싸요`
          : `다나와 같은 구성 최저가도 ${won(t.mallPrice)}으로 같아요`;
    } else if (t.savePct != null && t.avg != null) {
      const avg = formatPrice(t.avg);
      compare =
        t.savePct > 0
          ? `평소 핫딜가(${avg})보다 ${t.savePct}% 싸요`
          : t.savePct < 0
            ? `평소 핫딜가(${avg})보다 ${-t.savePct}% 비싸요`
            : `평소 핫딜가(${avg})와 비슷해요`;
    } else if (t.historyPoints < MIN_HISTORY_POINTS) {
      compare = '모인 핫딜 기록이 짧아 싼지 비싼지는 아직 말하지 않아요';
    }
    return {
      badge,
      headline: `${t.activeDealCount > 1 ? '지금 가장 싼 핫딜' : '지금 핫딜'} ${price}`,
      detail: [t.bestPackLabel, unit].filter(Boolean).join(' · ') || null,
      compare,
      guide,
    };
  }

  // 진행 딜은 있는데 판정 축 가격이 없다(증정 딜만·단가 없음) — 배지가 이유를 말하고 목록으로 보낸다.
  if (t.activeDealCount > 0) {
    return {
      badge,
      headline: `진행 중인 핫딜 ${t.activeDealCount}건`,
      detail: null,
      compare: null,
      guide,
    };
  }

  const ago = lastDeal ? relativeTimeLabel(lastDeal.postedAt, now) : null;
  const lastPrice = lastDeal?.price != null && lastDeal.price > 0 ? won(lastDeal.price) : null;
  return {
    badge: null,
    headline: '지금은 진행 중인 핫딜이 없어요',
    detail: ago ? [`마지막 핫딜 ${ago}`, lastPrice].filter(Boolean).join(' · ') : null,
    compare: null,
    guide,
  };
}

/** 모델명이 지난 딜 제목의 이만큼 넘게 걸리면 모델명을 그대로 건다 — 상품을 가장 좁게 부르는 이름이라. */
const MODEL_NAME_KEEP_RATIO = 0.5;

/**
 * 모델 페이지 알림 버튼이 걸 키워드. 키워드 알림은 제목에 키워드가 (공백 무시) 그대로 들어 있어야 간다 — 모델명(카탈로그 이름)은
 * 제목 표기와 자주 달라(「진라면 매운맛 컵」↔「진라면 컵 매운맛」, 「Q9000 AF17B6474GZS」) 그 상품 지난 딜 제목 어디에도 안 걸리는
 * 페이지가 많았다(2026-10-24 무작위 150쪽 중 54쪽, 평균 46%만 걸림).
 * 모델명이 제목 절반 이상에 걸리면 그대로 두고, 아니면 이 상품 딜 제목마다 상세 알림 제안과 같은 규칙(deriveKeyword)으로 뽑은 후보 중
 * 제목에 가장 많이 걸리는 것(같으면 긴 것 — 더 좁다)을 고른다 — 같은 표본에서 평균 82%, 안 걸리는 페이지 0.
 * 브랜드·상위 키워드 이름 그대로는 후보에서 뺀다(그 브랜드·키워드의 다른 상품에 다 걸린다).
 */
export function pickModelAlertKeyword(input: {
  modelName: string;
  brand?: string | null;
  hubName?: string | null;
  titles: readonly string[];
}): string {
  const fold = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, '');
  const titles = input.titles.map(fold);
  const share = (keyword: string) => {
    const k = fold(keyword);
    return k && titles.length ? titles.filter((t) => t.includes(k)).length / titles.length : 0;
  };
  let best = input.modelName.trim();
  let bestShare = share(best);
  if (bestShare >= MODEL_NAME_KEEP_RATIO) return best;
  const banned = new Set(
    [input.brand, input.hubName].filter((s): s is string => !!s?.trim()).map(fold),
  );
  for (const keyword of new Set(input.titles.map((t) => deriveKeyword(t).trim()))) {
    if (keyword.length < 2 || banned.has(fold(keyword))) continue;
    const s = share(keyword);
    if (s > bestShare || (s === bestShare && keyword.length > best.length)) {
      best = keyword;
      bestShare = s;
    }
  }
  return best;
}

// 앱 키워드 탭도 같은 말을 해야 해서 @jirum/domain 으로 옮겼다(2026-10-20). 기존 import 경로는 그대로 둔다.
export { relativeTimeLabel };
