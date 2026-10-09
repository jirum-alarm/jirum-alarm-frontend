import {useSyncExternalStore} from 'react';

import {StorageKey} from '@/shared/constant/storage-key';
import {
  getAsyncStorage,
  removeAsyncStorage,
  setAsyncStorage,
} from '@/shared/lib/persistence';

/**
 * 게스트 — 로그인 없이 키워드 알림만 받는 기기 계정(백엔드 guestLogin, Role.GUEST).
 *
 * 세션(토큰)은 일반 로그인과 똑같이 저장해 RootNavigator 가 메인을 그리게 하고, 회원만 되는 일
 * (댓글·찜·내 정보)은 이 값으로 가른다. 그 기기에서 실제 로그인하면 백엔드가 키워드·관심사·푸시
 * 토큰을 계정으로 합친다(X-Device-Id 기준).
 */
let guest = false;
let read = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function readOnce() {
  if (read) return;
  read = true;
  getAsyncStorage(StorageKey.IS_GUEST)
    .then(value => {
      if (value === '1' && !guest) {
        guest = true;
        emit();
      }
    })
    .catch(() => {});
}

export async function setGuest(next: boolean) {
  read = true;
  if (guest !== next) {
    guest = next;
    emit();
  }
  if (next) await setAsyncStorage(StorageKey.IS_GUEST, '1');
  else await removeAsyncStorage(StorageKey.IS_GUEST);
}

export function useIsGuest(): boolean {
  readOnce();
  return useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => guest,
  );
}

/** 테스트용 — 모듈 상태를 처음으로 되돌린다. */
export function __resetGuestForTest() {
  guest = false;
  read = false;
}
