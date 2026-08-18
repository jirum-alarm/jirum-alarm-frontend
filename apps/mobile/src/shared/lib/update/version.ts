/**
 * semver 앞 3자리(major.minor.patch)만 비교한다.
 *
 * 문자열 비교로 하면 '1.10.0' < '1.9.0' 이 되어 최신 버전 유저를 스토어로
 * 보내버린다. 자릿수 비교가 필요한 이유가 이것뿐이라 라이브러리는 안 쓴다.
 *
 * @returns a < b 면 음수, 같으면 0, a > b 면 양수.
 */
export function compareVersion(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);

  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/** current 가 min 보다 낮으면 true(=업데이트 강제 대상). */
export function isBelowMinimum(current: string, min: string): boolean {
  if (!current || !min) return false; // 값이 없으면 막지 않는다 — 오탐이 더 위험하다.
  return compareVersion(current, min) < 0;
}

function parseVersion(v: string): [number, number, number] {
  // '1.4.2-beta.1' 같은 프리릴리스 꼬리표는 버린다.
  const core = String(v).trim().split(/[-+]/)[0];
  const parts = core.split('.').map(n => {
    const parsed = Number.parseInt(n, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}
