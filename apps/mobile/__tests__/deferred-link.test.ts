import {
  isFreshInstall,
  parseHandoffReferrer,
} from '../src/shared/lib/navigation/deferred-link';

/**
 * Play 가 돌려주는 referrer 는 웹이 Play 주소에 실은 값을 한 번 디코드한 문자열이다
 * (apps/web/src/features/app-download/model/appHandoff.ts playStoreUrl).
 */
describe('parseHandoffReferrer', () => {
  const referrer = (path: string, campaign = 'app_handoff'): string =>
    `utm_source=jirum_web&utm_medium=detail_header&utm_campaign=${campaign}&jirum_path=${encodeURIComponent(
      path,
    )}`;

  it('웹 넘기기 referrer 에서 보던 경로를 꺼낸다', () => {
    expect(parseHandoffReferrer(referrer('/products/123'))).toBe(
      '/products/123',
    );
    expect(parseHandoffReferrer(referrer('/community/80'))).toBe(
      '/community/80',
    );
  });

  it('홈은 열 게 없다 — 앱이 원래 홈으로 뜬다', () => {
    expect(parseHandoffReferrer(referrer('/'))).toBeNull();
  });

  it('우리 캠페인이 아니면 따라가지 않는다(Play 기본값·광고 referrer)', () => {
    expect(
      parseHandoffReferrer('utm_source=google-play&utm_medium=organic'),
    ).toBeNull();
    expect(parseHandoffReferrer(referrer('/products/1', 'other'))).toBeNull();
    expect(parseHandoffReferrer('')).toBeNull();
    expect(parseHandoffReferrer(null)).toBeNull();
  });

  it('경로 모양이 아니면 버린다 — 호스트·스킴·쿼리를 실어 보낼 수 없다', () => {
    expect(parseHandoffReferrer(referrer('//evil.com/x'))).toBeNull();
    expect(parseHandoffReferrer(referrer('https://evil.com'))).toBeNull();
    expect(parseHandoffReferrer(referrer('/products/1?x=1'))).toBeNull();
    expect(
      parseHandoffReferrer('utm_campaign=app_handoff&jirum_path=%E0%A4%A'),
    ).toBeNull();
  });
});

describe('isFreshInstall', () => {
  const now = new Date('2026-10-12T12:00:00Z');

  it('설치 하루 안이면 첫 실행으로 본다', () => {
    expect(isFreshInstall(new Date('2026-10-12T11:58:00Z'), now)).toBe(true);
  });

  it('업데이트로 코드를 처음 받은 옛 설치자는 아니다', () => {
    expect(isFreshInstall(new Date('2026-09-01T00:00:00Z'), now)).toBe(false);
  });
});
