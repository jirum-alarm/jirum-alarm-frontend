import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
jest.mock('../global.css', () => ({}));
import {DetailHeaderTitle} from '../src/screens/detail/ui/ProductDetailHeader';

it('로고 블록이 헤더 폭을 독점하지 않는다', () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<DetailHeaderTitle onPress={() => {}} />);
  });
  // 레이아웃은 Pressable 안쪽 View 가 든다 — Pressable 의 함수형 style 은 opacity 만
  // (레이아웃까지 넣었더니 NativeWind 가 떨궈 로고 아래로 글자가 쌓였다).
  const json: any = tree.toJSON();
  const inner = json.children[0];
  const style = Array.isArray(inner.props.style)
    ? Object.assign({}, ...inner.props.style)
    : inner.props.style;
  expect(style.flexDirection).toBe('row');
  // 뒤로가기(~40) + 로고 + 우측액션(72) 이 화면(375~430)에 들어가야 한다
  expect(style.maxWidth).toBeLessThanOrEqual(160);
  expect(style.flexShrink).toBe(1);
});
