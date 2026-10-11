/**
 * 가격 추이 차트의 곡선·눈금 — 렌더러 의존 없는 순수 함수(앱과 같은 규칙).
 */

export type XY = { x: number; y: number };

/**
 * 점들을 지나는 곡선(SVG path d). monotone 3차 보간(d3 curveMonotoneX 와 같은 방식)이라
 * 이웃한 두 점 사이에서 **두 점 값 밖으로 나가지 않는다** — 평평하다 뚝 떨어진 구간에서 Catmull-Rom 이
 * 4,750원 위로 솟아 "더 비쌌던 날"을 지어내던 것(2026-10-11, 감자면 1개월) 대신.
 * 같은 함수가 apps/mobile features/price-history/model/chart-geometry.ts 에 있다(앱 chart-parity 테스트가 대조).
 */
export function monotonePath(pts: XY[]): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const slope = (a: XY, b: XY) => (b.x - a.x > 0 ? (b.y - a.y) / (b.x - a.x) : 0);
  const s = pts.slice(1).map((p, i) => slope(pts[i], p));
  const t = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const h0 = pts[i].x - pts[i - 1].x;
    const h1 = pts[i + 1].x - pts[i].x;
    const s0 = s[i - 1];
    const s1 = s[i];
    const p = h0 + h1 > 0 ? (s0 * h1 + s1 * h0) / (h0 + h1) : 0;
    t[i] =
      (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) ||
      0;
  }
  t[0] = n > 2 ? (3 * s[0] - t[1]) / 2 : s[0];
  t[n - 1] = n > 2 ? (3 * s[n - 2] - t[n - 2]) / 2 : s[n - 2];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = (b.x - a.x) / 3;
    d += ` C ${a.x + dx} ${a.y + dx * t[i]}, ${b.x - dx} ${b.y - dx * t[i + 1]}, ${b.x} ${b.y}`;
  }
  return d;
}

/**
 * Y축 눈금을 떨어지는 값(…100·200·250·500·1000 단위)에 긋는다 — 4,082·4,291 대신 4,200·4,400.
 * **축 범위(yMin~yMax)는 건드리지 않는다**: 범위를 눈금에 맞춰 넓히면 선이 납작해진다(9,600~9,800 에서 40%).
 * 범위 안에 들어가는 눈금이 3~5개가 되는 가장 촘촘한 간격을 고른다.
 * 같은 함수가 apps/mobile features/price-history/model/chart-geometry.ts 에 있다(앱 chart-parity 테스트가 대조).
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
        return { step, prices: prices.reverse() };
      }
    }
  }
  const step = range / 4;
  return { step, prices: [0, 1, 2, 3, 4].map((i) => yMax - i * step) };
}

/**
 * 눈금 간격(step)이 1000원 미만일 때 k 뒤에 붙일 소수 자리 — 눈금이 step 의 배수라 그만큼이면 값이 정확하고,
 * 남는 0 은 Number() 가 떼어 10.0k 대신 10k(2026-10-12). 250원 간격의 10,250 이 10.3k 로 반올림되던 것도 함께.
 */
const kDecimals = (step: number) =>
  !Number.isInteger(step) || step % 100 === 0 ? 1 : step % 10 === 0 ? 2 : 3;

/**
 * Y축 눈금 라벨.
 * - k 표기 여부는 축 최댓값(axisMax)으로 한 번에 결정 — 한 축에 10.6k와 9,700이 섞이지 않게.
 * - step(눈금 간격)이 1000원 미만이면 k 반올림이 같은 라벨을 반복하므로(98k,98k…) 소수를 붙인다(kDecimals).
 * 같은 함수가 apps/mobile features/price-history/model/chart-geometry.ts 에 있다(앱 chart-parity 테스트가 대조).
 */
export function shortWon(
  price: number,
  currency?: string | null,
  step?: number,
  axisMax?: number,
): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  // 0은 'k'를 붙이지 않는다 (축 하단 클램프로 생기는 '0k' 방지)
  if (price === 0) return '0';
  if ((axisMax ?? price) >= 10000) {
    const k = price / 1000;
    if (step != null && step < 1000)
      return `${Number(k.toFixed(kDecimals(step))).toLocaleString()}k`;
    return `${Math.round(k).toLocaleString()}k`;
  }
  return `${Math.round(price).toLocaleString()}`;
}
