// 상세 진입 직전 화면 — 구매 클릭이 어느 노출(홈·검색·카톡·구글…)에서 왔는지 가르는 용도.
// 클릭 이벤트의 source 는 클릭이 난 상세 화면이라 이걸 못 담는다(2026-10-05).

let prevPath: string | null = null;
let currentPath: string | null = null;

/** 클라이언트 라우팅마다 호출(EntryTracker). 같은 경로 재호출은 무시. */
export function recordPathname(path: string) {
  if (path === currentPath) return;
  prevPath = currentPath;
  currentPath = path;
}

/**
 * 앱 안 이동이면 `path:/이전경로`, 세션 첫 페이지면 외부 유입(`utm:카톡` > `ref:google.com` > `direct`).
 * 전체 새로고침으로 이동하면 메모리가 비므로 우리 도메인 referrer 를 이전 경로로 본다.
 */
export function resolveEntry(input: {
  prevPath: string | null;
  search: string;
  referrer: string;
  ownHost: string;
}): string {
  if (input.prevPath) return `path:${input.prevPath}`;
  const utm = new URLSearchParams(input.search).get('utm_source');
  if (utm) return `utm:${utm}`;
  try {
    const ref = new URL(input.referrer);
    return ref.hostname === input.ownHost ? `path:${ref.pathname}` : `ref:${ref.hostname}`;
  } catch {
    return 'direct';
  }
}

export function getEntry(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return resolveEntry({
    prevPath,
    search: window.location.search,
    referrer: document.referrer,
    ownHost: window.location.hostname,
  });
}
