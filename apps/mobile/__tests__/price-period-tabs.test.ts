export {};

const {
  parsePointDateMs,
} = require('../src/features/price-history/model/chart-geometry');

const PERIODS = [
  {label: '1개월', days: 30},
  {label: '3개월', days: 90},
  {label: '6개월', days: 180},
  {label: '12개월', days: 365},
  {label: '24개월', days: 730},
];

/** 화면의 periodStates 와 같은 규칙. */
function buildPeriodStates(dates: string[], nowMs: number) {
  let prevKey = '';
  return PERIODS.map(p => {
    const from = nowMs - p.days * 86_400_000;
    const pts = dates.filter(d => parsePointDateMs(d) >= from);
    const key = pts.join('|');
    const enabled = pts.length >= 2 && key !== prevKey;
    if (enabled) prevKey = key;
    return {label: p.label, days: p.days, enabled, count: pts.length};
  });
}

const day = (offset: number) => {
  const d = new Date(2026, 7, 13);
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

const NOW = new Date(2026, 7, 13).getTime();

/**
 * 1개월을 눌렀더니 섹션이 통째로 사라진 버그의 회귀 테스트.
 * 점이 부족한 기간은 누를 수 없어야 한다 — 누르게 두면 화면이 비어버린다.
 */
describe('가격 추이 기간 탭', () => {
  it('점이 2개 미만인 기간은 비활성', () => {
    // 최근 1개월엔 1건뿐, 그 앞에 여러 건.
    const dates = [day(5), day(100), day(120), day(140)];
    const states = buildPeriodStates(dates, NOW);
    expect(states.find(s => s.days === 30)!.enabled).toBe(false);
    expect(states.find(s => s.days === 180)!.enabled).toBe(true);
  });

  it('앞 기간과 데이터가 같으면 중복이라 비활성', () => {
    // 전부 1개월 안에 있으면 3개월·6개월은 같은 점 집합이다.
    const dates = [day(1), day(2), day(3)];
    const states = buildPeriodStates(dates, NOW);
    expect(states.find(s => s.days === 30)!.enabled).toBe(true);
    expect(states.find(s => s.days === 90)!.enabled).toBe(false);
    expect(states.find(s => s.days === 730)!.enabled).toBe(false);
  });

  it('활성 탭은 항상 점이 2개 이상', () => {
    const dates = [day(2), day(40), day(200), day(400)];
    for (const s of buildPeriodStates(dates, NOW)) {
      if (s.enabled) expect(s.count).toBeGreaterThanOrEqual(2);
    }
  });

  it('점이 아예 없으면 모든 탭이 비활성', () => {
    expect(buildPeriodStates([], NOW).every(s => !s.enabled)).toBe(true);
  });
});
