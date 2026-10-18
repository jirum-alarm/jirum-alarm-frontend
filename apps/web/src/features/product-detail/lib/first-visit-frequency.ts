/**
 * 첫 방문 시트 문구 A/B `first_visit_sheet_frequency_v1`(crawling-server experiment-registry, 2026-10-16 준비).
 *
 * control 「이 상품, 또 싸게 뜨면 바로 알려드릴까요?」 대 frequency 「‘키워드’ 핫딜, 지난 90일에 N번 떴어요」.
 * 배정·횟수는 서버(firstVisitSheetCopy, X-Device-Id)가 정한다 — 판독도 서버 해시로 다시 계산한다.
 * 서버 env 가 꺼져 있으면 모두 control. 켜져 있으면 두 군 다 횟수가 오고, 새 문구는 frequency 군·N ≥ MIN 일 때만.
 * 판독은 N ≥ MIN 층끼리 — price_context_impression detail=`first_visit:<시트 종류><층>`(sheetStratumSuffix).
 */
export const FIRST_VISIT_FREQUENCY_MIN_DEALS = 3;

export type FirstVisitSheetCopy = {
  variant: string;
  dealCount: number | null;
  windowDays: number;
  /** 시트가 걸 알림 키워드 — 제목 키워드가 드물면 서버가 브랜드로 넓힌다(first_visit_keyword_fallback_v1, broaden 군만). */
  keyword?: string;
  broadened?: boolean;
  /** 넓히기 A/B 대상 층이면 군(broaden|title), 아니면 null — 배정 기록의 층 표시(keywordArmSuffix)용 */
  keywordArm?: string | null;
};

/** 새 문구를 띄울 횟수 — 띄우지 않으면 null */
export function frequencyToShow(copy: FirstVisitSheetCopy | null): number | null {
  if (copy?.variant !== 'frequency' || copy.dealCount == null) return null;
  return copy.dealCount >= FIRST_VISIT_FREQUENCY_MIN_DEALS ? copy.dealCount : null;
}

export function formatDealCount(count: number): string {
  return count >= 100 ? '100번 넘게' : `${count}번`;
}

/** 배정 기록의 층 표시 — `_freq`(새 문구를 띄움) · `_n3`(control 이지만 N ≥ MIN) · ''(그 밖) */
export function sheetStratumSuffix(copy: FirstVisitSheetCopy | null): '' | '_freq' | '_n3' {
  if (copy?.dealCount == null || copy.dealCount < FIRST_VISIT_FREQUENCY_MIN_DEALS) return '';
  return copy.variant === 'frequency' ? '_freq' : '_n3';
}

/**
 * 넓히기 A/B `first_visit_keyword_fallback_v1` 층 표시 — `_kb`(broaden 군: 브랜드로 넓힌 시트) · `_kt`(title 군: 넓힐 수 있었지만
 * 제목 키워드 그대로) · ''(층 밖). 판독은 두 군의 같은 층끼리 비교한다(crawling-server experiment-registry).
 */
export function keywordArmSuffix(copy: FirstVisitSheetCopy | null): '' | '_kb' | '_kt' {
  if (copy?.keywordArm === 'broaden') return '_kb';
  if (copy?.keywordArm === 'title') return '_kt';
  return '';
}
