import {normalizeDeepLink} from '../src/shared/lib/navigation/deep-link';

describe('normalizeDeepLink', () => {
  it('커스텀 스킴을 서비스 절대 URL 로 바꾼다', () => {
    expect(normalizeDeepLink('jirumalarm://products/123')).toBe(
      'https://jirum-alarm.com/products/123',
    );
  });

  it('슬래시 3개짜리 스킴도 같은 결과를 낸다', () => {
    expect(normalizeDeepLink('jirumalarm:///products/123')).toBe(
      'https://jirum-alarm.com/products/123',
    );
  });

  it('유니버설 링크는 그대로 통과한다', () => {
    expect(normalizeDeepLink('https://jirum-alarm.com/products/123')).toBe(
      'https://jirum-alarm.com/products/123',
    );
  });

  it('쿼리·해시를 잃지 않는다 — 상세 push 경로가 이걸 그대로 쓴다', () => {
    expect(
      normalizeDeepLink('https://jirum-alarm.com/products/123?utm=kakao#top'),
    ).toBe('https://jirum-alarm.com/products/123?utm=kakao#top');
  });

  it('서브도메인(dev)도 서비스 도메인으로 받는다', () => {
    expect(normalizeDeepLink('https://dev.jirum-alarm.com/products/1')).toBe(
      'https://jirum-alarm.com/products/1',
    );
  });

  // 오픈 리다이렉트 방어. 앱이 링크를 받아 웹뷰에 그대로 로드하므로
  // 남의 도메인을 통과시키면 피싱 페이지를 우리 앱 안에서 띄우게 된다.
  it('접미사만 같은 사칭 도메인은 막는다', () => {
    expect(normalizeDeepLink('https://evil-jirum-alarm.com/products/1')).toBe(
      null,
    );
    expect(normalizeDeepLink('https://jirum-alarm.com.evil.io/x')).toBe(null);
  });

  it('외부 도메인은 열지 않는다', () => {
    expect(normalizeDeepLink('https://naver.com')).toBe(null);
  });

  it('등록되지 않은 스킴은 무시한다', () => {
    expect(normalizeDeepLink('evilapp://products/123')).toBe(null);
  });

  // 카카오/네이버 로그인 콜백은 각 SDK 가 처리한다. 여기서 삼키면 로그인이 깨진다.
  it('소셜 로그인 콜백은 가로채지 않는다', () => {
    expect(normalizeDeepLink('kakaoa14549f2://oauth?code=x')).toBe(null);
    expect(normalizeDeepLink('jirumalarm://oauth?code=x')).toBe(null);
  });

  it('빈 값은 null', () => {
    expect(normalizeDeepLink('')).toBe(null);
  });

  it('호스트만 있는 링크는 홈으로 연다', () => {
    expect(normalizeDeepLink('https://jirum-alarm.com')).toBe(
      'https://jirum-alarm.com/',
    );
  });
});
