/**
 * 검색 화면의 표시 컴포넌트를 실제로 렌더한다.
 *
 * 소스텍스트 검사는 "그 낱말이 있다"만 본다 — 눌렀을 때 무엇이 불리는지,
 * 어떤 게 화면에 실제로 그려지는지는 못 본다(html-string-presence-is-not-visibility).
 * 특히 최근 검색어 칩은 **칩 누름(검색)과 X 누름(삭제)이 겹치기 쉬운 자리**라
 * 눌러서 확인한다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import RecentKeywords from '../src/screens/search/ui/RecentKeywords';
import RecommendedKeywords, {
  RECOMMENDED_KEYWORDS,
} from '../src/screens/search/ui/RecommendedKeywords';
import SearchHeader from '../src/screens/search/ui/SearchHeader';
import SuggestionList from '../src/screens/search/ui/SuggestionList';

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  return tree;
}

/** 접근성 라벨로 누를 수 있는 요소를 찾는다(테스트가 구조에 의존하지 않게). */
function pressable(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  const found = tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props?.accessibilityLabel === label,
  );
  expect(found.length).toBeGreaterThan(0);
  return found[0];
}

function textsOf(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const n = node as {children?: unknown} | null;
    if (n && typeof n === 'object' && n.children) walk(n.children);
  };
  walk(tree.toJSON());
  return out;
}

describe('최근 검색어', () => {
  const noop = () => {};

  it('목록이 비면 섹션째 그리지 않는다(web 과 같다)', () => {
    const tree = render(
      <RecentKeywords
        keywords={[]}
        onSelect={noop}
        onRemove={noop}
        onClearAll={noop}
      />,
    );
    expect(tree.toJSON()).toBeNull();
  });

  it('검색어마다 칩이 그려진다', () => {
    const tree = render(
      <RecentKeywords
        keywords={['모니터', '라면']}
        onSelect={noop}
        onRemove={noop}
        onClearAll={noop}
      />,
    );
    const texts = textsOf(tree);
    expect(texts).toContain('모니터');
    expect(texts).toContain('라면');
    expect(texts).toContain('최근 검색어');
  });

  it('칩을 누르면 그 검색어로 검색한다', () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    const tree = render(
      <RecentKeywords
        keywords={['모니터']}
        onSelect={onSelect}
        onRemove={onRemove}
        onClearAll={noop}
      />,
    );
    ReactTestRenderer.act(() => {
      pressable(tree, '모니터').props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('모니터');
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('★X 를 누르면 삭제만 된다 — 지우려다 검색되면 안 된다', () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    const tree = render(
      <RecentKeywords
        keywords={['모니터']}
        onSelect={onSelect}
        onRemove={onRemove}
        onClearAll={noop}
      />,
    );
    ReactTestRenderer.act(() => {
      pressable(tree, '모니터 삭제').props.onPress();
    });
    expect(onRemove).toHaveBeenCalledWith('모니터');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('전체 삭제 버튼이 있다(앱 추가 기능 — web 엔 없다)', () => {
    const onClearAll = jest.fn();
    const tree = render(
      <RecentKeywords
        keywords={['모니터']}
        onSelect={noop}
        onRemove={noop}
        onClearAll={onClearAll}
      />,
    );
    ReactTestRenderer.act(() => {
      pressable(tree, '최근 검색어 전체 삭제').props.onPress();
    });
    expect(onClearAll).toHaveBeenCalled();
  });

  it('긴 검색어는 15자에서 자르고 …을 붙인다(web Chip 과 같은 규칙)', () => {
    const long = '가나다라마바사아자차카타파하거너더'; // 17자
    const tree = render(
      <RecentKeywords
        keywords={[long]}
        onSelect={noop}
        onRemove={noop}
        onClearAll={noop}
      />,
    );
    const texts = textsOf(tree);
    expect(texts).toContain(long.slice(0, 15));
    expect(texts).toContain('...');
    expect(texts).not.toContain(long);
  });
});

describe('추천 검색어', () => {
  it('목록에서 5개만 그린다', () => {
    const tree = render(<RecommendedKeywords onSelect={() => {}} />);
    const chips = tree.root.findAll(
      node =>
        typeof node.props?.onPress === 'function' &&
        RECOMMENDED_KEYWORDS.includes(node.props?.accessibilityLabel),
    );
    expect(chips).toHaveLength(5);
  });

  it('누르면 그 검색어로 검색한다', () => {
    const onSelect = jest.fn();
    const tree = render(<RecommendedKeywords onSelect={onSelect} />);
    const chip = tree.root.findAll(
      node =>
        typeof node.props?.onPress === 'function' &&
        RECOMMENDED_KEYWORDS.includes(node.props?.accessibilityLabel),
    )[0];
    ReactTestRenderer.act(() => {
      chip.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith(chip.props.accessibilityLabel);
  });
});

describe('자동완성 목록', () => {
  it('제안어를 그리고 일치 구간을 쪼개 보여준다', () => {
    const tree = render(
      <SuggestionList
        suggestions={['아이폰 케이스', '아이폰 충전기']}
        highlight="아이폰"
        onSelect={() => {}}
      />,
    );
    const texts = textsOf(tree);
    // 강조 때문에 조각으로 나뉘어 있다 — 이어붙이면 원문이 나온다.
    expect(texts.join('')).toContain('아이폰 케이스');
    expect(texts).toContain('아이폰');
  });

  it('제안어를 누르면 그 값으로 검색한다', () => {
    const onSelect = jest.fn();
    const tree = render(
      <SuggestionList
        suggestions={['아이폰 케이스']}
        highlight="아이"
        onSelect={onSelect}
      />,
    );
    ReactTestRenderer.act(() => {
      pressable(tree, '아이폰 케이스').props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('아이폰 케이스');
  });

  it('제안어에 정규식 메타문자가 있어도 죽지 않는다', () => {
    expect(() =>
      render(
        <SuggestionList
          suggestions={['C++ 교재', 'a.b 어댑터']}
          highlight="C++"
          onSelect={() => {}}
        />,
      ),
    ).not.toThrow();
  });
});

describe('검색 입력 헤더', () => {
  const props = {
    onChangeText: () => {},
    onSubmit: () => {},
    onClear: () => {},
    onBack: () => {},
    onFocus: () => {},
    autoFocus: false,
  };

  it('입력이 비어 있으면 지우기 버튼이 없다', () => {
    const tree = render(<SearchHeader {...props} value="" />);
    const found = tree.root.findAll(
      node => node.props?.accessibilityLabel === '입력 지우기',
    );
    expect(found).toHaveLength(0);
  });

  it('입력이 있으면 지우기 버튼이 나오고 눌리면 onClear 를 부른다', () => {
    const onClear = jest.fn();
    const tree = render(
      <SearchHeader {...props} value="모니터" onClear={onClear} />,
    );
    ReactTestRenderer.act(() => {
      pressable(tree, '입력 지우기').props.onPress();
    });
    expect(onClear).toHaveBeenCalled();
  });

  it('뒤로가기 버튼이 있다 — web 레이아웃의 BackButton 자리', () => {
    const onBack = jest.fn();
    const tree = render(<SearchHeader {...props} value="" onBack={onBack} />);
    ReactTestRenderer.act(() => {
      pressable(tree, '뒤로').props.onPress();
    });
    expect(onBack).toHaveBeenCalled();
  });

  it('입력창이 실제로 그려진다(placeholder 로 확인)', () => {
    const tree = render(<SearchHeader {...props} value="" />);
    const inputs = tree.root.findAll(
      node => node.props?.placeholder === '핫딜 제품을 검색해 주세요',
    );
    expect(inputs.length).toBeGreaterThan(0);
  });
});
