/**
 * 로그인 후 돌아갈 곳(`rtnUrl`)으로 실제 이동시킨다.
 *
 * ★왜 router.replace 를 그대로 쓰면 안 되는가:
 * Next 라우터는 **같은 앱 안의 경로**만 다룬다. `https://ai.jirum-alarm.com/...`
 * 같은 다른 오리진을 넘기면 라우팅이 성립하지 않아 앱 에러("문제가 발생했습니다")가
 * 뜨거나, 아무 일도 없이 그 자리에 남는다(실제 증상 2026-08-08:
 * ai 쪽 로그인 버튼으로 들어와 카카오 로그인 후 에러 화면 + ai 로 복귀 실패).
 * 오리진을 벗어나는 이동은 라우터가 아니라 브라우저가 해야 한다.
 *
 * ⚠️ 오픈 리다이렉트 방지: `rtnUrl` 은 URL 파라미터라 누구나 조작할 수 있다.
 * 허용 목록에 있는 호스트가 아니면 홈으로 떨군다 — 안 그러면 우리 로그인 링크가
 * 피싱 사이트로 보내는 통로가 된다.
 */

/** 우리 서비스로 인정하는 호스트. 서브도메인(ai·dev-ai 등)까지 포함한다. */
const ALLOWED_HOST_SUFFIX = '.jirum-alarm.com';
const ALLOWED_HOSTS = ['jirum-alarm.com', 'localhost'];

const isAllowedHost = (hostname: string) =>
  ALLOWED_HOSTS.includes(hostname) || hostname.endsWith(ALLOWED_HOST_SUFFIX);

/**
 * `rtnUrl` 을 검사해서 어떻게 이동할지 알려준다.
 *
 * - `{ kind: 'internal', path }` — 같은 오리진. 라우터로 이동하면 된다(SPA 전환 유지).
 * - `{ kind: 'external', url }` — 허용된 다른 오리진. `location.assign` 이 필요하다.
 *
 * 판정 불가·허용 목록 밖이면 홈(`internal '/'`)으로 떨어뜨린다.
 */
export type ReturnTarget = { kind: 'internal'; path: string } | { kind: 'external'; url: string };

export const resolveReturnUrl = (raw: string | null | undefined, origin: string): ReturnTarget => {
  const HOME: ReturnTarget = { kind: 'internal', path: '/' };
  if (!raw) return HOME;

  // 이미 디코딩돼 들어오는 경우가 있어 두 번 풀지 않는다(`%25` 가 살아있는 URL 이 깨진다).
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    // 잘못 인코딩된 값이면 원문 그대로 판정한다
  }

  // 상대 경로("/products/1")는 그대로 내부 이동. `//evil.com` 은 프로토콜 상대 URL 이라
  // 브라우저가 외부로 읽으므로 내부로 취급하면 안 된다.
  if (value.startsWith('/') && !value.startsWith('//')) {
    return { kind: 'internal', path: value };
  }

  try {
    const url = new URL(value, origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return HOME;
    if (!isAllowedHost(url.hostname)) return HOME;
    if (url.origin === origin) {
      return { kind: 'internal', path: `${url.pathname}${url.search}${url.hash}` };
    }
    return { kind: 'external', url: url.toString() };
  } catch {
    return HOME;
  }
};
