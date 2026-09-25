import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';
import {Analytics} from '@/shared/lib/analytics/ga4';

export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

export type PostPurchasePromptKind = 'kakao' | 'keyword';

export type OkachatPlacement = 'soft' | 'after_purchase';

/** web `features/product-detail/lib/okachat.ts` pushOkachatEvent 와 같은 이름·파라미터. */
export function trackOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: OkachatPlacement,
): void {
  Analytics.track(event, {placement});
}

export async function hasJoinedOkachat(): Promise<boolean> {
  try {
    return (await getAsyncStorage(StorageKey.OKACHAT_JOINED)) === true;
  } catch {
    return false;
  }
}

export async function markOkachatJoined(): Promise<void> {
  try {
    await setAsyncStorage(StorageKey.OKACHAT_JOINED, true);
  } catch {
    // ignore
  }
}

/** 앱은 오카방 UTM 딥링크를 거의 안 받으므로 joined 만 본다. */
export function buildPostPurchasePromptQueue(
  isLoggedIn: boolean,
  joined: boolean,
): PostPurchasePromptKind[] {
  if (joined) return ['keyword'];
  if (!isLoggedIn) return ['kakao', 'keyword'];
  return ['keyword', 'kakao'];
}
