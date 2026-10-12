/**
 * access token(JWT)이 아직 쓸 만한가 — 콜드 스타트에 첫 토큰 갱신을 기다릴지 가른다.
 *
 * 서버(JwtStrategy)는 서명·만료만 본다(세션 저장 없음, 1시간 토큰). 그래서 저장된 access 가
 * 아직 안 끝났으면 갱신 응답을 기다릴 이유가 없다 — 한 시간 안에 다시 켠 사람(알림을 연달아 누르는 경우)은
 * 홈·상세 요청이 갱신 왕복만큼 늦게 나가던 걸 건너뛴다. 끝났거나 못 읽으면 예전처럼 기다린다.
 *
 * atob 에 기대지 않는다 — 옛 runtime(1.4.8) Hermes 에도 그대로 돌아야 한다.
 */
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/* eslint-disable no-bitwise -- base64 는 6비트 묶음을 8비트로 다시 쪼개는 일이라 비트 연산이 곧 정의다 */
function decodeBase64Url(input: string): string {
  const s = input.replace(/-/g, '+').replace(/_/g, '/');
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const ch of s) {
    const v = B64.indexOf(ch);
    if (v < 0) continue; // 패딩·잡문자
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return out;
}
/* eslint-enable no-bitwise */

/** 만료까지 남은 ms. 못 읽으면 0(= 기다린다). */
export function accessTokenRemainingMs(
  token: string,
  now = Date.now(),
): number {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1] ?? ''));
    const exp = typeof payload?.exp === 'number' ? payload.exp * 1000 : 0;
    return Math.max(0, exp - now);
  } catch {
    return 0;
  }
}

// 기기 시계가 조금 틀려도 서버에선 이미 만료일 수 있다 — 1분은 남아야 그대로 쓴다.
// 그래도 401 이 오면 http-client 가 갱신을 기다렸다가 한 번 다시 보낸다.
const MIN_REMAINING_MS = 60_000;

export const isAccessTokenUsable = (token: string | null, now = Date.now()) =>
  !!token && accessTokenRemainingMs(token, now) > MIN_REMAINING_MS;
