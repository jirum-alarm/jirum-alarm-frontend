/**
 * 브라우저가 지금 지름알림 도메인 위에 있는가. import 없이 자족(테스트가 맨 node 로 돈다).
 *
 * 이 앱의 쓰기 요청(노출 기록·기기 등록)은 basePath 밖의 루트 `/api/graphql`(본 서비스 web 의 프록시 — 쿠키로
 * 로그인·토큰 갱신까지 맡는다)로 보낸다. 로컬(localhost)에선 next.config.ts rewrites 가 그 경로를 운영으로
 * 넘기므로, 로컬 확인 중 운영 DB 에 노출이 쌓이지 않게 여기서 막는다.
 */
export function isServiceHostname(hostname: string): boolean {
  return hostname === 'jirum-alarm.com' || hostname.endsWith('.jirum-alarm.com');
}

/** 운영(apex)만 — GTM(GA4) 은 web 도 운영 빌드에서만 붙는다(IS_PRD). 스테이징·로컬 페이지뷰가 GA4 에 섞이지 않게. */
export function isProductionHostname(hostname: string): boolean {
  return hostname === 'jirum-alarm.com';
}

export const canWrite = () =>
  typeof window !== 'undefined' && isServiceHostname(window.location.hostname);
