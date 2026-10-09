export const accessTokenExpiresAt = 1 * 60 * 60 * 1000; // 1hour
export const refreshTokenExpiresAt = 7 * 24 * 60 * 60 * 1000; // 7day

/**
 * 게스트(로그인 없이 키워드 알림만 받는 기기 계정) 쿠키.
 * 리프레시 토큰은 두지 않는다 — 백엔드 guestLogin 이 같은 기기에 늘 같은 게스트를 돌려주므로
 * 액세스 토큰이 만료되면 guestLogin 을 다시 부르면 된다(proxy.ts). IS_GUEST 는 "이 브라우저는 게스트"
 * 표시라 길게 둔다.
 */
export const GUEST_ACCESS_TOKEN = 'GUEST_ACCESS_TOKEN';
export const IS_GUEST = 'IS_GUEST';
export const guestMarkerExpiresAt = 365 * 24 * 60 * 60 * 1000; // 1year

/**
 * 인증 쿠키를 붙일 도메인.
 *
 * 왜 있는가: ai 앱이 **다른 서브도메인**(ai.jirum-alarm.com)이라, Domain 없는
 * host-only 쿠키로는 로그인 상태가 안 넘어간다(실측 2026-08-07: 운영 Set-Cookie 에
 * Domain 속성 없음). 앞의 점은 서브도메인 전체 공유를 뜻한다.
 *
 * ⚠️ **localhost 에는 붙이면 안 된다** — 브라우저가 Domain 불일치로 쿠키를 통째로
 * 거부해서 로컬 로그인이 죽는다. 그래서 운영에서만 값이 있고 개발은 undefined 다.
 *
 * ⚠️ 이 쿠키는 이제 **모든 jirum-alarm.com 서브도메인에 딸려간다.** 새 서브도메인을
 * 붙일 때(외부 도구·실험용 포함) 토큰이 거기까지 간다는 걸 전제로 판단할 것.
 *
 * 쿠키를 심는 곳이 3군데(actions/token.ts, api/graphql/route.ts, proxy.ts)라
 * 상수로 묶는다 — 한 곳만 빠지면 그 경로의 로그인만 조용히 안 넘어간다.
 */
export const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production' ? '.jirum-alarm.com' : undefined;
