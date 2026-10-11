export {};
const {
  buildChartGeometry,
  withAxisBuffer,
  parsePointDateMs,
  monotonePath,
  niceTicks,
  shortWon,
} = require('../src/features/price-history/model/chart-geometry');
// web 원본 — 곡선·눈금은 두 앱이 같은 함수를 따로 들고 있어 출력으로 대조한다.
const webChart = require('../../web/src/features/product-detail/lib/price-chart');

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
  return {yMin, yMax, tickStep: webChart.niceTicks(yMin, yMax).step, coords};
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

describe('곡선·눈금 — web 과 같은 출력', () => {
  const PTS = [
    [
      {x: 0, y: 10},
      {x: 10, y: 10},
      {x: 20, y: 10},
      {x: 30, y: 80},
      {x: 40, y: 80},
    ],
    [
      {x: 0, y: 50},
      {x: 5, y: 20},
      {x: 30, y: 70},
    ],
    [
      {x: 0, y: 1},
      {x: 9, y: 2},
    ],
    [{x: 3, y: 3}],
  ];
  it.each([
    [10000, 500, 11000],
    [10250, 250, 11000],
    [98400, 500, 100000],
    [10600, 5000, 20000],
    [4200, 200, 4800],
  ])('shortWon(%i, step %i, max %i)', (price, step, max) => {
    expect(shortWon(price, null, step, max)).toBe(
      webChart.shortWon(price, null, step, max),
    );
  });

  it.each(PTS.map((p, i) => [i, p]))(
    'monotonePath 케이스 %i',
    (_i, pts: any) => {
      expect(monotonePath(pts)).toBe(webChart.monotonePath(pts));
    },
  );
  it.each([
    [3600, 4900],
    [8806.8, 10592.4],
    [0, 39000],
    [95000, 101000],
    [120, 180],
  ])('niceTicks(%d, %d)', (lo, hi) => {
    expect(niceTicks(lo, hi)).toEqual(webChart.niceTicks(lo, hi));
  });
});
