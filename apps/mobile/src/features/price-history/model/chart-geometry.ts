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

  // Catmull-Rom → 3차 베지어. 제어점을 직접 만든다(라이브러리 curve 아님).
  let d = '';
  if (ordered.length > 0) {
    d = `M ${ordered[0].x} ${ordered[0].y}`;
    for (let i = 0; i < ordered.length - 1; i++) {
      const p0 = ordered[i - 1] ?? ordered[i];
      const p1 = ordered[i];
      const p2 = ordered[i + 1];
      const p3 = ordered[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  const yTicks = 5;
  const tickStep = (yMax - yMin) / (yTicks - 1);
  const ticks = Array.from({length: yTicks}, (_, i) => {
    const t = i / (yTicks - 1);
    return {price: yMax - t * (yMax - yMin), y: pad.top + t * plotH};
  });

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
