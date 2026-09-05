'use client';

import { useHydrateAtoms } from 'jotai/utils';

import { deviceAtom, isDeviceResolvedAtom } from '@/shared/hooks/useDevice';
import { isAuthResolvedAtom, isLoggedInAtom } from '@/shared/hooks/useIsLoggedIn';

import type { CheckDeviceResult } from '@/app/actions/agent.types';

/**
 * 서버가 이미 아는 사실(UA 로 판정한 device, 쿠키로 판정한 로그인 여부)을
 * 클라이언트 atom 의 초깃값으로 심는다.
 *
 * 이게 없으면 useDevice/useIsLoggedIn 이 하이드레이션 후 useEffect 로 같은 값을
 * 다시 계산하고, 그 사이 한 프레임 동안 소비자 19곳이 전부 오답(앱인데 웹 네비,
 * 로그인했는데 로그아웃 UI)을 그린다. 첫 페인트 깜빡임의 구조적 원인이었다.
 *
 * useHydrateAtoms 는 Provider 스코프당 한 번만 먹으므로, 라우트 이동으로 값이
 * 바뀌는 경우는 각 훅이 알아서 갱신한다(로그인/로그아웃 등).
 */
export default function ServerStateProvider({
  device,
  isLoggedIn,
  children,
}: {
  device: CheckDeviceResult;
  isLoggedIn: boolean;
  children: React.ReactNode;
}) {
  useHydrateAtoms([
    [deviceAtom, device],
    [isDeviceResolvedAtom, true],
    [isLoggedInAtom, isLoggedIn],
    [isAuthResolvedAtom, true],
  ] as const);

  return <>{children}</>;
}
