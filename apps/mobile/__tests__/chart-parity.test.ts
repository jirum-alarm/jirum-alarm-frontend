export {};
const {
  buildChartGeometry,
  withAxisBuffer,
  parsePointDateMs,
} = require('../src/features/price-history/model/chart-geometry');

const MIN_Y = 0.15;
function webGeo(
  points: any[],
  width: number,
  height: number,
  pad: any,
  as: number,
  ae: number,
) {
  const prices = points.map(p => p.price);
  const minP = Math.min(...prices),
    maxP = Math.max(...prices);
  const mid = (minP + maxP) / 2;
  const span = Math.max(maxP - minP, mid * MIN_Y, 1);
  const yMin = Math.max(0, mid - span / 2 - span * 0.12);
  const yMax = mid + span / 2 + span * 0.12;
  const plotW = width - pad.left - pad.right,
    plotH = height - pad.top - pad.bottom;
  const axisSpan = Math.max(ae - as, 1);
  const pt = (d: string) => {
    const p = d.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]).getTime();
  };
  const coords = points.map(p => {
    const r = (pt(p.date) - as) / axisSpan;
    return {
      price: p.price,
      x: pad.left + Math.min(1, Math.max(0, r)) * plotW,
      y: pad.top + (1 - (p.price - yMin) / (yMax - yMin)) * plotH,
    };
  });
  return {yMin, yMax, tickStep: (yMax - yMin) / 4, coords};
}

const PAD = {top: 40, right: 20, bottom: 28, left: 44};
const CASES = [
  [9600, 9700, 9800],
  [3000, 15000, 32960],
  [1000, 5000, 3000, 8000],
  [10000],
  [500, 520],
];

describe('web 원본과 수치가 같아야 한다', () => {
  it.each(CASES.map((c, i) => [i, c]))('케이스 %i', (_i, prices: any) => {
    const points = prices.map((price: number, i: number) => ({
      date: `2026-03-0${i + 1}`,
      price,
    }));
    const start = parsePointDateMs(points[0].date);
    const end = parsePointDateMs(points.at(-1).date);
    const axis = withAxisBuffer(start, end);
    const mine = buildChartGeometry(
      points,
      640,
      260,
      PAD,
      axis.axisStartMs,
      axis.axisEndMs,
      start,
      end,
    );
    const web = webGeo(points, 640, 260, PAD, axis.axisStartMs, axis.axisEndMs);
    expect(mine.yMin).toBeCloseTo(web.yMin, 6);
    expect(mine.yMax).toBeCloseTo(web.yMax, 6);
    expect(mine.tickStep).toBeCloseTo(web.tickStep, 6);
    mine.coords.forEach((c: any, i: number) => {
      expect(c.x).toBeCloseTo(web.coords[i].x, 6);
      expect(c.y).toBeCloseTo(web.coords[i].y, 6);
    });
  });
});
