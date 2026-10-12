import {buildPostPurchasePromptQueue} from '../src/screens/detail/lib/okachat';

jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: jest.fn()},
}));
jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: jest.fn(),
  setAsyncStorage: jest.fn(),
}));
jest.mock('../src/shared/lib/navigation', () => ({
  openInAppBrowser: jest.fn(),
}));

/** 앱은 푸시가 이미 통로라 회원·게스트 모두 키워드가 먼저, 방은 그다음(2026-10-12). */
describe('buildPostPurchasePromptQueue (app)', () => {
  it('방에 안 들어간 사람: 키워드 → 오카방', () => {
    expect(buildPostPurchasePromptQueue(false)).toEqual(['keyword', 'kakao']);
  });
  it('이미 들어간 사람: 키워드만', () => {
    expect(buildPostPurchasePromptQueue(true)).toEqual(['keyword']);
  });
});
