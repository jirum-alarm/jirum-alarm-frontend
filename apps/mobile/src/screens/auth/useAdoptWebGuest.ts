import {useEffect, useRef} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {AuthQueries} from '@/entities/auth';
import {AuthService} from '@/shared/api/auth/auth.service';
import {MyPageService} from '@/shared/api/mypage';
import {showPushPrePromptNow} from '@/shared/components/PushPermissionPrePrompt';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {
  subscribeWebGuestHandoff,
  takePendingWebGuest,
} from '@/shared/lib/auth/web-guest-handoff';
import {getDeviceId, syncDeviceIdFromWeb} from '@/shared/lib/device/device-id';
import {showToast} from '@/shared/lib/feedback';
import {dropAccountQueries} from '@/shared/lib/persistence/query-cache';
import {handleLoginSuccess} from './useSocialLogin/lib';

type AdoptResult =
  | 'adopted'
  | 'same_device'
  | 'skipped_member'
  | 'skipped_has_keywords'
  | 'failed';

/**
 * 웹에서 「앱 열기」로 넘어온 게스트(링크의 gd)를 이 앱의 게스트로 이어받는다 — 웹에서 건 키워드가 앱으로 온다.
 *
 * 이어받지 않는 경우(지금 세션이 우선):
 * - 회원: 회원 세션을 게스트로 바꾸면 안 된다. 웹 게스트 키워드는 그 기기에서 로그인하면 백엔드가 합친다.
 * - 키워드가 있는 앱 게스트: 이미 앱에서 건 알림을 잃게 된다(백엔드에 게스트끼리 합치기는 없다).
 * 그 밖(첫 실행 자동 게스트처럼 빈 게스트·세션 없음)은 기기 id 를 웹 것으로 바꾸고 guestLogin 을 다시 부른다.
 * 같은 기기 id 로 웹 푸시 토큰이 있었다면 앱 토큰이 그 기기 몫을 대신한다(중복 알림이 없어지는 쪽).
 *
 * @param ready 세션 판단이 끝났을 때(스플래시·자동 게스트가 끝난 뒤) true — 그 전엔 맡겨 둔다.
 */
export function useAdoptWebGuest({
  ready,
  isLogin,
  isMember,
}: {
  ready: boolean;
  /** 세션(회원·게스트)이 있다. */
  isLogin: boolean;
  isMember: boolean;
}) {
  const queryClient = useQueryClient();
  const running = useRef(false);
  const state = useRef({ready, isLogin, isMember});
  state.current = {ready, isLogin, isMember};

  useEffect(() => {
    const run = async () => {
      if (!state.current.ready || running.current) return;
      const deviceId = takePendingWebGuest();
      if (!deviceId) return;
      running.current = true;
      try {
        const result = await adopt(deviceId, state.current);
        Analytics.track('web_guest_adopt', {result});
        if (result !== 'adopted') return;
        dropAccountQueries(queryClient);
        await queryClient.refetchQueries({
          queryKey: AuthQueries.keys.loginByRefreshToken(),
        });
        const mine = await MyPageService.getMyKeywords().catch(() => []);
        if (mine.length > 0) {
          const rest = mine.length > 1 ? ` 외 ${mine.length - 1}개` : '';
          showToast.success(
            `웹에서 등록한 ‘${mine[0].keyword}’${rest} 알림을 이어받았어요.`,
          );
          // 키워드가 생긴 지금이 "이제 이 폰으로 받아보세요" 안내의 자리다.
          showPushPrePromptNow();
        }
      } finally {
        running.current = false;
      }
    };

    void run();
    return subscribeWebGuestHandoff(() => void run());
    // ready 가 바뀌면(세션 판단 끝) 맡겨 둔 것을 처리한다.
  }, [ready, queryClient]);
}

async function adopt(
  deviceId: string,
  {isLogin, isMember}: {isLogin: boolean; isMember: boolean},
): Promise<AdoptResult> {
  if (isMember) return 'skipped_member';
  const previous = await getDeviceId();
  if (previous === deviceId) return 'same_device';

  // 빈 게스트인지 — 조회가 실패하면 안전하게 건너뛴다(키워드를 잃을 위험을 지지 않는다).
  if (isLogin) {
    const mine = await MyPageService.getMyKeywords().catch(() => null);
    if (mine === null) return 'failed';
    if (mine.length > 0) return 'skipped_has_keywords';
  }

  await syncDeviceIdFromWeb(deviceId);
  try {
    const data = await AuthService.guestLogin();
    const {accessToken, refreshToken} = data?.guestLogin ?? {};
    if (!accessToken || !refreshToken) throw new Error('empty guest token');
    await handleLoginSuccess(accessToken, refreshToken, {guest: true});
    return 'adopted';
  } catch {
    // 지금 세션(이전 기기 id 의 게스트)과 기기 id 가 어긋나지 않게 되돌린다.
    if (previous) await syncDeviceIdFromWeb(previous);
    return 'failed';
  }
}
