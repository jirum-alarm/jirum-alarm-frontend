import { PAGE } from './page';

/**
 * 바텀네비(웹)·네이티브 탭바(앱)가 뜨는 탭 루트 경로.
 *
 * ⚠️ 앱의 `apps/mobile/src/shared/lib/navigation/tab-routing.ts` 의 `tabRootPaths` 와 짝.
 * 한쪽만 고치면 같은 화면이 웹에선 네비가 나오고 앱에선 안 나오는 식으로 갈린다.
 */
export const TAB_ROOT_PATHS: string[] = [
  PAGE.HOME,
  PAGE.TRENDING_RANKING,
  PAGE.TRENDING_LIVE,
  PAGE.COMMUNITY,
  PAGE.ALARM,
  PAGE.MYPAGE,
];

export function isTabRootPath(pathName: string) {
  // 트레일링 슬래시 정규화('/mypage/' 도 루트). '/' 자체는 그대로 둔다.
  const path = pathName.length > 1 ? pathName.replace(/\/+$/, '') : pathName;
  return TAB_ROOT_PATHS.includes(path);
}
