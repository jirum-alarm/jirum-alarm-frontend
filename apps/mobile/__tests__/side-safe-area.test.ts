import {
  sideColumnClass,
  sideInsets,
} from '../src/shared/components/SideSafeArea';

// 아이폰 듀오 바깥 화면은 상태 표시줄 기둥 폭을 오른쪽 inset 으로 준다(시뮬레이터 실측 right 84).
// 앱 전체를 그만큼 들여야 헤더 아이콘이 상태 표시줄 밑에 깔리지 않는다.
describe('sideInsets', () => {
  it('iOS 는 시스템이 준 좌우 inset 을 그대로 들인다', () => {
    expect(sideInsets('ios', {left: 0, right: 84})).toEqual({
      left: 0,
      right: 84,
    });
    expect(sideInsets('ios', {left: 62, right: 62})).toEqual({
      left: 62,
      right: 62,
    });
  });

  it('안드로이드는 들이지 않는다', () => {
    expect(sideInsets('android', {left: 48, right: 0})).toEqual({
      left: 0,
      right: 0,
    });
  });
});

// 상태 표시줄 글자는 들인 기둥 위에 그려진다 — 기둥은 글자색의 반대여야 시간이 보인다.
describe('sideColumnClass', () => {
  it('흰 글자면 짙은 기둥, 검은 글자면 흰 기둥', () => {
    expect(sideColumnClass('light-content')).toBe('bg-fixed-900');
    expect(sideColumnClass('dark-content')).toBe('bg-fixed-white');
  });

  it('default 는 iOS 가 글자색을 고르니 테마 바탕', () => {
    expect(sideColumnClass('default')).toBe('bg-white');
  });
});
