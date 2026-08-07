import {
  type AnswerState,
  type Deal,
  MIN_POINTS_FOR_POSITION,
  MIN_SAMPLE_FOR_QUARTILE,
  type PriceConfidence,
  type PricePoint,
  type PricePosition,
} from './types.ts';

/**
 * 한글 부분문자열 오염 판정.
 *
 * 실측(2026-08-07, 프로덕션 299건): 키워드 뒤에 한글이 이어붙는 결과가 25%.
 * 콜라→콜라겐 22건·콜라보 9건, 커피→커피믹스·커피머신·커피잔 등 8종,
 * 라면→라면기·라면맛·라면용·라면냄비 등. 규칙 몇 개로 잡을 문제가 아니라
 * 한글 검색의 구조적 특성이므로, 배제 목록이 아니라 "뒤에 한글이 붙으면 오염"으로 판정한다.
 */
export const isPolluted = (title: string, keyword: string): boolean => {
  let seen = false;
  let from = 0;
  for (;;) {
    const at = title.indexOf(keyword, from);
    if (at === -1) break;
    seen = true;
    const tail = title.charAt(at + keyword.length);
    // 뒤에 한글이 안 붙은 출현이 하나라도 있으면 진짜 그 상품이다
    if (!/[가-힣]/.test(tail)) return false;
    from = at + 1;
  }
  // 모든 출현이 한글에 이어붙어 있었다면 오염. 키워드가 아예 없으면 판정 보류(false).
  return seen;
};

/**
 * 접두 오염 — 키워드 *앞*에 붙어 대상을 바꾸는 수식어.
 *
 * 실측(2026-08-07, 로컬 렌더): "기저귀" 45건 중 절반이 **강아지 기저귀**였다
 * (애견기저귀·강아지기저귀·반려동물 기저귀 매너벨트). `isPolluted` 는 뒤만 보므로
 * 못 잡는다 — 접미는 다른 *상품*(콜라겐), 접두는 같은 상품의 다른 *대상*(반려동물용).
 *
 * 검색어에 그 토큰이 있으면 가드한다(강아지 기저귀를 찾는 사람은 배제되면 안 됨) —
 * [[search-accessory-noise-and-es]] 의 결과측 디부스트와 같은 원칙.
 */
const AUDIENCE_SWAP = ['애견', '반려동물', '반려견', '강아지', '고양이', '애묘', '펫'];

export const isAudienceMismatch = (title: string, keyword: string): boolean => {
  if (AUDIENCE_SWAP.some((t) => keyword.includes(t))) return false;
  return AUDIENCE_SWAP.some((t) => title.includes(t));
};

/**
 * 다품목 묶음딜 판정 — 실측 38%. 단일 시세를 낼 수 없다.
 *
 * 함정: "코카콜라 제로 레몬라임, 24개, 350ml" 처럼 스펙을 콤마로 나열한 것은
 * 묶음딜이 아니다. 구분자가 상품명을 잇는지(묶음) 수량·용량을 잇는지(스펙)를 갈라야 한다.
 */
const BUNDLE_MARKER = /등\s*[(（]|외\s*\d+\s*종|모음전?|다양/;
/** 콤마·슬래시로 이어진 조각이 수량/용량이면 스펙, 한글 명사면 품목 */
const SPEC_PIECE =
  /^\s*\d+(\.\d+)?\s*(개입|개|캔|입|p|팩|매|롤|봉|포|ml|l|g|kg|t|호|년|주|매입)?\s*$/i;

export const isBundle = (title: string): boolean => {
  if (BUNDLE_MARKER.test(title)) return true;
  // 앞부분(가격 괄호 앞)만 본다 — 뒤쪽 "(다양/유배)" 는 배송 표기다
  const head = title.split(/[(（]/)[0];
  const pieces = head
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (pieces.length < 3) return false;
  // 첫 조각을 뺀 나머지 중 스펙이 아닌(=품목명인) 조각이 2개 이상이면 묶음
  const nonSpec = pieces.slice(1).filter((p) => !SPEC_PIECE.test(p));
  return nonSpec.length >= 2;
};

/**
 * 결과 다수가 속한 카테고리. 판정 카드의 기준 딜을 고를 때 쓴다.
 *
 * ★왜 필요한가(실측 2026-08-08): "기저귀" 대표 딜로 뽑힌 것이
 * `레토 자동 센서 쓰레기통 … 기저귀 화장실 틈새`(가전·가구)였다. 제목 끝에 용도로
 * 키워드가 스친 **다른 상품**인데 그걸 기준으로 "역대 딜 중 싼 편"이라고 단정했다.
 *
 * `isPolluted`(뒤에 한글 붙음)·`isBundle`(다품목) 둘 다 이걸 못 잡는다 — 실측으로 확인했다.
 * 제목 안 위치로도 못 가른다(진짜 기저귀도 18~21 위치에 온다).
 * 반면 카테고리는 갈린다: 진짜는 전부 `육아`, 쓰레기통만 `가전·가구`.
 *
 * ponytail: 최빈 카테고리 한 줄. 분류기 안 만든다.
 */
export const majorityCategory = (deals: Deal[]): string | null => {
  const count = new Map<string, number>();
  for (const d of deals) {
    if (!d.categoryName) continue;
    count.set(d.categoryName, (count.get(d.categoryName) ?? 0) + 1);
  }
  let top: string | null = null;
  let best = 0;
  for (const [cat, n] of count) {
    if (n > best) {
      best = n;
      top = cat;
    }
  }
  // 과반이 아니면 "다수"라고 부를 수 없다 — 그럴 땐 카테고리로 거르지 않는다
  return best > deals.length / 2 ? top : null;
};

/**
 * 원화 가격만 집계에 넣는다.
 *
 * 실측(2026-08-07, 로컬 렌더): "무선이어폰" 50건 중 **13건이 달러딜**
 * (`$2.98`·`$10.60` 등 UGREEN·Toocki 직구). `parsedPrice` 는 통화 구분 없이
 * 숫자만 담으므로 섞으면 "최저 2.98원" 이 나온다 — 실제로 그렇게 렌더됐다.
 * 통화 판정은 `priceCurrency` 로만 한다(금액 크기로 추측하면
 * `라방 5원`·`적립금 10원` 같은 진짜 저가 원화딜을 잘못 버린다).
 */
export const krwPrice = (deal: Deal): number | null => {
  if (deal.parsedPrice == null || deal.parsedPrice <= 0) return null;
  if (deal.priceCurrency != null && deal.priceCurrency !== 'KRW') return null;
  return deal.parsedPrice;
};

/**
 * 과거 가격들 중 이 값이 어디쯤인가. 0(최저) ~ 1(최고).
 *
 * ⚠️ 분모가 `length - 1` 이면 **1 을 넘는다**(실측 2026-08-08: pct 1.14·1.33).
 * 과거 4건이 전부 현재가보다 낮으면 below=4 인데 분모가 3이라 1.33 이 된다 —
 * 막대 위 점이 트랙 밖으로 나가고, "하위 133%" 같은 문장이 만들어진다.
 * 현재가가 과거 범위 **밖**에 있는 건 정상 상황이므로(지금이 역대 최고가일 수 있다)
 * 계산을 고친다. 분모는 표본 수(length)다.
 */
const percentileOf = (sorted: number[], value: number): number => {
  if (sorted.length === 0) return 0;
  const below = sorted.filter((p) => p < value).length;
  return below / sorted.length;
};

/**
 * 같은 상품의 과거 딜 대비 위치. 수량 파싱을 하지 않는다 —
 * "24개입 시세"가 아니라 "이 상품의 역대 딜 중 지금 위치"라서
 * 팩 사이즈를 몰라도 성립한다.
 */
export const computePosition = (price: number, history: number[]): PricePosition | null => {
  const sorted = [...history].filter((p) => p > 0).sort((a, b) => a - b);
  if (sorted.length < 2) return null;

  const percentile = percentileOf(sorted, price);
  return {
    price,
    percentile,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    sampleSize: sorted.length,
    verdict: percentile <= 0.3 ? 'cheap' : percentile >= 0.7 ? 'pricey' : 'normal',
    // 히스토리 배열만 받는 저수준 버전 — 근거의 세기를 모르므로 보수적으로 LOW.
    // 백엔드 confidence 를 아는 호출자는 positionFromHistory 를 쓴다.
    confidence: 'LOW',
  };
};

/**
 * 같은 딜이 여러 날에 걸쳐 실려 오는 것을 지운다.
 *
 * ★실측(2026-08-07, product 27293619): 9점 중 6점이 **같은 딜(16,909원)** 이
 * 2025-08-08~13 연속으로 캐리오버된 것이었다. 중복을 그대로 넣으면 그 가격이
 * 분포를 장악해 percentile 이 "6번 나온 가격" 쪽으로 끌린다 —
 * 표본이 9개처럼 보이지만 실제 서로 다른 딜은 3개다.
 *
 * seed(=지금 보고 있는 딜)도 뺀다. 자기를 포함한 분포에서 자기 위치를 재면
 * 표본이 작을 때 percentile 이 자기 자신 때문에 밀린다.
 */
export const historyPrices = (points: PricePoint[]): number[] => {
  const byDeal = new Map<number, number>();
  for (const p of points) {
    if (p.isSeed || p.price <= 0) continue;
    byDeal.set(p.dealId, p.price);
  }
  return [...byDeal.values()];
};

/**
 * 가격 추이 → 위치 판정. **정직성 게이트가 여기 있다.**
 *
 * 두 관문을 통과해야 판정이 나온다:
 *  1. 서로 다른 딜이 MIN_POINTS_FOR_POSITION 개 이상 (중복·seed 제거 후)
 *  2. 통화가 KRW (달러딜과 섞으면 "2.98원" 류가 나온다 — krwPrice 와 같은 이유)
 *
 * confidence 는 막는 조건이 **아니다**. LOW 를 버리면 실측 99.3% 가 사라져
 * 기능 자체가 없는 것과 같아진다. 대신 판정에 실어 보내서 카피가 단정하지 않게 한다.
 */
export const positionFromHistory = (
  price: number,
  history: { points: PricePoint[]; currency: string; confidence: PriceConfidence } | null,
): PricePosition | null => {
  if (history == null || price <= 0) return null;
  if (history.currency !== 'KRW') return null;

  const prices = historyPrices(history.points);
  if (prices.length < MIN_POINTS_FOR_POSITION) return null;

  /*
   * ★가격 폭이 없으면 판정하지 않는다(실측 2026-08-08).
   * "생수" 대표 딜의 과거 4건이 **전부 7,200원**이라 min=max=7,200 이 나왔다.
   * 이때 percentile 은 정의상 0 이고 카드는 "역대 딜 중 싼 편"이라고 단정하지만,
   * 실제로는 값이 한 번도 변한 적이 없어서 싼지 비싼지 말할 근거가 0이다.
   * 막대도 최저=최고라 아무 정보가 없다.
   */
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max <= min) return null;

  const base = computePosition(price, prices);
  return base && { ...base, confidence: history.confidence };
};

/**
 * 검색 결과를 답변 상태로 접는다.
 *
 * 이 함수가 이 앱의 정직성 경계다. 근거가 부족하면 ANSWERED 를 만들지 않는다.
 * 순서가 중요: 오염 → 묶음 → 표본 크기. 오염된 결과를 먼저 걷어내야
 * 묶음 비율과 표본 크기가 의미를 갖는다.
 */
export const gateAnswer = (deals: Deal[], keyword: string): AnswerState => {
  if (deals.length === 0) {
    return { kind: 'REFUSED', reason: { code: 'NO_RESULTS' } };
  }

  const total = deals.length;
  const dirty = (d: Deal) => isPolluted(d.title, keyword) || isAudienceMismatch(d.title, keyword);
  const pollutedTitles = deals.filter(dirty).map((d) => d.title);
  const clean = deals.filter((d) => !dirty(d));

  // 오염이 과반이면 키워드 자체가 다른 물건을 가리키고 있다
  if (pollutedTitles.length > total / 2) {
    return {
      kind: 'PARTIAL',
      deals: clean,
      reason: {
        code: 'KEYWORD_POLLUTION',
        polluted: [...new Set(pollutedTitles)].slice(0, 5),
        total,
      },
    };
  }

  const bundles = clean.filter((d) => isBundle(d.title));
  const single = clean.filter((d) => !isBundle(d.title));

  if (bundles.length > clean.length / 2) {
    return {
      kind: 'PARTIAL',
      deals: single,
      reason: { code: 'MIXED_BUNDLE', bundleCount: bundles.length, total: clean.length },
    };
  }

  // 표본 부족은 마지막에 본다. 오염·묶음이 원인인데 "표본이 적다"고 말하면
  // 유저는 기다리면 쌓일 거라 오해한다 — 실제로는 키워드가 다른 물건을 가리키는 것이다.
  const priced = single.filter((d) => krwPrice(d) != null);
  if (priced.length < MIN_SAMPLE_FOR_QUARTILE) {
    return {
      kind: 'PARTIAL',
      deals: single,
      reason: { code: 'SMALL_SAMPLE', sampleSize: priced.length },
    };
  }

  return { kind: 'ANSWERED', deals: single, position: null };
};
