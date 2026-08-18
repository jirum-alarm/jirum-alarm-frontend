import {compareVersion, isBelowMinimum} from '../src/shared/lib/update/version';

describe('compareVersion', () => {
  it('같은 버전은 0', () => {
    expect(compareVersion('1.4.2', '1.4.2')).toBe(0);
  });

  // 문자열 비교로 짜면 여기서 깨진다 — 최신 유저를 스토어로 보내는 사고.
  it('두 자리 수를 자릿수로 비교한다', () => {
    expect(compareVersion('1.10.0', '1.9.0')).toBeGreaterThan(0);
    expect(compareVersion('1.9.0', '1.10.0')).toBeLessThan(0);
  });

  it('major 가 우선', () => {
    expect(compareVersion('2.0.0', '1.99.99')).toBeGreaterThan(0);
  });

  it('patch 까지 본다', () => {
    expect(compareVersion('1.4.3', '1.4.2')).toBeGreaterThan(0);
  });

  it('프리릴리스 꼬리표는 무시한다', () => {
    expect(compareVersion('1.4.2-beta.1', '1.4.2')).toBe(0);
  });

  it('자리가 빠져도 0 으로 채운다', () => {
    expect(compareVersion('2', '2.0.0')).toBe(0);
    expect(compareVersion('2.1', '2.0.5')).toBeGreaterThan(0);
  });
});

describe('isBelowMinimum', () => {
  it('최소 버전 미만이면 막는다', () => {
    expect(isBelowMinimum('1.4.2', '1.5.0')).toBe(true);
  });

  it('같거나 높으면 통과', () => {
    expect(isBelowMinimum('1.5.0', '1.5.0')).toBe(false);
    expect(isBelowMinimum('1.6.0', '1.5.0')).toBe(false);
  });

  // 정책 파일을 못 읽었거나 값이 비었을 때 앱을 잠그면 전체 장애가 된다.
  it('값이 없으면 막지 않는다', () => {
    expect(isBelowMinimum('', '1.5.0')).toBe(false);
    expect(isBelowMinimum('1.4.2', '')).toBe(false);
  });
});
