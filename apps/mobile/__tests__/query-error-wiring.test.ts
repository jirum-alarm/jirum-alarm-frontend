/**
 * 앱의 queryClient 가 쿼리·뮤테이션 실패를 보고 함수로 넘기는가 — 화면이 「다시 시도」로
 * 삼키는 실패도 기록에 남아야 한다(거르는 규칙은 monitoring.test 가 본다).
 */
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {addEventListener: jest.fn(() => () => {})},
}));

const mockCapture = jest.fn();
jest.mock('../src/shared/lib/monitoring/sentry', () => ({
  captureQueryError: (...args: unknown[]) => mockCapture(...args),
}));

import {queryClient} from '../src/provider/ReactQueryProvider';

describe('queryClient → captureQueryError', () => {
  beforeEach(() => mockCapture.mockClear());

  it('쿼리 실패를 쿼리 키와 함께 넘긴다', async () => {
    const error = new Error('HTTP 502');
    await queryClient
      .fetchQuery({
        queryKey: ['product', 'detail', 7],
        queryFn: () => Promise.reject(error),
      })
      .catch(() => {});
    expect(mockCapture).toHaveBeenCalledWith(error, {
      kind: 'query',
      key: ['product', 'detail', 7],
    });
  });

  it('뮤테이션 실패도 넘긴다', async () => {
    const error = new Error('boom');
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationKey: ['comment', 'create'],
        mutationFn: () => Promise.reject(error),
      })
      .execute(undefined)
      .catch(() => {});
    expect(mockCapture).toHaveBeenCalledWith(error, {
      kind: 'mutation',
      key: ['comment', 'create'],
    });
  });
});
