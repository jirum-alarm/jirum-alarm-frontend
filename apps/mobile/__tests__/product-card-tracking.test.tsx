/**
 * 카드 onPress → GA4 `product_card_click` 이 web 규격(source·product_id·rank)대로 나간다.
 *
 * web 은 GTM 이 카드의 data-* 속성을 읽어 보내므로(entities/product-list/model/
 * card-tracking.ts) 앱은 같은 이름·파라미터를 직접 보내야 GA4 에서 합쳐진다.
 * firebase analytics 는 `__mocks__/@react-native-firebase/analytics.js` 자동 mock.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.mock('../global.css', () => ({}));

import DynamicProductList from '../src/entities/home/ui/DynamicProductList';
import {GridCard} from '../src/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '../src/entities/home/model/types';

const {__mockFns} = require('@react-native-firebase/analytics') as {
  __mockFns: {logEvent: jest.Mock};
};

const product: ProductCardType = {
  id: '28351243',
  title: '추적 테스트 상품',
  price: '10,000원',
  thumbnail: null,
  mallName: 'ssg',
  categoryId: 8,
  hotDealType: null,
  isEnd: false,
  isHot: false,
  provider: {nameKr: '맘이베베'},
  postedAt: '2026-08-15T10:43:12.000Z',
} as ProductCardType;

function pressCard(
  tree: ReactTestRenderer.ReactTestRenderer,
  title: string,
): void {
  const target = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === title &&
      typeof n.props.onPress === 'function',
  )[0];
  ReactTestRenderer.act(() => {
    target.props.onPress({});
  });
}

function mount(
  element: React.ReactElement,
): ReactTestRenderer.ReactTestRenderer {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  return tree;
}

describe('product_card_click', () => {
  beforeEach(() => __mockFns.logEvent.mockClear());

  it('source·rank 가 있으면 web 과 같은 파라미터로 보낸다(product_id 는 문자열)', () => {
    const onPress = jest.fn();
    const tree = mount(
      <GridCard
        product={product}
        rank={3}
        onPress={onPress}
        trackingSource="ranking_tab"
      />,
    );
    pressCard(tree, product.title);

    expect(__mockFns.logEvent).toHaveBeenCalledWith('product_card_click', {
      source: 'ranking_tab',
      product_id: '28351243',
      rank: 3,
    });
    // 추적이 원래 동작(상세 이동)을 대신하지 않는다.
    expect(onPress).toHaveBeenCalledWith(28351243);
  });

  it('source 가 없으면 보내지 않는다(web 도 source 없는 목록은 안 보낸다)', () => {
    const tree = mount(<GridCard product={product} onPress={() => {}} />);
    pressCard(tree, product.title);
    expect(__mockFns.logEvent).not.toHaveBeenCalled();
  });

  it.each(['GRID', 'HORIZONTAL_SCROLL', 'DOUBLE_ROW', 'LIST'])(
    '홈 SDUI %s 는 home_promotion 으로, rank 없이 보낸다',
    type => {
      const tree = mount(
        <DynamicProductList
          type={type as never}
          products={[product]}
          onPressProduct={() => {}}
        />,
      );
      pressCard(tree, product.title);
      expect(__mockFns.logEvent).toHaveBeenCalledWith('product_card_click', {
        source: 'home_promotion',
        product_id: '28351243',
      });
    },
  );
});
