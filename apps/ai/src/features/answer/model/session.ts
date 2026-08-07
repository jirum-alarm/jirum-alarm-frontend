import { cookies } from 'next/headers';

import type { Tier } from './quota.ts';

/**
 * 로그인 판정. **서버에서만** 돈다(쿠키가 httpOnly 라 클라이언트는 못 읽는다).
 *
 * 어떻게 되는가: web(jirum-alarm.com)이 심는 ACCESS_TOKEN 이 `Domain=.jirum-alarm.com`
 * 이라 ai.jirum-alarm.com 에도 딸려온다(web shared/config/token.ts AUTH_COOKIE_DOMAIN).
 * 그 토큰을 백엔드 `me` 쿼리에 그대로 넘겨 유효한지 물어본다.
 *
 * ⚠️ 쿠키 **존재만으로 로그인 판정을 하지 않는다.** 만료된 토큰도 쿠키에는 남아 있어서
 * (expires 가 JWT exp 와 같긴 하지만 시계 차이·수동 조작이 있다) 존재만 보면 만료 유저를
 * 로그인으로 오인한다. 백엔드에 물어본 결과만 믿는다.
 *
 * ai 는 토큰을 **갱신하지 않는다** — 갱신은 web 의 middleware 소관이고, 여기서 같이
 * 굴리면 두 앱이 같은 refresh 토큰을 두고 경쟁한다. 만료면 그냥 비로그인으로 떨어뜨리고
 * 로그인 링크를 web 으로 보낸다.
 */

const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://jirum-alarm.com/api/graphql';

const ME_QUERY = `query AiMe { me { id } }`;

export type Session = { tier: Tier; userId: string | null };

const ANON: Session = { tier: 'anon', userId: null };

export const getSession = async (): Promise<Session> => {
  const token = (await cookies()).get('ACCESS_TOKEN')?.value;
  if (!token) return ANON;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: ME_QUERY }),
      cache: 'no-store',
    });

    if (!res.ok) return ANON;

    const json = (await res.json()) as { data?: { me?: { id?: string | null } | null } };
    const id = json.data?.me?.id;
    // 유료 판정은 아직 없다 — 결제가 붙으면 여기서 플랜을 읽는다
    return id ? { tier: 'member', userId: String(id) } : ANON;
  } catch (e) {
    // 백엔드가 죽었다고 로그인 유저를 익명으로 떨어뜨리면 쿼터가 3회로 줄어든다.
    // 다만 여기서 member 로 쳐주면 익명이 우회로를 얻는다 — 안전한 쪽(익명)으로 둔다.
    console.error('[ai] me query failed:', e);
    return ANON;
  }
};
