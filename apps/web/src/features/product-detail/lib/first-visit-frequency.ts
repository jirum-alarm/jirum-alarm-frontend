/**
 * 첫 방문 시트 문구 A/B `first_visit_sheet_frequency_v1`(crawling-server experiment-registry, 2026-10-16 준비).
 *
 * control 「이 상품, 또 싸게 뜨면 바로 알려드릴까요?」 대 frequency 「‘키워드’ 핫딜, 지난 90일에 N번 떴어요」.
 * 배정·횟수는 서버(firstVisitSheetCopy, X-Device-Id)가 정한다 — 판독도 서버 해시로 다시 계산한다.
 * 서버 env 가 꺼져 있으면 모두 control. 횟수가 적으면(< MIN) frequency 군도 지금 문구다(배정은 그대로).
 * 새 문구를 실제로 띄운 기기는 price_context_impression detail=`first_visit:<시트 종류>_freq`.
 */
export const FIRST_VISIT_FREQUENCY_MIN_DEALS = 3;

export type FirstVisitSheetCopy = { variant: string; dealCount: number | null; windowDays: number };

/** 새 문구를 띄울 횟수 — 띄우지 않으면 null */
export function frequencyToShow(copy: FirstVisitSheetCopy | null): number | null {
  if (copy?.variant !== 'frequency' || copy.dealCount == null) return null;
  return copy.dealCount >= FIRST_VISIT_FREQUENCY_MIN_DEALS ? copy.dealCount : null;
}

export function formatDealCount(count: number): string {
  return count >= 100 ? '100번 넘게' : `${count}번`;
}
