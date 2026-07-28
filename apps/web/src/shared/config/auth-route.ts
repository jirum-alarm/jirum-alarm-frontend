// PAGE enum 을 import 하지 않고 리터럴로 둔다 — 이 모듈은 미들웨어(edge)와 단위 테스트가
// 함께 쓰는 순수 로직이고, PAGE 를 끌어오면 테스트가 무관한 모듈 그래프까지 로드해야 한다.
// PAGE.MYPAGE / PAGE.LIKE 와 동일하게 유지할 것.
const protectedPaths = ['/mypage', '/like'];

export const isProtectedPath = (pathname: string): boolean =>
  protectedPaths.some((path) => pathname.startsWith(path));

export type AuthAction = 'pass' | 'refresh' | 'redirect';

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
}: {
  pathname: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}): AuthAction => {
  if (hasAccessToken) {
    return 'pass';
  }
  if (hasRefreshToken) {
    return 'refresh';
  }
  return isProtectedPath(pathname) ? 'redirect' : 'pass';
};
