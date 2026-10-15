import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
jest.mock('../global.css', () => ({}));
import TimeDealDetailTimer from '../src/screens/detail/ui/TimeDealDetailTimer';

// 상세 가격 아래 선착순·타임특가 타이머 — 종료 시각까지 세고, 0이 되면 「끝났어요」로 바꾸고 다시 세지 않는다.
const kst = (iso: string) => new Date(`${iso}+09:00`);
const toss = (extra: Record<string, unknown> = {}) => ({
  toss: {
    todayDealStartAt: '2026-10-15T00:00:00',
    todayDealEndAt: '2026-10-16T00:00:00',
    dealStatus: 'ON_GOING',
    ...extra,
  },
});

const textOf = (tree: ReactTestRenderer.ReactTestRenderer): string => {
  const out: string[] = [];
  const walk = (
    node: ReactTestRenderer.ReactTestRendererJSON | string | null,
  ) => {
    if (node == null) return;
    if (typeof node === 'string') return void out.push(node);
    (node.children ?? []).forEach(walk);
  };
  const json = tree.toJSON();
  (Array.isArray(json) ? json : [json]).forEach(walk);
  return out.join('');
};

const mount = (
  product: React.ComponentProps<typeof TimeDealDetailTimer>['product'],
) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<TimeDealDetailTimer product={product} />);
  });
  return tree;
};

describe('TimeDealDetailTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(kst('2026-10-15T22:30:00'));
  });
  afterEach(() => jest.useRealTimers());

  it('판매 중이면 종료 시각과 남은 시간, 0이 되면 「특가가 끝났어요」(다시 세지 않음)', () => {
    const tree = mount({data: toss()});
    expect(textOf(tree)).toBe('오늘 밤 12시 종료·1:30:00 남음');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(textOf(tree)).toBe('오늘 밤 12시 종료·1:29:59 남음');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(90 * 60 * 1000);
    });
    expect(textOf(tree)).toBe('오늘 밤 12시 종료·특가가 끝났어요');
    ReactTestRenderer.act(() => tree.unmount());
  });

  it('마감은 타이머 없이 상태만', () => {
    const tree = mount({data: toss({dealStatus: 'SOLD_OUT'})});
    expect(textOf(tree)).toBe('선착순 마감 · 밤 12시 새 특가 오픈');
  });

  it('커뮤니티 예고 글은 오픈까지', () => {
    jest.setSystemTime(kst('2026-10-15T13:00:00'));
    const tree = mount({
      title: '오늘 17시 네이버 LIVE',
      postedAt: kst('2026-10-15T11:20:00').toISOString(),
    });
    expect(textOf(tree)).toBe('오늘 17:00 오픈·오픈까지 4:00:00');
    ReactTestRenderer.act(() => tree.unmount());
  });

  it('일반 상품·끝난 딜은 아무것도 그리지 않는다', () => {
    expect(
      mount({title: '맛밤 42g 10개', postedAt: Date.now()}).toJSON(),
    ).toBeNull();
    expect(mount({data: toss(), isEnd: true}).toJSON()).toBeNull();
  });
});
