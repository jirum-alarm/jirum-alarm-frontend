/**
 * "방금"/"N시간 전"/"어제"/"N일 전"/"N달 전"/"N년 전". 자정 경계는 근사(경과 시간 기준) — 목록 표기엔 충분.
 * 하루 안은 시간으로 — "오늘"만으로는 아침 딜과 방금 딜이 구분되지 않는다.
 * web 모델 페이지·키워드 목록과 앱 키워드 탭이 같은 말을 하도록 여기 둔다(2026-10-20 web model-page-insights 에서 옮김).
 */
export function relativeTimeLabel(at?: string | null, now = Date.now()): string | null {
  if (!at) return null;
  const then = Date.parse(at);
  if (Number.isNaN(then)) return null;
  const hours = Math.floor((now - then) / 3_600_000);
  if (hours < 1) return '방금';
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  if (days < 30) return `${days}일 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
}
