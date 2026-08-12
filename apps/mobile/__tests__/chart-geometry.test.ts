export {};

const {
  buildChartGeometry,
  shortWon,
  withAxisBuffer,
  parsePointDateMs,
} = require('../src/features/price-history/model/chart-geometry');

const PAD = {top: 40, right: 20, bottom: 28, left: 44};
const W = 640;
const H = 260;

const day = (n: number) => `2026-03-${String(n).padStart(2, '0')}`;

function geo(prices: number[]) {
  const points = prices.map((price, i) => ({date: day(i + 1), price}));
  const start = parsePointDateMs(day(1));
  const end = parsePointDateMs(day(prices.length));
  const axis = withAxisBuffer(start, end);
  return buildChartGeometry(
    points,
    W,
    H,
    PAD,
    axis.axisStartMs,
    axis.axisEndMs,
    start,
    end,
  );
}

describe('Y축 스팬 규칙 — web 과 같아야 한다', () => {
  // 9,600→9,800 같은 2% 변동이 화면 전체를 쓰며 폭락처럼 보이던 것 방지.
  it('변동폭이 작으면 축을 최소 15% 로 벌린다', () => {
    const g = geo([9600, 9700, 9800]);
    const span = g.yMax - g.yMin;
    const mid = (9600 + 9800) / 2;
    // 실제 변동폭 200 이 아니라 mid*0.15 = 1440 기준으로 벌어져야 한다.
    expect(span).toBeGreaterThan(1440);
    expect(span).toBeLessThan(mid * 0.15 * 1.5);
  });

  // 변동폭이 큰 상품에서 아래 여백이 0을 파고들어 '-1k' 가 찍히던 회귀.
  it('축 하단이 음수로 내려가지 않는다', () => {
    const g = geo([3000, 15000, 32960]);
    expect(g.yMin).toBeGreaterThanOrEqual(0);
  });

  it('점이 하나여도 죽지 않는다', () => {
    const g = geo([10000]);
    expect(g.yMax).toBeGreaterThan(g.yMin);
    expect(g.coords).toHaveLength(1);
  });
});

describe('좌표 투영', () => {
  it('모든 점이 플롯 영역 안에 있다', () => {
    const g = geo([1000, 5000, 3000, 8000]);
    for (const c of g.coords) {
      expect(c.x).toBeGreaterThanOrEqual(PAD.left);
      expect(c.x).toBeLessThanOrEqual(W - PAD.right);
      expect(c.y).toBeGreaterThanOrEqual(PAD.top);
      expect(c.y).toBeLessThanOrEqual(H - PAD.bottom);
    }
  });

  it('낮은 가격일수록 y 가 크다(화면 아래)', () => {
    const g = geo([1000, 9000]);
    expect(g.coords[0].y).toBeGreaterThan(g.coords[1].y);
  });

  it('입력이 뒤섞여 있어도 시간순으로 정렬한다', () => {
    const points = [
      {date: day(3), price: 300},
      {date: day(1), price: 100},
      {date: day(2), price: 200},
    ];
    const start = parsePointDateMs(day(1));
    const end = parsePointDateMs(day(3));
    const axis = withAxisBuffer(start, end);
    const g = buildChartGeometry(
      points,
      W,
      H,
      PAD,
      axis.axisStartMs,
      axis.axisEndMs,
      start,
      end,
    );
    expect(g.coords.map((c: {price: number}) => c.price)).toEqual([
      100, 200, 300,
    ]);
  });

  it('X축 마지막 라벨은 항상 "오늘"', () => {
    const g = geo([100, 200, 300]);
    expect(g.xLabels.at(-1).label).toBe('오늘');
    expect(g.xLabels).toHaveLength(4);
  });
});

describe('shortWon — 한 축에 표기가 섞이면 안 된다', () => {
  it('축 최댓값이 1만 이상이면 k 표기', () => {
    expect(shortWon(10600, null, 5000, 20000)).toBe('11k');
    // 같은 축의 작은 값도 k 로 — 10.6k 와 9,700 이 섞이지 않게.
    expect(shortWon(9700, null, 5000, 20000)).toBe('10k');
  });

  it('눈금 간격이 1000 미만이면 소수 한 자리', () => {
    expect(shortWon(98400, null, 500, 100000)).toBe('98.4k');
  });

  it('0 은 k 를 붙이지 않는다', () => {
    expect(shortWon(0, null, 5000, 20000)).toBe('0');
  });

  it('USD 는 달러 표기', () => {
    expect(shortWon(25, 'USD')).toBe('$25');
  });
});
