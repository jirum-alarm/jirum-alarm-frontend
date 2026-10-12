import {Analytics} from '@/shared/lib/analytics/ga4';

// 입장 기록·열기는 홈 배너도 써서 shared 에 둔다.
export {
  OKACHAT_LINK,
  hasJoinedOkachat,
  markOkachatJoined,
  openOkachat,
} from '@/shared/lib/okachat';

export type PostPurchasePromptKind = 'kakao' | 'keyword';

export type OkachatPlacement = 'soft' | 'after_purchase';

/** web `features/product-detail/lib/okachat.ts` pushOkachatEvent 와 같은 이름·파라미터. */
export function trackOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: OkachatPlacement,
): void {
  Analytics.track(event, {placement});
}

/**
 * 앱은 오카방 UTM 딥링크를 거의 안 받으므로 joined 만 본다.
 * 회원·게스트 구분 없이 키워드가 먼저다 — 앱은 푸시가 이미 통로라, 이 상품을 콕 집어 알려 주는
 * 키워드가 전체 딜이 흐르는 방보다 이 순간에 맞다(web 은 푸시 통로가 없는 비로그인이 많아 방이 먼저).
 */
export function buildPostPurchasePromptQueue(
  joined: boolean,
): PostPurchasePromptKind[] {
  if (joined) return ['keyword'];
  return ['keyword', 'kakao'];
}
