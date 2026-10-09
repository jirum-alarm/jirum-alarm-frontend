/**
 * curl / Cookie 헤더 원문 → 네이버 브랜드커넥트 Cookie 헤더. 서버는 이 문자열을 Cookie 헤더로 그대로 쓴다.
 * 로그인 쿠키(NID_AUT·NID_SES)가 둘 다 없으면 undefined — 비로그인 쿠키를 저장하면 발급이 조용히 0건이 된다.
 */
export const parseNaverBcCookie = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const cookie =
    trimmed.match(/-(?:b|-cookie)\s+'([^']*)'/)?.[1] ??
    trimmed.match(/-(?:b|-cookie)\s+"([^"]*)"/)?.[1] ??
    trimmed.match(/-H\s+'[Cc]ookie:\s*([^']*)'/)?.[1] ??
    trimmed.match(/-H\s+"[Cc]ookie:\s*([^"]*)"/)?.[1] ??
    trimmed.replace(/^[Cc]ookie:\s*/, '');
  return /(?:^|[;\s])NID_AUT=/.test(cookie) && /(?:^|[;\s])NID_SES=/.test(cookie)
    ? cookie.trim()
    : undefined;
};

export const naverBcCookieSummary = (cookie: string): string =>
  `NID_AUT·NID_SES 포함 ${cookie.length}자`;
