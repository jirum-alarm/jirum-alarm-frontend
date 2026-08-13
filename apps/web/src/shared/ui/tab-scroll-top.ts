/** 내정보 탭은 짧은 페이지라 빼 둔다. */
export const SCROLL_TOP_TAB_PATHS = [
  '/',
  '/trending/ranking',
  '/trending/live',
  '/community',
  '/alarm',
] as const;

export function isScrollTopTabPath(pathName: string) {
  const path = pathName.length > 1 ? pathName.replace(/\/+$/, '') : pathName;
  return (SCROLL_TOP_TAB_PATHS as readonly string[]).includes(path);
}
