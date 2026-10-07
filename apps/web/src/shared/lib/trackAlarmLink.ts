/**
 * 알림·키워드 사이 연결을 눌렀을 때 — GA4 `alarm_link_click`(link, platform). 홈 종·알림 출처 라벨·키워드 화면 링크가
 * 실제로 쓰이는지 보려고 단다(2026-10-07). 앱 `Analytics.track('alarm_link_click')` 과 link 값이 같아야 합산된다.
 * ⚠️ 웹은 GTM 에 `GA4 - alarm_link_click` 태그가 있어야 GA4 로 간다(push 만으론 버려진다).
 */
export type AlarmLink =
  | 'home_bell'
  | 'gnb_bell'
  | 'gnb_menu'
  | 'source_keyword'
  | 'source_theme'
  | 'source_good_deal'
  | 'keyword_inbox'
  | 'keyword_deals';

export function trackAlarmLink(link: AlarmLink) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'alarm_link_click',
    link,
    platform: 'web',
  });
}
