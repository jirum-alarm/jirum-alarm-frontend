import { env } from 'next-runtime-env';

import { isJirumAlarmAppUA, isKakaoInAppUA } from '@/shared/config/user-agent';

import { kakaoBridgeApplies } from './kakao-bridge';

/** 이 브라우저에서 카톡 다리를 쓸지 — 규칙은 kakao-bridge.ts, 스위치는 런타임 env NEXT_PUBLIC_KAKAO_BRIDGE(off 면 끔). */
export const shouldUseKakaoBridge = (ua: string): boolean =>
  kakaoBridgeApplies({
    kakaoInApp: isKakaoInAppUA(ua),
    jirumApp: isJirumAlarmAppUA(ua),
    on: env('NEXT_PUBLIC_KAKAO_BRIDGE')?.trim() !== 'off',
  });
