/**
 * 데이터 낭비 — 화면이 바뀐 게 없는데 나가던 요청들.
 *
 * 1. 앱 복귀 때 무한 목록을 **내린 페이지 전부** 다시 받았다(목록마다 왕복 N번).
 * 2. iOS 의 inactive(알림 센터·Face ID·공유 시트)도 복귀로 쳐서 화면을 떠난 적 없는데 갱신했다.
 * 3. 커뮤니티 댓글 하나에 커뮤니티 쿼리 전부(세 탭 목록·핫딜 칸)를, 상품 댓글 좋아요 하나에
 *    댓글 목록 전부를 다시 받았다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {AppState, type AppStateStatus} from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {addEventListener: jest.fn(() => () => {})},
}));

const mockGetPosts = jest.fn();
const mockGetPostComments = jest.fn();
const mockAddComment = jest.fn();
jest.mock('../src/shared/api/community', () => ({
  CommunityService: {
    getPosts: (...a: unknown[]) => mockGetPosts(...a),
    getPostComments: (...a: unknown[]) => mockGetPostComments(...a),
    addComment: (...a: unknown[]) => mockAddComment(...a),
  },
}));
const mockRemoveComment = jest.fn();
jest.mock('../src/shared/api/comment/comment.service', () => ({
  CommentService: {
    removeComment: (...a: unknown[]) => mockRemoveComment(...a),
    updateComment: jest.fn(),
  },
}));
jest.mock('../src/shared/lib/feedback', () => ({
  showToast: {success: jest.fn(), error: jest.fn(), info: jest.fn()},
}));

import {refetchOnFocus} from '../src/provider/ReactQueryProvider';
import useAppStateTokenRefresh from '../src/shared/hooks/useAppStateTokenRefresh';
import {useCommunityCommentsViewModel} from '../src/features/community/model/useCommunityCommentsViewModel';
import {bumpReplyCount} from '../src/features/community/model/optimistic';
import {CommunityQueries} from '../src/entities/community';
import {AuthQueries} from '../src/entities/auth';

declare const __dirname: string;
const fs = require('fs');
const path = require('path');

type AppStateListener = (state: AppStateStatus) => void;

/** AppState 리스너를 가로채 상태 전환을 손으로 흘린다. */
const captureAppState = () => {
  const listeners: AppStateListener[] = [];
  const spy = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      listeners.push(listener as AppStateListener);
      return {remove: jest.fn()} as never;
    });
  const emit = (...states: AppStateStatus[]) =>
    states.forEach(s => listeners.forEach(l => l(s)));
  return {spy, emit};
};

const flush = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

describe('복귀 때 무한 목록 — 2페이지까지만 다시 받는다', () => {
  const infinite = (n: number) => ({
    state: {data: {pages: Array(n).fill([]), pageParams: Array(n).fill(null)}},
  });

  it.each([
    [1, true],
    [2, true],
    [3, false],
    [10, false],
  ])('%i페이지 → %s', (pages, expected) => {
    expect(refetchOnFocus(infinite(pages))).toBe(expected);
  });

  it('무한 목록이 아니면 지금처럼 갱신한다', () => {
    expect(refetchOnFocus({state: {data: [1, 2, 3]}})).toBe(true);
    expect(refetchOnFocus({state: {data: undefined}})).toBe(true);
  });
});

describe('포커스 — inactive 는 복귀가 아니다', () => {
  afterEach(() => jest.restoreAllMocks());

  const load = () => {
    const app = captureAppState();
    let fm: typeof import('@tanstack/react-query').focusManager | undefined;
    jest.isolateModules(() => {
      require('../src/provider/ReactQueryProvider');
      fm = require('@tanstack/react-query').focusManager;
    });
    const focus = fm as NonNullable<typeof fm>;
    const changes: boolean[] = [];
    focus.subscribe(f => changes.push(f));
    return {emit: app.emit, focus, changes};
  };

  it('알림 센터·Face ID(active→inactive→active)는 포커스를 건드리지 않는다', () => {
    const {emit, focus, changes} = load();
    emit('inactive', 'active');
    expect(changes).toEqual([true]); // 이미 포커스 — 다시 받을 계기가 아니다
    expect(focus.isFocused()).toBe(true);
    expect(changes.filter(f => !f)).toHaveLength(0);
  });

  it('백그라운드에 다녀오면 내렸다 올린다(→ 1분 지난 쿼리 갱신)', () => {
    const {emit, changes} = load();
    emit('inactive', 'background', 'active');
    expect(changes).toEqual([false, true]);
  });
});

describe('토큰 갱신 — 백그라운드에 다녀왔을 때만', () => {
  afterEach(() => jest.restoreAllMocks());

  const mount = () => {
    const app = captureAppState();
    const client = new QueryClient();
    const invalidate = jest
      .spyOn(client, 'invalidateQueries')
      .mockImplementation(async () => {});
    const Probe = () => {
      useAppStateTokenRefresh();
      return null;
    };
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    return {emit: app.emit, invalidate};
  };

  it('inactive 만 거친 복귀는 갱신하지 않는다', () => {
    const {emit, invalidate} = mount();
    emit('inactive', 'active', 'inactive', 'active');
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('background→inactive→active 는 한 번 갱신한다', () => {
    const {emit, invalidate} = mount();
    emit('inactive', 'background', 'inactive', 'active', 'inactive', 'active');
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: AuthQueries.keys.loginByRefreshToken(),
    });
  });
});

describe('커뮤니티 댓글 — 그 글만 다시 받고 목록 숫자는 그 자리에서', () => {
  const POST_ID = 5;
  const post = (id: number, replyCount: number) => ({
    id: String(id),
    replyCount,
    searchAfter: [String(id)],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // 목록은 한 페이지(20개 미만)라 다음 페이지가 없다.
    mockGetPosts.mockResolvedValue([post(POST_ID, 3), post(6, 1)]);
    mockGetPostComments.mockResolvedValue([]);
    mockAddComment.mockResolvedValue({});
    mockRemoveComment.mockResolvedValue({});
  });

  const mount = async () => {
    const client = new QueryClient({
      defaultOptions: {queries: {retry: false, staleTime: Infinity}},
    });
    let vm: ReturnType<typeof useCommunityCommentsViewModel> | undefined;
    const Lists = () => {
      useInfiniteQuery(CommunityQueries.posts('all'));
      useInfiniteQuery(CommunityQueries.posts('trending'));
      vm = useCommunityCommentsViewModel(POST_ID);
      return null;
    };
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <QueryClientProvider client={client}>
          <Lists />
        </QueryClientProvider>,
      );
      await flush();
    });
    const replyCount = (tab: 'all' | 'trending') =>
      (
        client.getQueryData(CommunityQueries.keys.posts(tab)) as {
          pages: {id: string; replyCount: number}[][];
        }
      ).pages[0].find(p => p.id === String(POST_ID))?.replyCount;
    return {vm: () => vm as NonNullable<typeof vm>, replyCount};
  };

  it('작성: 목록 다시 받지 않고 두 탭 카드 모두 +1, 댓글은 다시 받는다', async () => {
    const {vm, replyCount} = await mount();
    expect(mockGetPosts).toHaveBeenCalledTimes(2);
    expect(mockGetPostComments).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      vm().addComment('hi');
      await flush();
    });

    expect(mockGetPosts).toHaveBeenCalledTimes(2);
    expect(mockGetPostComments).toHaveBeenCalledTimes(2);
    expect(replyCount('all')).toBe(4);
    expect(replyCount('trending')).toBe(4);
  });

  it('삭제: -1', async () => {
    const {vm, replyCount} = await mount();
    await ReactTestRenderer.act(async () => {
      vm().removeComment(99);
      await flush();
    });
    expect(mockGetPosts).toHaveBeenCalledTimes(2);
    expect(replyCount('all')).toBe(2);
  });

  it('bumpReplyCount 는 0 밑으로 내려가지 않고 id 를 문자열로 비교한다', () => {
    expect(bumpReplyCount([{id: '5', replyCount: 0}], 5, -1)).toEqual([
      {id: '5', replyCount: 0},
    ]);
    expect(bumpReplyCount([{id: 7, replyCount: 1}], '7', 1)).toEqual([
      {id: 7, replyCount: 2},
    ]);
  });
});

describe('상품 댓글 좋아요 — 성공해도 목록을 다시 받지 않는다', () => {
  it('likeComment 뮤테이션에 onSuccess 가 없다(낙관적 값이 곧 서버 값)', () => {
    const src: string = fs.readFileSync(
      path.join(__dirname, '..', 'src/features/comment/ui/Comment.tsx'),
      'utf8',
    );
    const block = src.slice(
      src.indexOf('const {mutate: likeComment}'),
      src.indexOf('const {mutate: removeComment}'),
    );
    expect(block).toContain('onMutate');
    expect(block).not.toMatch(/onSuccess/);
  });
});
