import {
  getAsyncStorage,
  removeAsyncStorage,
  setAsyncStorage,
} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';

/**
 * 로그인이 필요해서 중단된 동작을 기억했다가, 로그인하고 돌아오면 이어서 실행한다.
 * web 의 sessionStorage pending-action 과 같은 역할. 앱은 로그인 시 네비게이터가
 * 통째로 바뀌므로 AsyncStorage 에 둔다.
 */
export const PendingActionType = {
  NOTIFICATION_KEYWORD_ADD: 'notification-keyword-add',
  WISHLIST_ADD: 'wishlist-add',
  PRODUCT_LIKE: 'product-like',
  PRODUCT_REPORT: 'product-report',
} as const;

const MAX_AGE_MS = 10 * 60 * 1000;

export type PendingAction = {
  type: string;
  payload?: unknown;
  /** 로그인 후 돌아갈 경로. 예: /products/123 */
  returnPath?: string;
  savedAt: number;
};

export async function savePendingAction(
  type: string,
  payload?: unknown,
  returnPath?: string,
) {
  try {
    const action: PendingAction = {
      type,
      payload,
      returnPath,
      savedAt: Date.now(),
    };
    await setAsyncStorage(StorageKey.PENDING_LOGIN_ACTION, action);
  } catch {
    // 이어하기는 부가 기능이라 실패해도 로그인 자체를 막지 않는다.
  }
}

export async function peekPendingAction(): Promise<PendingAction | null> {
  try {
    const action = (await getAsyncStorage(
      StorageKey.PENDING_LOGIN_ACTION,
    )) as PendingAction | null;
    if (!action?.type) return null;
    if (Date.now() - action.savedAt > MAX_AGE_MS) {
      await removeAsyncStorage(StorageKey.PENDING_LOGIN_ACTION);
      return null;
    }
    return action;
  } catch {
    return null;
  }
}

/**
 * 저장된 의도를 꺼내면서 지운다(한 번만 실행되도록).
 * type 을 주면 그 종류만 꺼내고, 다르면 저장을 그대로 둔다 —
 * 상세에 훅이 여러 개라 먼저 달린 쪽이 남의 의도를 삼키지 않게.
 */
export async function takePendingAction(
  type?: string,
): Promise<PendingAction | null> {
  const action = await peekPendingAction();
  if (!action) return null;
  if (type && action.type !== type) return null;
  try {
    await removeAsyncStorage(StorageKey.PENDING_LOGIN_ACTION);
  } catch {
    // noop
  }
  return action;
}
