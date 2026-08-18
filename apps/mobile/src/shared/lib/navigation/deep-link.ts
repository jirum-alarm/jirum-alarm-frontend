import {SERVICE_URL} from '@/constants/env';

/**
 * 외부에서 들어온 딥링크 URL 을 앱 내부 라우팅이 쓰는 형태로 정규화한다.
 *
 * 들어오는 형태가 세 가지다:
 *   1. jirumalarm://products/123      (커스텀 스킴 — 스킴은 이미 네이티브에 등록돼 있음)
 *   2. https://jirum-alarm.com/products/123  (유니버설 링크/앱 링크)
 *   3. jirumalarm:///products/123     (슬래시 3개 — 일부 클라이언트가 이렇게 만든다)
 *
 * 반환값은 항상 https 절대 URL 이다. 기존 라우팅(getTabNameFromUrl,
 * getPushablePath, 웹뷰 주입)이 전부 절대 URL 또는 '/' 시작 경로를 기대하고,
 * 웹뷰 주입은 절대 URL 이어야 하므로 여기서 한 번에 맞춘다.
 *
 * @returns 우리 서비스 링크가 아니면 null (외부 링크를 앱 안에서 열지 않는다).
 */
export function normalizeDeepLink(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // https/http — 우리 도메인만 통과시킨다.
  if (/^https?:\/\//i.test(trimmed)) {
    const host = trimmed.match(/^https?:\/\/([^/?#]+)/i)?.[1]?.toLowerCase();
    if (!host || !isServiceHost(host)) return null;
    const pathAndRest = trimmed.replace(/^https?:\/\/[^/?#]+/i, '');
    return `${SERVICE_URL}${pathAndRest || '/'}`;
  }

  // 커스텀 스킴 — jirumalarm://<경로> / jirumalarm:///<경로> 모두 받는다.
  const schemeMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):\/\/(.*)$/i);
  if (schemeMatch) {
    const [, scheme, rest] = schemeMatch;
    if (!ALLOWED_SCHEMES.has(scheme.toLowerCase())) return null;

    // 소셜 로그인 콜백(kakao/naver 등)은 각 SDK 가 가져간다. 여기서 삼키면 안 된다.
    if (rest.startsWith('oauth')) return null;

    const path = rest.startsWith('/') ? rest : `/${rest}`;
    return `${SERVICE_URL}${path}`;
  }

  return null;
}

const ALLOWED_SCHEMES = new Set([
  'jirumalarm',
  'com.jirum-alarm.jirumalarm', // iOS Info.plist 에 같이 등록된 번들 ID 스킴
]);

/**
 * 오픈 리다이렉트 방지 — 서브도메인까지 허용하되 접미사 사칭
 * (evil-jirum-alarm.com)은 막는다.
 */
function isServiceHost(host: string): boolean {
  const bare = host.replace(/:\d+$/, '');
  return bare === 'jirum-alarm.com' || bare.endsWith('.jirum-alarm.com');
}
