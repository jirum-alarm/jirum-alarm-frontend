/**
 * 홈 '사용자'의 비교 구간 — 늘었나 줄었나를 같은 길이·다 찬 날끼리 비교한다.
 * 오늘은 아직 덜 찬 날이라 넣으면 직전 구간보다 늘 적어 보인다(오늘 숫자는 '오늘' 타일에 있다).
 * 날짜는 전부 KST 'YYYY-MM-DD'.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

export const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

const daysInclusive = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS) + 1;

/** [from, to] 를 하루씩 — 0 인 날도 막대 자리를 남긴다 */
export const daysBetween = (from: string, to: string) => {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
};

export type Window = { from: string; to: string };
export type PeriodWindows = { current: Window | null; previous: Window | null };

export const PERIODS = [
  { value: 'last7', label: '지난 7일' },
  { value: 'month', label: '이번 달' },
  { value: 'last30', label: '지난 30일' },
] as const;
export type Period = (typeof PERIODS)[number]['value'];

/**
 * 지난 N일 = 어제까지 N일. 이번 달 = 1일~어제(1일엔 다 찬 날이 없어 current=null).
 * 직전 = 바로 앞 같은 날 수 — 이번 달도 «지난달 1일부터»가 아니라 같은 길이로(지난달이 짧으면 길이가 어긋난다).
 */
export const periodWindows = (period: Period, today: string): PeriodWindows => {
  const to = addDays(today, -1);
  const from =
    period === 'month'
      ? `${today.slice(0, 8)}01`
      : addDays(to, -((period === 'last7' ? 7 : 30) - 1));
  if (to < from) return { current: null, previous: null };
  const n = daysInclusive(from, to);
  return { current: { from, to }, previous: { from: addDays(from, -n), to: addDays(from, -1) } };
};

/** 모든 기간의 직전 구간까지 한 번에 받는 조회 시작일 */
export const fetchStart = (today: string) =>
  (['last7', 'month', 'last30'] as const)
    .map((p) => periodWindows(p, today).previous?.from)
    .filter((d): d is string => !!d)
    .sort()[0] ?? addDays(today, -60);

export const inWindow = (date: string, w: Window | null) => !!w && date >= w.from && date <= w.to;

/**
 * 스냅숏 비교 기준 — target 날짜 줄이 있으면 그것, 없으면(쌓이기 시작한 지 얼마 안 됨) target 뒤 가장 이른 줄.
 * target 이후 줄이 하나도 없으면 null.
 */
export const pickBase = <T extends { date: string }>(rows: T[], target: string, before: string) =>
  rows.find((r) => r.date === target) ??
  rows
    .filter((r) => r.date > target && r.date < before)
    .sort((a, b) => (a.date < b.date ? -1 : 1))[0] ??
  null;
