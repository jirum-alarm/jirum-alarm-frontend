import {CommonActions} from '@react-navigation/native';
import type {
  NavigationState,
  ParamListBase,
  PartialState,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {tabStackNavigations} from '@/shared/constant/navigations';

/** 한 스택에 살려 두는 상세 수. 넘으면 가장 오래된 상세를 걷는다(쌓인 상세는 쿼리·차트를 쥔 채 마운트돼 있다). */
export const MAX_DETAILS_IN_STACK = 5;

type Route = {key: string; name: string; params?: object};
type StackState = {index: number; routes: Route[]};

export type DetailPushPlan =
  | {kind: 'pop'; count: number}
  | {kind: 'push'; dropKey: string | null};

const pathOf = (route: Route): string | null => {
  const path = (route.params as {path?: unknown} | undefined)?.path;
  return typeof path === 'string' ? path.split(/[?#]/)[0] : null;
};

/**
 * 상세 → 상세(관련·대안·같은 카테고리)로 갈 때 어떻게 쌓을지.
 *
 * - 이미 이 스택에 있는 딜이면 **되돌아간다** — A→B→A 가 A 를 하나 더 만들면 뒤로가 A·B·A 를 오가는 고리가 된다.
 * - 상세가 MAX 개를 넘으면 가장 오래된 상세를 걷어 낸다 — 목록까지 돌아가는 뒤로 횟수와 메모리를 묶는다.
 */
export function planDetailPush(
  state: StackState,
  path: string,
  max = MAX_DETAILS_IN_STACK,
): DetailPushPlan {
  const target = path.split(/[?#]/)[0];
  const visible = state.routes.slice(0, state.index + 1);
  const existing = visible.findIndex(
    r => r.name === tabStackNavigations.DETAIL && pathOf(r) === target,
  );
  if (existing !== -1 && existing < state.index) {
    return {kind: 'pop', count: state.index - existing};
  }
  const details = visible.filter(r => r.name === tabStackNavigations.DETAIL);
  return {
    kind: 'push',
    dropKey: details.length >= max ? details[0].key : null,
  };
}

/** 상세 화면에서 다른 상품 카드를 눌렀을 때. 계획은 planDetailPush. */
export function pushProductDetail(
  navigation: NativeStackNavigationProp<ParamListBase>,
  path: string,
) {
  const state = navigation.getState() as unknown as StackState;
  const plan = planDetailPush(state, path);
  if (plan.kind === 'pop') {
    navigation.pop(plan.count);
    return;
  }
  navigation.push(tabStackNavigations.DETAIL, {path});
  if (plan.dropKey) {
    const dropKey = plan.dropKey;
    // push 가 반영된 상태에서 가장 오래된 상세만 뺀다 — 나머지 라우트 key 는 그대로라 다시 마운트되지 않는다.
    navigation.dispatch(current => {
      const routes = current.routes.filter(r => r.key !== dropKey);
      return CommonActions.reset({
        ...current,
        routes,
        index: routes.length - 1,
      } as unknown as PartialState<NavigationState>);
    });
  }
}
