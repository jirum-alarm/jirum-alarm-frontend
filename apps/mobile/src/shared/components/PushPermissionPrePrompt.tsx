import React, {useEffect, useState} from 'react';
import * as Notifications from 'expo-notifications';

import {MyPageService} from '@/shared/api/mypage';
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

/**
 * 이미 걸어 둔 키워드가 있으면(대개 웹에서 등록) 그 키워드로 말한다. 웹에서 가입해 키워드를
 * 등록한 56명 중 42명은 받을 통로가 없었다(2026-10-05) — 앱을 깐 이 순간이 그 알림이 처음
 * 도착할 수 있게 되는 순간이라, 일반 문구보다 "그 알림이 이제 여기로 온다"가 이유가 된다.
 */
const copyFor = (keywords: string[]) => {
  if (keywords.length === 0) {
    return {
      title: '새 핫딜, 놓치지 않게 알려드릴게요',
      description:
        '관심 키워드의 핫딜이 올라오면 바로 알림을 보내드려요. 알림은 설정에서 언제든 끌 수 있어요.',
    };
  }
  const rest = keywords.length > 1 ? ` 외 ${keywords.length - 1}개` : '';
  return {
    title: `등록해 둔 ‘${keywords[0]}’${rest} 알림,\n이제 이 폰으로 받아보세요`,
    description:
      '알림만 켜면 핫딜이 올라올 때 바로 알려드려요. 알림은 설정에서 언제든 끌 수 있어요.',
  };
};

export default function PushPermissionPrePrompt() {
  const [visible, setVisible] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!(await shouldShowPushPrePrompt()) || cancelled) return;
      // 키워드 조회가 실패해도 일반 문구로 띄운다 — 안내 자체를 막지 않는다.
      const mine = await MyPageService.getMyKeywords().catch(() => []);
      if (cancelled) return;
      setKeywords(mine.map(k => k.keyword).filter(Boolean));
      setVisible(true);
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

  const {title, description} = copyFor(keywords);

  return (
    <ConfirmSheet
      visible={visible}
      title={title}
      description={description}
      cancelLabel="나중에"
      confirmLabel="알림 받기"
      onCancel={close}
      onConfirm={accept}
    />
  );
}
