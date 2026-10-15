import {planDetailPush} from '../src/shared/lib/navigation/detail-chain';

type Route = {key: string; name: string; params?: object};

const detail = (key: string, id: number): Route => ({
  key,
  name: 'ProductDetail',
  params: {path: `/products/${id}`},
});
const stack = (...routes: Route[]) => ({index: routes.length - 1, routes});
const tabs: Route = {key: 'tabs', name: 'MainTabs'};

describe('상세 → 상세 쌓기', () => {
  it('처음 보는 딜은 그냥 쌓는다', () => {
    expect(planDetailPush(stack(tabs, detail('a', 1)), '/products/2')).toEqual({
      kind: 'push',
      dropKey: null,
    });
  });

  it('A→B→A 는 A 로 되돌아간다 — 뒤로가 A·B·A 고리가 되지 않게', () => {
    expect(
      planDetailPush(
        stack(tabs, detail('a', 1), detail('b', 2)),
        '/products/1?utm=x',
      ),
    ).toEqual({kind: 'pop', count: 1});
  });

  it('지금 보는 딜을 또 누르면(같은 카드) 되돌아갈 곳이 없으니 쌓는다', () => {
    expect(planDetailPush(stack(tabs, detail('a', 1)), '/products/1')).toEqual({
      kind: 'push',
      dropKey: null,
    });
  });

  it('상세가 한도에 닿으면 가장 오래된 상세를 걷는다', () => {
    const s = stack(
      tabs,
      detail('a', 1),
      detail('b', 2),
      detail('c', 3),
      detail('d', 4),
      detail('e', 5),
    );
    expect(planDetailPush(s, '/products/6')).toEqual({
      kind: 'push',
      dropKey: 'a',
    });
  });

  it('상세가 아닌 화면(관련 상품·댓글)은 세지 않는다', () => {
    const s = stack(
      tabs,
      detail('a', 1),
      {key: 'r', name: 'ProductDetail', params: {path: '/products/1/related'}},
      {key: 'c', name: 'ProductComments', params: {productId: 1}},
    );
    expect(planDetailPush(s, '/products/9')).toEqual({
      kind: 'push',
      dropKey: null,
    });
  });
});
