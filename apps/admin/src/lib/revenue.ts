/** 수익(revenueTrend) 화면 공통 — 어디까지가 아직 덜 찬 값인가 */

import { kstDaysAgo, toKstDateString } from '@/utils/date';

/**
 * 수익이 아직 덜 찬 첫 날(KST 'YYYY-MM-DD') — 이 날부터 오늘까지는 「집계 중」.
 * 토스·알리는 그날, 쿠팡·네이버·애드픽은 다음 날 15시, 애드센스는 다음 날 15:30 에 들어온다.
 * 애드센스가 다음 날 배치의 마지막이라, 어제 애드센스 행이 있으면 어제는 다 찬 것 → 오늘만, 없으면 어제·오늘.
 * rows 는 어제를 포함한 구간이어야 한다.
 */
export const partialRevenueStart = (rows?: readonly { source: string; date: string }[]) => {
  const yesterday = kstDaysAgo(1);
  return rows?.some((r) => r.source === 'adsense' && r.date.slice(0, 10) === yesterday)
    ? toKstDateString()
    : yesterday;
};
