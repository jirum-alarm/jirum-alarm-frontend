/**
 * 알림을 눌러 상세에 들어온 사람에게 «왜 이 딜이 왔는지» 한 줄. 알림이 가리키는 URL 의 utm 에 이미 실려 있다
 * (crawling-server 가 이렇게 싣는다 — 2026-10-19 확인):
 * - 키워드: `utm_source=notification&utm_medium=keyword&utm_campaign=keyword_alert|keyword_hot&utm_content=<키워드>[&utm_term=price_drop]`
 *   (notification-message.service sendNotification)
 * - 관심사: `utm_medium=theme&utm_campaign=theme_digest&utm_content=<themeId>` (notification-theme.service)
 * - 좋은 딜: `utm_medium=push&utm_campaign=good_deal` (good-deal-push-batch)
 * 키워드 확인 알림(keyword_confirm)·카톡 링크는 이유를 달지 않는다.
 *
 * 이유 한 줄은 그 알림을 고치는 화면(키워드 설정·관심사·알림 설정)으로 잇는다 — 알림함 출처 라벨(web
 * features/alarm/lib/notificationSource·앱 screens/alarm/lib/notification-source)과 같은 목적지·같은 말.
 */

export type AlertReason =
  | { kind: 'keyword'; keyword: string; hot: boolean; priceDrop: boolean }
  | { kind: 'theme'; themeId: string }
  | { kind: 'good_deal' };

type Query = { get(name: string): string | null };

export function parseAlertReason(query: Query | string | null | undefined): AlertReason | null {
  if (query == null) return null;
  const q: Query =
    typeof query === 'string'
      ? new URLSearchParams(query.includes('?') ? query.slice(query.indexOf('?') + 1) : query)
      : query;
  if (q.get('utm_source') !== 'notification') return null;
  const medium = q.get('utm_medium');
  const campaign = q.get('utm_campaign');
  const content = q.get('utm_content')?.trim();
  if (medium === 'keyword' && content && campaign !== 'keyword_confirm') {
    return {
      kind: 'keyword',
      keyword: content,
      hot: campaign === 'keyword_hot',
      priceDrop: q.get('utm_term') === 'price_drop',
    };
  }
  if (medium === 'theme' && content && /^\d+$/.test(content)) {
    return { kind: 'theme', themeId: content };
  }
  if (campaign === 'good_deal') return { kind: 'good_deal' };
  return null;
}

/** 「'에어팟' 키워드 알림으로 왔어요 · 가격이 내려서」 + 고치는 화면으로 가는 링크 문구. 관심사 이름을 모르면 null. */
export function describeAlertReason(
  reason: AlertReason,
  themes: readonly { id: string | number; name: string }[] = [],
): { text: string; action: string } | null {
  if (reason.kind === 'keyword') {
    const why = reason.priceDrop ? ' · 최근보다 싸게 떠서' : reason.hot ? ' · 핫딜이 돼서' : '';
    return { text: `'${reason.keyword}' 키워드 알림으로 왔어요${why}`, action: '알림 설정' };
  }
  if (reason.kind === 'theme') {
    const theme = themes.find((t) => String(t.id) === reason.themeId);
    return theme ? { text: `「${theme.name}」 관심사 알림으로 왔어요`, action: '관심사 보기' } : null;
  }
  return { text: '지금 뜨는 좋은 딜 알림으로 왔어요', action: '알림 설정' };
}
