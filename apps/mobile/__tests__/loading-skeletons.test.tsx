/**
 * 첫 진입 로딩이 "빈 화면 + 점 하나"로 돌아가지 않게 지킨다.
 *
 * 홈만 스켈레톤을 갖고 있어서 탭마다 로딩 인상이 갈렸다 — 같은 앱인데
 * 홈은 뼈대가 뜨고 발견·알림은 흰 바탕에 작은 스피너 하나였다.
 * 컴포넌트는 실제로 렌더해서, 화면 배선은 소스 계약으로 고정한다.
 */
import * as ReactTestRenderer from 'react-test-renderer';

import {
  ChipRowSkeleton,
  ListRowsSkeleton,
  SkeletonBox,
} from '../src/shared/components/Skeletons';

// ⚠️@types/node 가 없어 top-level import 는 tsc 가 죽는다 → 인라인 require.
// 흔한 이름(fs/path)을 top-level const 로 두면 다른 테스트와 재선언 충돌한다.
const read = (rel: string) => {
  const nodeFs = require('fs');
  const nodePath = require('path');
  return nodeFs.readFileSync(
    nodePath.join(__dirname, '..', rel),
    'utf8',
  ) as string;
};

/**
 * 렌더 → 노드 수 세기 → 언마운트까지 한 번에.
 * ⚠️언마운트를 빼면 useShimmer 의 Animated.loop 가 계속 돌아, 테스트가 끝난 뒤
 * "Jest environment has been torn down" 으로 터진다(실제로 겪음).
 */
const renderAndCount = (element: React.ReactElement) => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  const n = countBoxes(tree as ReactTestRenderer.ReactTestRenderer);
  ReactTestRenderer.act(() => {
    (tree as ReactTestRenderer.ReactTestRenderer).unmount();
  });
  return n;
};

const countBoxes = (tree: ReactTestRenderer.ReactTestRenderer) => {
  const json = tree.toJSON();
  let n = 0;
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const el = node as {children?: unknown; props?: {style?: unknown}};
    if (el.props?.style) n += 1;
    if (el.children) walk(el.children);
  };
  walk(json);
  return n;
};

describe('로딩 스켈레톤', () => {
  it('SkeletonBox 가 렌더된다', () => {
    expect(renderAndCount(<SkeletonBox />)).toBeGreaterThan(0);
  });

  it('ChipRowSkeleton 은 요청한 개수만큼 칩을 그린다', () => {
    expect(renderAndCount(<ChipRowSkeleton count={6} />)).toBeGreaterThan(
      renderAndCount(<ChipRowSkeleton count={3} />),
    );
  });

  it('ListRowsSkeleton 은 요청한 개수만큼 행을 그린다', () => {
    expect(renderAndCount(<ListRowsSkeleton count={8} />)).toBeGreaterThan(
      renderAndCount(<ListRowsSkeleton count={2} />),
    );
  });

  it('개수를 안 주면 기본값으로 그린다 — 빈 화면이 되면 안 된다', () => {
    expect(renderAndCount(<ChipRowSkeleton />)).toBeGreaterThan(0);
    expect(renderAndCount(<ListRowsSkeleton />)).toBeGreaterThan(0);
  });
});

describe('소스 계약 — 첫 진입은 스켈레톤으로', () => {
  const cases: Array<[string, string, string[]]> = [
    [
      '발견',
      'src/screens/trending/TrendingScreen.tsx',
      ['ChipRowSkeleton', 'ListRowsSkeleton'],
    ],
    ['알림', 'src/screens/alarm/AlarmScreen.tsx', ['ListRowsSkeleton']],
  ];

  for (const [label, file, expected] of cases) {
    it(`${label} 화면의 isPending 분기가 스켈레톤을 쓴다`, () => {
      const src = read(file);
      for (const name of expected) {
        expect(src).toContain(name);
      }
      // isPending 직후에 스피너만 놓는 형태로 되돌아가지 않게 막는다.
      expect(src).not.toMatch(/isPending \?[\s\S]{0,120}<ActivityIndicator/);
    });
  }

  it('shimmer 는 한 곳에서만 정의한다 — 두 벌이면 깜빡임 주기가 갈린다', () => {
    const shared = read('src/shared/components/Skeletons.tsx');
    const home = read('src/screens/home/ui/HomeSkeletons.tsx');
    expect(shared).toContain('export function useShimmer');
    expect(home).not.toContain('function useShimmer');
    expect(home).toContain("from '@/shared/components/Skeletons'");
  });
});
