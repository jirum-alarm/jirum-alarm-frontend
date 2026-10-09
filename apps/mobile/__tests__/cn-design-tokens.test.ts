/**
 * cn() 이 디자인 토큰의 사용자 정의 값(text-11·shadow-card·rounded-t-sheet)을 지우지 않는지.
 * 2026-10-09 회귀 — tailwind-merge 가 text-11 을 "글자 색"으로 읽어, 같은 cn() 의 text-success-700 과
 * 합치며 크기를 지웠다(토스 배지·찜하기 라벨이 기본 크기로 커졌다). 예전 text-[11px] 은 길이라 무사했다.
 */
import {cn} from '../src/shared/lib/styling';

describe('cn — 디자인 토큰의 사용자 정의 값', () => {
  it('글자 크기를 색과 합쳐도 남긴다', () => {
    expect(cn('text-11 font-medium', 'text-success-700')).toBe(
      'text-11 font-medium text-success-700',
    );
    expect(cn('text-11', false ? 'text-error-500' : 'text-gray-800')).toBe(
      'text-11 text-gray-800',
    );
  });

  it('같은 종류끼리는 뒤의 것이 이긴다', () => {
    expect(cn('text-sm', 'text-13')).toBe('text-13');
    expect(cn('rounded-lg', 'rounded-t-sheet')).toBe(
      'rounded-lg rounded-t-sheet',
    );
  });
});
