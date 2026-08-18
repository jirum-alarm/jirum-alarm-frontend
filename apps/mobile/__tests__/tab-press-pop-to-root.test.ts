/**
 * 다른 탭으로 전환할 때 그 탭 스택을 루트로 되돌리는지.
 * (홈에서 상세를 열고 다른 탭에 갔다 홈을 누르면 상세가 남아 있던 버그)
 */
import {popTabStackToRoot} from '@/navigations/tab/tab-press';

function nav(routes: {name: string; state?: {key?: string; index?: number}}[]) {
  const dispatched: unknown[] = [];
  return {
    navigation: {
      getState: () => ({index: 0, routes}),
      dispatch: (action: unknown) => dispatched.push(action),
    },
    dispatched,
  };
}

describe('popTabStackToRoot', () => {
  it('상세가 쌓인 탭이면 popToTop 을 그 스택에 보낸다', () => {
    const {navigation, dispatched} = nav([
      {name: 'HomeTab', state: {key: 'stack-home', index: 1}},
    ]);
    popTabStackToRoot(navigation, 'HomeTab');
    expect(dispatched).toEqual([
      expect.objectContaining({type: 'POP_TO_TOP', target: 'stack-home'}),
    ]);
  });

  it('루트만 있으면 아무것도 안 한다', () => {
    const {navigation, dispatched} = nav([
      {name: 'HomeTab', state: {key: 'stack-home', index: 0}},
    ]);
    popTabStackToRoot(navigation, 'HomeTab');
    expect(dispatched).toHaveLength(0);
  });

  it('아직 마운트 안 된(lazy) 탭이면 아무것도 안 한다', () => {
    const {navigation, dispatched} = nav([{name: 'HomeTab'}]);
    popTabStackToRoot(navigation, 'HomeTab');
    expect(dispatched).toHaveLength(0);
  });
});
