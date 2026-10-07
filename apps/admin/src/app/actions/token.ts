'use server';

import { cookies } from 'next/headers';

import { refreshTokens, TOKEN_COOKIES } from '@/lib/authTokens';

async function setTokens(tokens: { accessToken: string; refreshToken?: string | null }) {
  const jar = await cookies();
  for (const [name, value, opts] of TOKEN_COOKIES(tokens)) jar.set(name, value, opts);
}

/** 로그인 직후 — refreshToken 까지 심어야 1시간 뒤에도 로그인이 이어진다 */
async function setAccessToken(accessToken: string, refreshToken?: string | null) {
  await setTokens({ accessToken, refreshToken });
}

/** access 쿠키가 만료돼 사라졌으면 refresh 쿠키로 새로 받아 온다(창을 오래 열어 둔 경우) */
async function getAccessToken() {
  const jar = await cookies();
  const access = jar.get('accessToken')?.value;
  if (access) return access;
  return renewAccessToken();
}

/** 서버가 토큰을 거절했을 때(FORBIDDEN) — 쿠키가 남아 있어도 refresh 로 새로 받는다 */
async function renewAccessToken() {
  const refresh = (await cookies()).get('refreshToken')?.value;
  if (!refresh) return undefined;
  const tokens = await refreshTokens(refresh);
  if (!tokens) return undefined;
  await setTokens(tokens);
  return tokens.accessToken;
}

async function deleteAccessToken() {
  const jar = await cookies();
  jar.delete('accessToken');
  jar.delete('refreshToken');
}

export { deleteAccessToken, getAccessToken, renewAccessToken, setAccessToken };
