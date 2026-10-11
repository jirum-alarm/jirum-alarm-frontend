/**
 * 가격 추이 차트의 기하 계산.
 *
 * apps/web 의 PriceHistorySection 에서 그대로 옮겼다 — 렌더러(SVG) 의존이 없는
 * 순수 함수라 웹/앱이 같은 축을 쓴다. 여기 상수를 임의로 바꾸면 같은 상품의
 * 차트가 웹과 다르게 보인다.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_DAYS = 730;
export const DEFAULT_PERIOD_DAYS = 90;
/** 기본 탭의 점이 이보다 적으면 더 긴 기간으로 확장한다. */
export const MIN_DEFAULT_POINTS = 5;
/** X축 좌우 여백 (콘텐츠 구간 대비). 점이 축 끝에 붙지 않게. */
export const X_AXIS_BUFFER_RATIO = 0.08;
/**
 * Y축 최소 스팬 — 가격대의 15%.
 * 실제 변동폭이 이보다 작으면 축을 벌려 9,600→9,800 같은 2% 변동이
 * 폭락처럼 보이지 않게 한다.
 */
export const MIN_Y_SPAN_RATIO = 0.15;

export const PERIODS = [
  {label: '1개월', days: 30},
  {label: '3개월', days: 90},
  {label: '6개월', days: 180},
  {label: '12개월', days: 365},
  {label: '24개월', days: 730},
] as const;

export type ChartPoint = {date: string; price: number};

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** YYYY-MM-DD → 로컬 자정 ms */
export function parsePointDateMs(date: string): number {
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => !Number.isFinite(n))) return NaN;
  return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
}

export function formatAxisDateFromMs(ms: number, withYear = false): string {
  const d = new Date(ms);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return withYear ? `${yy}.${mm}.${dd}` : `${mm}.${dd}`;
}

export function won(price: number, currency?: string | null): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

/**
 * Y축 눈금 라벨.
 * k 표기 여부는 축 최댓값으로 한 번에 정한다 — 한 축에 10.6k 와 9,700 이 섞이지 않게.
 * step 이 1000 미만이면 k 반올림이 같은 라벨을 반복하므로(98k,98k…) 소수 한 자리.
 */
export function shortWon(
  price: number,
  currency?: string | null,
  step?: number,
  axisMax?: number,
): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  // 축 하단 클램프로 생기는 '0k' 방지
  if (price === 0) return '0';
  if ((axisMax ?? price) >= 10000) {
    const k = price / 1000;
    if (step != null && step < 1000) return `${k.toFixed(1)}k`;
    return `${Math.round(k).toLocaleString()}k`;
  }
  return `${Math.round(price).toLocaleString()}`;
}

export function withAxisBuffer(contentStartMs: number, contentEndMs: number) {
  const span = Math.max(contentEndMs - contentStartMs, DAY_MS);
  const buffer = span * X_AXIS_BUFFER_RATIO;
  return {
    axisStartMs: contentStartMs - buffer,
    axisEndMs: contentEndMs + buffer,
  };
}

export function resolveContentRangeMs(nowMs: number, days: number) {
  return {contentStartMs: nowMs - days * DAY_MS, contentEndMs: nowMs};
}

type XY = {x: number; y: number};

/**
 * 점들을 지나는 곡선(SVG path d). monotone 3차 보간(d3 curveMonotoneX 와 같은 방식)이라
 * 이웃한 두 점 사이에서 **두 점 값 밖으로 나가지 않는다** — 평평하다 뚝 떨어진 구간에서 Catmull-Rom 이
 * 4,750원 위로 솟아 "더 비쌌던 날"을 지어내던 것(2026-10-11, 감자면 1개월) 대신.
 * 같은 함수가 apps/web features/product-detail/lib/price-chart.ts 에 있다(chart-parity 테스트가 대조).
 */
export function monotonePath(pts: XY[]): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const slope = (a: XY, b: XY) =>
    b.x - a.x > 0 ? (b.y - a.y) / (b.x - a.x) : 0;
  const s = pts.slice(1).map((p, i) => slope(pts[i], p));
  const t = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const h0 = pts[i].x - pts[i - 1].x;
    const h1 = pts[i + 1].x - pts[i].x;
    const s0 = s[i - 1];
    const s1 = s[i];
    const p = h0 + h1 > 0 ? (s0 * h1 + s1 * h0) / (h0 + h1) : 0;
    t[i] =
      (Math.sign(s0) + Math.sign(s1)) *
        Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  t[0] = n > 2 ? (3 * s[0] - t[1]) / 2 : s[0];
  t[n - 1] = n > 2 ? (3 * s[n - 2] - t[n - 2]) / 2 : s[n - 2];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = (b.x - a.x) / 3;
    d += ` C ${a.x + dx} ${a.y + dx * t[i]}, ${b.x - dx} ${
      b.y - dx * t[i + 1]
    }, ${b.x} ${b.y}`;
  }
  return d;
}

/**
 * Y축 눈금을 떨어지는 값(…100·200·250·500·1000 단위)에 긋는다 — 4,082·4,291 대신 4,200·4,400.
 * **축 범위(yMin~yMax)는 건드리지 않는다**: 범위를 눈금에 맞춰 넓히면 선이 납작해진다(9,600~9,800 에서 40%).
 * 범위 안에 들어가는 눈금이 3~5개가 되는 가장 촘촘한 간격을 고른다.
 * 같은 함수가 apps/web features/product-detail/lib/price-chart.ts 에 있다(chart-parity 테스트가 대조).
 */
export function niceTicks(yMin: number, yMax: number) {
  const range = Math.max(yMax - yMin, 1);
  const k0 = Math.floor(Math.log10(range / 5));
  const round = (v: number) => Math.round(v * 1e6) / 1e6;
  for (let k = k0 - 1; k <= k0 + 2; k++) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * 10 ** k;
      // 2.5원·0.5원 같은 눈금은 원화에 없다.
      if (step < 1 || !Number.isInteger(round(step))) continue;
      const prices: number[] = [];
      for (let v = Math.ceil(yMin / step) * step; v <= yMax + 1e-9; v += step) {
        prices.push(round(v));
      }
      if (prices.length >= 3 && prices.length <= 5) {
        return {step, prices: prices.reverse()};
      }
    }
  }
  const step = range / 4;
  return {step, prices: [0, 1, 2, 3, 4].map(i => yMax - i * step)};
}

export function buildChartGeometry<T extends ChartPoint>(
  points: T[],
  width: number,
  height: number,
  pad: Padding,
  axisStartMs: number,
  axisEndMs: number,
  contentStartMs: number,
  contentEndMs: number,
  extraPrices: number[] = [],
) {
  const prices = [...points.map(p => p.price), ...extraPrices];
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const mid = (minP + maxP) / 2;
  const span = Math.max(maxP - minP, mid * MIN_Y_SPAN_RATIO, 1);
  // 가격은 음수가 될 수 없다. 아래 여백이 0을 파고들어 축에 '-1k' 가 찍히던 것 방지 —
  // 잘린 만큼 위로 넘기지 않고 0에서 멈춘다.
  const yMin = Math.max(0, mid - span / 2 - span * 0.12);
  const yMax = mid + span / 2 + span * 0.12;

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const axisSpanMs = Math.max(axisEndMs - axisStartMs, 1);
  const contentSpanMs = Math.max(contentEndMs - contentStartMs, 1);

  const projectMs = (ms: number, price: number) => {
    const ratio = (ms - axisStartMs) / axisSpanMs;
    const x = pad.left + Math.min(1, Math.max(0, ratio)) * plotW;
    const y = pad.top + (1 - (price - yMin) / (yMax - yMin)) * plotH;
    return {x, y};
  };

  const project = (date: string, price: number) => {
    const t = parsePointDateMs(date);
    return projectMs(Number.isFinite(t) ? t : axisStartMs, price);
  };

  const coords = points.map(p => {
    const {x, y} = project(p.date, p.price);
    return {...p, x, y};
  });

  // points 는 보통 정렬돼 있지만 곡선이 꼬이지 않게 방어한다.
  const ordered = [...coords].sort(
    (a, b) => parsePointDateMs(a.date) - parsePointDateMs(b.date),
  );

  const d = monotonePath(ordered);

  const nice = niceTicks(yMin, yMax);
  const tickStep = nice.step;
  const ticks = nice.prices.map(price => ({
    price,
    y: pad.top + (1 - (price - yMin) / (yMax - yMin)) * plotH,
  }));

  // X축 라벨은 콘텐츠 구간 기준. 오른쪽 끝은 항상 '오늘'.
  const xLabelCount = 4;
  const withYear = contentSpanMs > 370 * DAY_MS;
  const xLabels = Array.from({length: xLabelCount}, (_, i) => {
    const ratio = i / (xLabelCount - 1);
    const ms = contentStartMs + ratio * contentSpanMs;
    return {
      x: pad.left + ((ms - axisStartMs) / axisSpanMs) * plotW,
      label:
        i === xLabelCount - 1 ? '오늘' : formatAxisDateFromMs(ms, withYear),
    };
  });

  return {
    coords: ordered,
    d,
    ticks,
    tickStep,
    yMin,
    yMax,
    xLabels,
    minP,
    maxP,
    pad,
    plotW,
    plotH,
    width,
    height,
    project,
  };
}
