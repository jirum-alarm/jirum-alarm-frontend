// PAGE enum 을 import 하지 않고 리터럴로 둔다 — 이 모듈은 미들웨어(edge)와 단위 테스트가
// 함께 쓰는 순수 로직이고, PAGE 를 끌어오면 테스트가 무관한 모듈 그래프까지 로드해야 한다.
// PAGE.MYPAGE / PAGE.LIKE 와 동일하게 유지할 것.
const protectedPaths = ['/mypage', '/like'];

export const isProtectedPath = (pathname: string): boolean =>
  protectedPaths.some((path) => pathname.startsWith(path));

// 게스트(로그인 없이 키워드 알림만 받는 기기 계정)가 들어갈 수 있는 보호 경로 — 자기 키워드 관리.
const guestPaths = ['/mypage/keyword'];

export const isGuestPath = (pathname: string): boolean =>
  guestPaths.some((path) => pathname.startsWith(path));

export type AuthAction = 'pass' | 'refresh' | 'guest-refresh' | 'redirect';

/**
 * 쿠키 상태만 보고 무엇을 할지 결정한다.
 *
 * ACCESS_TOKEN 쿠키의 expires 는 JWT exp 와 동일(백엔드 1h/7d)하므로, 만료되면 브라우저가
 * 아예 전송하지 않는다. 즉 "쿠키 부재 = 만료"이고, exp 디코드나 me 왕복 검증이 필요 없다.
 *
 * 갱신을 특정 경로로 좁히면(구 mypage/like/trending 화이트리스트) 그 밖으로 진입한 유저는
 * 토큰이 만료된 채 방치되고, SSR 이 401 을 받아 로그인으로 튕긴다 — 1시간마다 로그아웃된 원인.
 * 그래서 경로와 무관하게, 갱신 가능하면 갱신한다.
 */
export const decideAuthAction = ({
  pathname,
  hasAccessToken,
  hasRefreshToken,
  isGuest = false,
  hasGuestAccessToken = false,
}: {
  pathname: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  /** IS_GUEST 쿠키 — 이 브라우저는 게스트 계정을 갖고 있다. */
  isGuest?: boolean;
  hasGuestAccessToken?: boolean;
}): AuthAction => {
  if (hasAccessToken) {
    return 'pass';
  }
  if (hasRefreshToken) {
    return 'refresh';
  }
  if (isProtectedPath(pathname) && !(isGuest && isGuestPath(pathname))) {
    return 'redirect';
  }
  // 게스트 토큰은 1시간짜리라 만료되면 guestLogin 으로 다시 받는다(같은 기기 = 같은 게스트).
  if (isGuest && !hasGuestAccessToken) {
    return 'guest-refresh';
  }
  return 'pass';
};
