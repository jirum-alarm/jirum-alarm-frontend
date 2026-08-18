import {StackActions} from '@react-navigation/native';

export type TabPressNavigation = {
  getState: () => {
    index: number;
    routes: {name: string; state?: {key?: string; index?: number}}[];
  };
  dispatch: (
    action: ReturnType<typeof StackActions.popToTop> & {target?: string},
  ) => void;
};

/**
 * 다른 탭에서 이 탭으로 넘어올 때 그 탭 스택을 루트로 되돌린다.
 *
 * 탭마다 자기 스택이 있어서, 홈에서 상세를 열어둔 채 다른 탭에 갔다 오면
 * 상세가 그대로 남는다("홈을 눌렀는데 상세가 열려 있다"). 웹뷰 탭은
 * handleNavigateToRoot 가 URL 을 되돌리지만 네이티브 스택은 별개다.
 */
export function popTabStackToRoot(
  navigation: TabPressNavigation,
  tabName: string,
): void {
  const nested = navigation
    .getState()
    .routes.find(route => route.name === tabName)?.state;
  if (!nested?.key || (nested.index ?? 0) === 0) return;
  navigation.dispatch({...StackActions.popToTop(), target: nested.key});
}
