/**
 * 내정보 메뉴를 **실제로 그려서** 정본(@jirum/domain/mypage) 목록이 그 순서대로 나오는지 본다.
 *
 * 소스 문자열 대조(mypage-port-parity)는 «정본을 도는가»만 보고, 그려진 결과는 못 본다 —
 * 행을 숨기는 조건(게스트)이나 묶음 끝 앱 전용 줄이 섞여도 순서가 맞는지는 렌더로만 확인된다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {expoConfig: {version: '0.0.0'}},
}));

const mockPush = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({push: mockPush}),
}));

let mockIsGuest = false;
jest.mock('../src/entities/auth/useAuth', () => ({
  useAuth: () => ({isGuest: mockIsGuest}),
}));
jest.mock('../src/shared/hooks/useRequireLogin', () => ({
  useOpenLogin: () => jest.fn(),
}));
// 프로필 조회는 이 테스트의 관심이 아니다 — 네트워크 대신 바로 실패시켜 열린 요청이 남지 않게.
jest.mock('../src/entities/mypage', () => ({
  MyPageQueries: {
    me: () => ({
      queryKey: ['mypage', 'me'],
      queryFn: () => Promise.reject(new Error('test')),
    }),
  },
}));
// 시트 둘은 열 때만 내용이 있고 네이티브 웹뷰를 끌고 온다 — 메뉴 순서와 무관.
jest.mock('../src/features/mypage/ui/CustomerServiceSheet', () => () => null);
jest.mock('../src/features/mypage/ui/ColorSchemeSheet', () => () => null);

import MyPageScreen from '../src/screens/mypage/MyPageScreen';
import {MYPAGE_GROUPS, mobileMenuOf} from '@jirum/domain/mypage';

const METRICS = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

const cleanups: Array<() => void> = [];
afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
});

const renderTexts = (): string[] => {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <QueryClientProvider client={client}>
          <MyPageScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  });
  cleanups.push(() => {
    ReactTestRenderer.act(() => renderer.unmount());
    client.clear();
  });
  return renderer.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .filter((c): c is string => typeof c === 'string');
};

/** 그려진 글자 중 메뉴 이름(정본 + 앱 전용 줄)만 순서대로. */
const MENU_TITLES = new Set([
  ...MYPAGE_GROUPS.flatMap(g => mobileMenuOf(g.key).map(i => i.title)),
  '화면 모드',
  '고객센터',
  '앱 평가하기',
]);

describe('내정보 메뉴 — 정본 순서로 그려진다', () => {
  it('회원: 정본 6줄 + 앱 전용 줄(화면 모드는 맞춤 설정 끝, 고객센터·앱 평가하기는 지원 끝)', () => {
    mockIsGuest = false;
    const titles = renderTexts().filter(t => MENU_TITLES.has(t));
    expect(titles).toEqual([
      '찜 목록',
      '키워드 알림',
      '관심 카테고리',
      '알림 설정',
      '화면 모드',
      '사용법 · 자주 묻는 질문',
      '약관 및 정책',
      '고객센터',
      '앱 평가하기',
    ]);
  });

  it('게스트: 관심 카테고리만 빠진다(회원 프로필에 저장되는 설정)', () => {
    mockIsGuest = true;
    const titles = renderTexts().filter(t => MENU_TITLES.has(t));
    expect(titles).not.toContain('관심 카테고리');
    expect(titles).toContain('키워드 알림');
    expect(titles).toHaveLength(8);
  });

  it('묶음 이름이 정본 순서로 나온다', () => {
    mockIsGuest = false;
    const labels = new Set<string>(MYPAGE_GROUPS.map(g => g.label));
    expect(renderTexts().filter(t => labels.has(t))).toEqual(
      MYPAGE_GROUPS.map(g => g.label),
    );
  });
});
