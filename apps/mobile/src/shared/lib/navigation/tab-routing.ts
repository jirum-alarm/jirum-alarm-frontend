import {tabNavigations} from '@/shared/constant/navigations';

export type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

/**
 * URL 경로를 기반으로 해당하는 탭 이름을 반환합니다.
 * 탭의 기본 경로에 해당하지 않는 하위 페이지는 해당 탭 내에서 push됩니다.
 */
export function getTabNameFromUrl(url: string): TabName {
  const path = extractPath(url);

  if (path === '/' || path === '') {
    return tabNavigations.HOME;
  }
  if (path.startsWith('/trending')) {
    return tabNavigations.DISCOVER;
  }
  if (path.startsWith('/community')) {
    return tabNavigations.COMMUNITY;
  }
  if (path.startsWith('/alarm')) {
    return tabNavigations.ALARM;
  }
  // `/themes` 는 내정보 소속이다 — 구독 테마 목록(`MySubscribedThemes`)·
  // `/mypage/keyword` 에서 들어온다. 분기가 없으면 아래 기본값(HOME)으로
  // 떨어져서 테마를 누르는 순간 내정보 탭 밖으로 튕긴다.
  if (
    path.startsWith('/mypage') ||
    path.startsWith('/like') ||
    path.startsWith('/themes')
  ) {
    return tabNavigations.MYPAGE;
  }
  // 상품 상세, 검색, 추천 등은 홈 탭에서 처리
  if (
    path.startsWith('/products') ||
    path.startsWith('/search') ||
    path.startsWith('/recommend') ||
    path.startsWith('/curation')
  ) {
    return tabNavigations.HOME;
  }

  // 기본적으로 홈 탭
  return tabNavigations.HOME;
}

/**
 * 해당 경로가 탭의 기본(루트) URL인지 확인합니다.
 * 기본 URL이면 탭 전환만 하고, 아니면 탭 내에서 push합니다.
 */
export function isTabRootUrl(url: string): boolean {
  const raw = extractPath(url);
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;

  const tabRootPaths = [
    '/',
    '/trending/ranking',
    '/trending/live',
    '/community',
    '/alarm',
    '/mypage',
  ];

  return tabRootPaths.includes(path);
}

/**
 * 탭 안에서 네이티브 스택으로 push 할 경로인지 판정한다.
 *
 * 같은 WebView 에서 URL 만 바꾸면 이전 화면이 즉시 지워져 흰 화면이 뜬다.
 * 상세처럼 "들어갔다 나오는" 화면은 스택에 올려 네이티브 전환을 태운다.
 * 반환값은 push 에 넘길 경로(쿼리·해시 포함), 아니면 null.
 */
export function getPushablePath(url: string): string | null {
  const path = extractPath(url);

  // 상품 상세만. /products/123/comment 같은 하위도 같은 스택에 쌓는다.
  if (/^\/products\/\d+(\/|$)/.test(path)) {
    return extractPathWithQuery(url);
  }

  return null;
}

/**
 * 각 탭의 기본 URL 경로를 반환합니다.
 */
export function getTabBaseUrl(tabName: TabName): string {
  switch (tabName) {
    case tabNavigations.HOME:
      return '/';
    case tabNavigations.DISCOVER:
      return '/trending/ranking';
    case tabNavigations.COMMUNITY:
      return '/community';
    case tabNavigations.ALARM:
      return '/alarm';
    case tabNavigations.MYPAGE:
      return '/mypage';
    default:
      return '/';
  }
}

/** extractPath 는 쿼리·해시를 버린다. push 경로는 그대로 살려야 한다. */
function extractPathWithQuery(url: string): string {
  if (url.startsWith('http')) {
    const match = url.match(/^https?:\/\/[^/]+(\/.*)?$/);
    return match?.[1] || '/';
  }
  return url.startsWith('/') ? url : `/${url}`;
}

function extractPath(url: string): string {
  try {
    if (url.startsWith('http')) {
      // React Native 환경에서는 URL 생성자가 제한적일 수 있으므로 직접 파싱
      const match = url.match(/^https?:\/\/[^/]+(\/[^?#]*)?/);
      return match?.[1] || '/';
    }
    return url.startsWith('/') ? url : `/${url}`;
  } catch {
    return url;
  }
}
