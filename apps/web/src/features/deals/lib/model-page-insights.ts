/** /deals/[slug] 화면 문구·목록 순서. 구매 판단(지금 살까)은 서버 priceVerdict 를 읽는다. */

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
  return {
    tone: current == null ? 'unknown' : (known?.tone ?? 'unknown'),
    label:
      current == null
        ? '가격 정보 부족'
        : (known?.label ??
          PENDING_LABEL[verdict?.pendingReason ?? 'NO_ACTIVE'] ??
          '추이 대비 판단 불가'),
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
    historyPoints: verdict?.historyPoints ?? 0,
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
  const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

  // 상시몰이 더 싸면 그게 답이다 — "○원 이하면 사도 됨"보다 먼저, 그리고 대신.
  if (timing.tone === 'mall' && timing.mallPrice != null && timing.totalPrice != null) {
    const pack = timing.bestPackLabel ? `${timing.bestPackLabel} ` : '';
    sentences.push(
      `${withTopicParticle(name)} 지금 핫딜(${pack}${won(timing.totalPrice)})보다 다나와 최저가(${won(timing.mallPrice)})가 더 쌉니다.`,
    );
  } else if (timing.buyLine != null && timing.buyLine > 0) {
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
  if (timing.current > 0 && timing.isActivePrice) {
    const cheaper =
      timing.savePct != null && timing.savePct > 0 ? ` (평균보다 약 ${timing.savePct}% 저렴)` : '';
    evidence.push(`지금 진행 중 최저가 ${formatPrice(timing.current)}${cheaper}`);
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

/**
 * "방금"/"N시간 전"/"어제"/"N일 전"/"N달 전"/"N년 전". 서버 렌더라 자정 경계는 근사(경과 시간 기준) — 목록 표기엔 충분.
 * 하루 안은 시간으로 — "오늘"만으로는 아침 딜과 방금 딜이 구분되지 않는다.
 */
export function relativeTimeLabel(at?: string | null, now = Date.now()): string | null {
  if (!at) return null;
  const then = Date.parse(at);
  if (Number.isNaN(then)) return null;
  const hours = Math.floor((now - then) / 3_600_000);
  if (hours < 1) return '방금';
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  if (days < 30) return `${days}일 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
}
