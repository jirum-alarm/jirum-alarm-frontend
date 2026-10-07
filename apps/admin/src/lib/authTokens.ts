// 서버 액션(token.ts)과 미들웨어(edge)가 같이 쓴다 — next/headers 를 import 하지 않는다
import { baseUrl } from '@/constants/endpoint';

type Tokens = { accessToken: string; refreshToken?: string | null };
type CookieOpts = { expires: number; httpOnly: true; secure: boolean; sameSite: 'lax'; path: '/' };

/** JWT exp(ms). 쿠키 수명을 토큰 수명에 맞춘다 — "쿠키 없음 = 만료"로 읽을 수 있게 */
const expOf = (jwt: string) => {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).exp * 1000;
  } catch {
    return Date.now() + 60 * 60 * 1000;
  }
};

const opts = (expires: number): CookieOpts => ({
  expires,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

/** refreshToken 이 없는 응답(서버가 회전 발급을 안 한 경우)엔 기존 refresh 쿠키를 건드리지 않는다 */
export const TOKEN_COOKIES = ({ accessToken, refreshToken }: Tokens) =>
  [
    // 만료 1분 전에 쿠키를 먼저 지운다 — 막 만료된 토큰을 실어 보내 FORBIDDEN 을 받는 경계를 피한다
    ['accessToken', accessToken, opts(expOf(accessToken) - 60_000)] as const,
    ...(refreshToken ? [['refreshToken', refreshToken, opts(expOf(refreshToken))] as const] : []),
  ] as const;

/**
 * refresh 토큰으로 새 토큰을 받는다. 거절(토큰 무효·만료)이면 null,
 * 네트워크·5xx 는 throw — 서버가 잠깐 흔들린 걸로 로그아웃시키지 않기 위해 둘을 가른다.
 */
export const refreshTokens = async (refreshToken: string): Promise<Tokens | null> => {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${refreshToken}` },
    body: JSON.stringify({
      query: 'mutation { loginByRefreshToken { accessToken refreshToken } }',
    }),
    cache: 'no-store',
  });
  if (res.status >= 500) throw new Error(`refresh ${res.status}`);
  const json = (await res.json().catch(() => null)) as {
    data?: { loginByRefreshToken?: Tokens } | null;
  } | null;
  return json?.data?.loginByRefreshToken?.accessToken ? json.data.loginByRefreshToken : null;
};
