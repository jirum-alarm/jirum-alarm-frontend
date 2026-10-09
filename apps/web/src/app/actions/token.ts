'use server';

import { cookies, headers } from 'next/headers';

import {
  accessTokenExpiresAt,
  AUTH_COOKIE_DOMAIN,
  GUEST_ACCESS_TOKEN,
  guestMarkerExpiresAt,
  IS_GUEST,
  refreshTokenExpiresAt,
} from '@/shared/config/token';

/** 인증 쿠키 공통 속성. domain 을 여기서만 정해 세 경로가 갈라지지 않게 한다. */
const cookieOptions = (ms: number) => ({
  expires: new Date(Date.now() + ms),
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  domain: AUTH_COOKIE_DOMAIN,
});

async function setAccessToken(token: string) {
  const store = await cookies();
  store.set('ACCESS_TOKEN', token, cookieOptions(accessTokenExpiresAt));
  // 실제 로그인하면 게스트는 끝이다. 게스트의 키워드는 백엔드가 로그인 때 기기 기준으로 이 계정에 합친다.
  store.delete({ name: GUEST_ACCESS_TOKEN, domain: AUTH_COOKIE_DOMAIN });
  store.delete({ name: IS_GUEST, domain: AUTH_COOKIE_DOMAIN });
}

/**
 * 게스트 세션 시작(guestLogin 응답). IS_GUEST 값은 게스트를 만든 기기 id — 미들웨어가 토큰 만료 때
 * 이 id 로 guestLogin 을 다시 불러 같은 게스트를 받는다(기기 id 쿠키와 localStorage 가 어긋나도 안전).
 */
async function setGuestSession(accessToken: string, deviceId: string) {
  const store = await cookies();
  store.set(GUEST_ACCESS_TOKEN, accessToken, cookieOptions(accessTokenExpiresAt));
  store.set(IS_GUEST, deviceId, cookieOptions(guestMarkerExpiresAt));
}

async function getIsGuest() {
  return Boolean((await cookies()).get(IS_GUEST)?.value);
}

async function setRefreshToken(token: string) {
  (await cookies()).set('REFRESH_TOKEN', token, cookieOptions(refreshTokenExpiresAt));
}

async function setDistinctId(id: string | null) {
  (await cookies()).set('DISTINCT_ID', id ?? '', cookieOptions(refreshTokenExpiresAt));
}
async function setFcmToken(token?: string) {
  (await cookies()).set('FCM_TOKEN', token ?? '', cookieOptions(refreshTokenExpiresAt));
}

async function getAccessToken() {
  return (await cookies()).get('ACCESS_TOKEN')?.value;
}

async function getHeaderAuth() {
  return (await headers()).get('authorization');
}

async function getDistinctId() {
  return (await cookies()).get('DISTINCT_ID')?.value ?? null;
}

async function getFcmToken() {
  return (await cookies()).get('FCM_TOKEN')?.value ?? null;
}

// ⚠️ delete 도 domain 이 일치해야 지워진다. 안 맞추면 로그아웃이 조용히 실패한다
// (브라우저는 name+domain+path 가 같은 쿠키만 지운다).
async function removeAccessToken() {
  (await cookies()).delete({ name: 'ACCESS_TOKEN', domain: AUTH_COOKIE_DOMAIN });
}

async function getRefreshToken() {
  return (await cookies()).get('REFRESH_TOKEN')?.value;
}

async function removeRefreshToken() {
  (await cookies()).delete({ name: 'REFRESH_TOKEN', domain: AUTH_COOKIE_DOMAIN });
}

export {
  getAccessToken,
  getDistinctId,
  getFcmToken,
  getHeaderAuth,
  getIsGuest,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setDistinctId,
  setFcmToken,
  setGuestSession,
  setRefreshToken,
};
