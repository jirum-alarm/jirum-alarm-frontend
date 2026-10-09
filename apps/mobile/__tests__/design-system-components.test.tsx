/**
 * 디자인 시스템 공용 부품(Badge·Chip·ProductCardStatus)이 실제로 그려지고, 레시피 클래스를 쓰는지.
 * 화면 렌더 없이 로그인 뒤 화면을 시뮬레이터로 못 볼 때의 최소 안전망.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {Text as RNText} from 'react-native';

jest.mock('../global.css', () => ({}));

import Badge from '../src/shared/components/ui/Badge';
import Chip from '../src/shared/components/ui/Chip';
import ProductCardStatus from '../src/shared/components/product/ProductCardStatus';

const {badge, chip} = require('@jirum/design-system/recipes');

type Tree = ReactTestRenderer.ReactTestRenderer;
const render = (el: React.ReactElement): Tree => {
  let tree!: Tree;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(el);
  });
  return tree;
};
const texts = (tree: Tree): string[] =>
  tree.root
    .findAllByType(RNText)
    .map(n => [n.props.children].flat().join(''))
    .filter(Boolean);

describe('Badge', () => {
  it('글자는 Text 에, 레시피의 크기·색 클래스로', () => {
    const tree = render(
      <Badge size="xs" tone="success">
        지금 추천
      </Badge>,
    );
    const text = tree.root.findByType(RNText);
    expect(text.props.className).toContain(badge.size.xs.text);
    expect(text.props.className).toContain(badge.variant.soft.success.text);
    expect(text.props.numberOfLines).toBe(1);
  });
});

describe('Chip', () => {
  it('글자는 한 번만 읽히고(굵은 사본은 접근성에서 숨김), 고르면 레시피의 선택 색', () => {
    const onPress = jest.fn();
    const tree = render(<Chip label="전체" selected onPress={onPress} />);
    const all = tree.root.findAllByType(RNText);
    expect(all).toHaveLength(2);
    const hidden = all.filter(n => n.props.accessibilityElementsHidden);
    expect(hidden).toHaveLength(1);
    const visible = all.find(n => !n.props.accessibilityElementsHidden)!;
    expect(visible.props.className).toContain(chip.selected.text);
  });
});

describe('ProductCardStatus', () => {
  it('판매종료면 모서리 라벨만', () => {
    const tree = render(
      <ProductCardStatus product={{isEnd: true, hotDealType: 'HOT_DEAL'}} />,
    );
    expect(texts(tree)).toEqual(['판매종료']);
  });

  it('유통기한 띠가 있으면 핫딜 배지는 숨긴다(web 과 같은 규칙)', () => {
    const tree = render(
      <ProductCardStatus
        product={{
          isEnd: false,
          hotDealType: 'HOT_DEAL',
          earliestExpiryDate: '2026-01-05T00:00:00',
        }}
      />,
    );
    expect(texts(tree)).toEqual(['유통기한 01.05']);
  });
});
