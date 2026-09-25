import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import * as Updates from 'expo-updates';

/**
 * 이만큼 백그라운드에 있다 돌아오면 "새 세션"으로 본다 — 받아둔 OTA 를 적용해도
 * 보던 화면을 잃는 손해가 작다.
 * ponytail: 고정 30분. 이탈 신호(리로드 직후 이탈률)가 보이면 늘린다.
 */
export const RELOAD_AFTER_BACKGROUND_MS = 30 * 60 * 1000;

export type ResumeAction = 'reload' | 'check';

/**
 * 포그라운드 복귀 때 할 일. 받아둔 업데이트가 있고 충분히 오래 떠나 있었으면 적용,
 * 아니면 새 업데이트를 확인해 받아만 둔다(다음 복귀·콜드 스타트에 적용된다).
 */
export function decideOnResume(
  awayMs: number,
  isUpdatePending: boolean,
): ResumeAction {
  return isUpdatePending && awayMs >= RELOAD_AFTER_BACKGROUND_MS
    ? 'reload'
    : 'check';
}

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
          await Updates.reloadAsync();
          return;
        }
        const {isAvailable} = await Updates.checkForUpdateAsync();
        if (isAvailable) await Updates.fetchUpdateAsync();
      } catch (error) {
        console.log('ota resume check error:', error);
      }
    });
    return () => subscription.remove();
  }, []);
}
