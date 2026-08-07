import {
  type AnswerState,
  type Deal,
  MIN_SAMPLE_FOR_QUARTILE,
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

const percentileOf = (sorted: number[], value: number): number => {
  if (sorted.length <= 1) return 0;
  const below = sorted.filter((p) => p < value).length;
  return below / (sorted.length - 1);
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
  };
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
