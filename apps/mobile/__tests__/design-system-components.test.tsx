/**
 * 디자인 시스템 공용 부품(Badge·Chip·ProductCardStatus·Switch·TabPill·SectionHeader)이 실제로 그려지고, 레시피 클래스를 쓰는지.
 * 화면 렌더 없이 로그인 뒤 화면을 시뮬레이터로 못 볼 때의 최소 안전망.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {Text as RNText} from 'react-native';

jest.mock('../global.css', () => ({}));

import Badge from '../src/shared/components/ui/Badge';
import Chip from '../src/shared/components/ui/Chip';
import ProductCardStatus from '../src/shared/components/product/ProductCardStatus';
import Switch from '../src/shared/components/ui/Switch';
import TabPill from '../src/shared/components/ui/TabPill';
import SectionHeader from '../src/shared/components/ui/SectionHeader';
import Button from '../src/shared/components/ui/Button';
import {ActivityIndicator} from 'react-native';

const {
  badge,
  button,
  chip,
  tab,
  toggle,
  sectionTitle,
} = require('@jirum/design-system/recipes');

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

/** 그 prop 을 가진 첫 노드(바깥 컴포넌트 — onPress 가 달린 쪽). */
const first = (tree: Tree, prop: string, value: unknown) =>
  tree.root.findAll(n => n.props[prop] === value)[0];
const classNames = (tree: Tree): string[] =>
  tree.root
    .findAll(n => typeof n.props.className === 'string')
    .map(n => n.props.className);

describe('Switch', () => {
  it('스위치 역할·켜짐 상태를 알리고, 누르면 반대 값을 넘긴다', () => {
    const onChange = jest.fn();
    const tree = render(
      <Switch
        value={false}
        onChange={onChange}
        accessibilityLabel="키워드 알림"
      />,
    );
    const sw = first(tree, 'accessibilityRole', 'switch');
    expect(sw.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(sw.props.accessibilityLabel).toBe('키워드 알림');
    ReactTestRenderer.act(() => sw.props.onPress());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('트랙(꺼짐 위에 켜짐 면)·노브는 레시피 클래스', () => {
    const tree = render(
      <Switch value onChange={() => {}} accessibilityLabel="야간 알림" />,
    );
    const cls = classNames(tree);
    expect(
      cls.some(c => c.includes(toggle.track) && c.includes(toggle.off)),
    ).toBe(true);
    expect(cls.some(c => c.includes(toggle.on))).toBe(true);
    expect(cls).toContain(toggle.knob);
  });
});

describe('TabPill', () => {
  it('탭 역할·선택 상태, 글자는 레시피(brand 선택)', () => {
    const onPress = jest.fn();
    const tree = render(
      <TabPill
        label="디지털"
        selected
        variant="brand"
        size="md"
        onPress={onPress}
      />,
    );
    const node = first(tree, 'accessibilityRole', 'tab');
    expect(node.props.accessibilityState).toEqual({selected: true});
    expect(tree.root.findByType(RNText).props.className).toBe(
      tab.brand.selected.text,
    );
    expect(classNames(tree).some(c => c.includes(tab.size.md))).toBe(true);
  });
});

describe('SectionHeader', () => {
  it('onPressMore 가 있을 때만 더보기, 이름은 "제목 더보기"', () => {
    expect(texts(render(<SectionHeader title="토스 특가" />))).toEqual([
      '토스 특가',
    ]);
    const onPressMore = jest.fn();
    const tree = render(
      <SectionHeader title="토스 특가" onPressMore={onPressMore} />,
    );
    expect(texts(tree)).toEqual(['토스 특가', '더보기']);
    first(tree, 'accessibilityLabel', '토스 특가 더보기').props.onPress();
    expect(onPressMore).toHaveBeenCalled();
    expect(tree.root.findAllByType(RNText)[0].props.className).toContain(
      sectionTitle.page,
    );
  });
});

describe('Button', () => {
  it('주 버튼은 레시피의 primary 글자, 비활성이면 disabledText 를 더한다', () => {
    const on = render(<Button onPress={() => {}}>알림 받기</Button>);
    expect(on.root.findByType(RNText).props.className).toContain(
      button.tone.primary.text,
    );
    const off = render(
      <Button disabled onPress={() => {}}>
        알림 받기
      </Button>,
    );
    expect(off.root.findByType(RNText).props.className).toContain(
      button.tone.primary.disabledText,
    );
  });

  it('작은 주 버튼(md)은 짙은 판(dark), 보조는 secondary', () => {
    const md = render(
      <Button size="md" onPress={() => {}}>
        키워드 등록
      </Button>,
    );
    expect(md.root.findByType(RNText).props.className).toContain(
      button.tone.dark.text,
    );
    const sub = render(
      <Button color="secondary" onPress={() => {}}>
        취소
      </Button>,
    );
    expect(sub.root.findByType(RNText).props.className).toContain(
      button.tone.secondary.text,
    );
  });

  it('로딩 중엔 글자 대신 스피너, 누를 수 없다', () => {
    const tree = render(
      <Button loading onPress={() => {}}>
        탈퇴
      </Button>,
    );
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(
      first(tree, 'accessibilityRole', 'button').props.accessibilityState,
    ).toEqual({
      disabled: true,
      busy: true,
    });
  });
});
