import React, {useEffect, useState} from 'react';
import * as Notifications from 'expo-notifications';

import ConfirmSheet from '@/shared/components/ConfirmSheet';
import {StorageKey} from '@/shared/constant/storage-key';
import {registerFcmToken} from '@/shared/lib/fcm/push-permission';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

// 홈이 먼저 그려지고 숨 돌린 뒤 — 들어오자마자 시트가 덮으면 또 하나의 관문이 된다.
const SHOW_DELAY_MS = 1500;

/**
 * 로그인 뒤 **한 번**, OS 알림 권한 팝업 전에 "왜 필요한지" 를 먼저 보여준다(토스식 사전 안내).
 * OS 팝업은 iOS 에서 한 번 거절하면 다시 못 묻는다 — 맥락 없이 띄우면 그 한 번을 날린다.
 *
 * - 이미 허용·더는 물을 수 없음 → 아무것도 안 한다.
 * - "나중에" → 다시 안 띄운다. 키워드를 등록할 때 requestPushPermissionIfNeeded 가 묻는다.
 */
/**
 * 이번 실행에 사전 안내를 띄울 차례인가. 업데이트 권유 시트도 이걸 본다 — 시트(Modal)가 둘
 * 겹치면 iOS 는 두 번째를 못 띄우므로, 이번 실행엔 이쪽이 먼저고 권유는 다음 실행으로 미룬다.
 * 권한 조회 실패는 false(앱을 막지 않는다 — 키워드 등록 경로가 다시 묻는다).
 */
export async function shouldShowPushPrePrompt(): Promise<boolean> {
  try {
    if (await getAsyncStorage(StorageKey.PUSH_PREPROMPT_SHOWN)) return false;
    const current = await Notifications.getPermissionsAsync();
    return !current.granted && current.canAskAgain;
  } catch {
    return false;
  }
}

export default function PushPermissionPrePrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if ((await shouldShowPushPrePrompt()) && !cancelled) setVisible(true);
    }, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const close = () => {
    setVisible(false);
    setAsyncStorage(StorageKey.PUSH_PREPROMPT_SHOWN, true).catch(() => {});
  };

  const accept = async () => {
    close();
    try {
      const next = await Notifications.requestPermissionsAsync();
      if (next.granted) await registerFcmToken();
    } catch (error) {
      console.log('push pre-prompt error:', error);
    }
  };

  return (
    <ConfirmSheet
      visible={visible}
      title="새 핫딜, 놓치지 않게 알려드릴게요"
      description="관심 키워드의 핫딜이 올라오면 바로 알림을 보내드려요. 알림은 설정에서 언제든 끌 수 있어요."
      cancelLabel="나중에"
      confirmLabel="알림 받기"
      onCancel={close}
      onConfirm={accept}
    />
  );
}
