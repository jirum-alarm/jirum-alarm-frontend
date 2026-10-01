/**
 * 업데이트 권유 — 새 버전이 있을 때 **버전당 한 번만**, 강제 대상이면 권유하지 않는다.
 */
import {shouldOfferUpdate} from '../src/shared/lib/update/release-policy';

const policy = {minSupportedVersion: '1.0.0', latestVersion: '1.4.7'};

it('새 버전이 있으면 권한다', () => {
  expect(shouldOfferUpdate('1.4.6', policy, null)).toBe(true);
});

it('이미 권한 버전이면 다시 안 권한다(닫으면 끝)', () => {
  expect(shouldOfferUpdate('1.4.6', policy, '1.4.7')).toBe(false);
  // 더 새 버전이 나오면 다시 한 번
  expect(
    shouldOfferUpdate('1.4.6', {...policy, latestVersion: '1.4.8'}, '1.4.7'),
  ).toBe(true);
});

it('최신이거나 더 높으면 안 권한다 — 자릿수 비교(1.4.10 > 1.4.9)', () => {
  expect(shouldOfferUpdate('1.4.7', policy, null)).toBe(false);
  expect(
    shouldOfferUpdate('1.4.10', {...policy, latestVersion: '1.4.9'}, null),
  ).toBe(false);
});

it('강제 대상은 강제 화면이 맡는다 — 권유 시트는 안 띄운다', () => {
  expect(
    shouldOfferUpdate(
      '1.3.0',
      {minSupportedVersion: '1.4.0', latestVersion: '1.4.7'},
      null,
    ),
  ).toBe(false);
});

it('정책을 못 읽거나 값이 없으면 아무것도 안 한다', () => {
  expect(shouldOfferUpdate('1.4.6', null, null)).toBe(false);
  expect(
    shouldOfferUpdate(
      '1.4.6',
      {minSupportedVersion: '', latestVersion: ''},
      null,
    ),
  ).toBe(false);
});
