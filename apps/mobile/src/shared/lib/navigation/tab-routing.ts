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
  if (path.startsWith('/mypage') || path.startsWith('/like')) {
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
  const path = extractPath(url);

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
