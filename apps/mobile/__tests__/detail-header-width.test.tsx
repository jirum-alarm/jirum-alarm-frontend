import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
jest.mock('../global.css', () => ({}));
import {DetailHeaderTitle} from '../src/screens/detail/ui/ProductDetailHeader';

it('로고 블록이 헤더 폭을 독점하지 않는다', () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<DetailHeaderTitle onPress={() => {}} />);
  });
  const json: any = tree.toJSON();
  const style = Array.isArray(json.props.style)
    ? Object.assign({}, ...json.props.style)
    : json.props.style;
  // 뒤로가기(~40) + 로고 + 우측액션(72) 이 화면(375~430)에 들어가야 한다
  expect(style.maxWidth).toBeLessThanOrEqual(160);
  expect(style.flexShrink).toBe(1);
});
