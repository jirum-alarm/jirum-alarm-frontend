import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import * as Updates from 'expo-updates';

import {captureSilentFailure} from '@/shared/lib/monitoring/sentry';
import {navigationRef} from '@/shared/lib/navigation/navigation-ref';

/**
 * 이만큼 백그라운드에 있다 돌아오면 "새 세션"으로 본다 — 받아둔 OTA 를 적용해도
 * 보던 화면을 잃는 손해가 작다.
 * ponytail: 고정 30분. 이탈 신호(리로드 직후 이탈률)가 보이면 늘린다.
 */
export const RELOAD_AFTER_BACKGROUND_MS = 30 * 60 * 1000;

/**
 * 복귀 직후 이만큼 기다렸다 판정한다 — 푸시·링크를 눌러 돌아온 거면 그 사이 화면이 열려(isAtTabRoot=false)
 * 다시 불러오기가 그 화면을 지우지 않는다.
 */
export const RESUME_SETTLE_MS = 1500;

export type ResumeAction = 'reload' | 'check';

/**
 * 포그라운드 복귀 때 할 일. 받아둔 업데이트가 있고 충분히 오래 떠나 있었고 **탭 첫 화면에 있으면** 적용,
 * 아니면 새 업데이트를 확인해 받아만 둔다(다음 복귀·콜드 스타트에 적용된다).
 *
 * 탭 첫 화면 조건(2026-10-16): 쇼핑앱에서 결제하고 30분 넘어 돌아온 사람이 보던 딜·구매 뒤 안내를 잃고
 * 홈에 떨어졌다(화면 상태는 저장하지 않는다). 상세·구매 화면 위에 있으면 다음 기회로 미룬다.
 */
export function decideOnResume(
  awayMs: number,
  isUpdatePending: boolean,
  isAtTabRoot = true,
): ResumeAction {
  return isUpdatePending && isAtTabRoot && awayMs >= RELOAD_AFTER_BACKGROUND_MS
    ? 'reload'
    : 'check';
}

/** 루트 스택에 탭(또는 로그인 첫 화면) 하나만 있나 — 그 위에 상세·구매·검색 등이 없으면 잃을 게 적다. */
function isRootStackIdle(): boolean {
  if (!navigationRef.isReady()) return true;
  const state = navigationRef.getRootState?.() as
    | {routes?: unknown[]}
    | undefined;
  return (state?.routes?.length ?? 1) <= 1;
}

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * OTA 를 콜드 스타트 밖에서도 받게 한다.
 *
 * 설정이 CHECK_ON_LAUNCH=ALWAYS + LAUNCH_WAIT_MS=0 이라, 업데이트는 콜드 스타트에
 * 받아서 **그 다음** 콜드 스타트에 적용된다. 앱을 백그라운드에 둔 채 며칠씩 쓰는
 * 유저는 콜드 스타트 자체가 드물어 수정본이 한참 늦게 닿는다. 복귀 시점에 확인·적용한다.
 *
 * 실패는 삼킨다 — 업데이트 확인이 앱 사용을 막으면 안 된다.
 */
export default function useOtaUpdateOnResume(): void {
  const {isUpdatePending} = Updates.useUpdates();
  const pendingRef = useRef(isUpdatePending);
  pendingRef.current = isUpdatePending;

  useEffect(() => {
    // dev 빌드·Expo Go 에선 expo-updates 가 꺼져 있어 호출이 던진다.
    if (__DEV__ || !Updates.isEnabled) return;

    let backgroundedAt: number | null = null;
    const subscription = AppState.addEventListener('change', async state => {
      if (state === 'background') {
        backgroundedAt = Date.now();
        return;
      }
      if (state !== 'active' || backgroundedAt === null) return;

      const awayMs = Date.now() - backgroundedAt;
      backgroundedAt = null;
      try {
        if (decideOnResume(awayMs, pendingRef.current) === 'reload') {
          await sleep(RESUME_SETTLE_MS);
          if (
            decideOnResume(awayMs, pendingRef.current, isRootStackIdle()) ===
            'reload'
          ) {
            await Updates.reloadAsync();
            return;
          }
        }
        const {isAvailable} = await Updates.checkForUpdateAsync();
        if (isAvailable) await Updates.fetchUpdateAsync();
      } catch (error) {
        console.log('ota resume check error:', error);
        captureSilentFailure('ota_check', error);
      }
    });
    return () => subscription.remove();
  }, []);
}
