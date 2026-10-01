import {hasWindowControls} from '../src/shared/components/WindowControlsSafeArea';

// iPad 호환 모드(이 앱은 iPhone 전용)에선 idiom 이 'phone' 이라 isPad 가 false 다.
// 판정은 OS 이름(systemName)으로 해야 iPad 사용자 헤더가 창 버튼 밑에 깔리지 않는다.
describe('hasWindowControls', () => {
  it('iPadOS 26+ 는 창 버튼이 있다(iPhone 앱 호환 모드 포함)', () => {
    expect(hasWindowControls('ios', 'iPadOS', '27.0')).toBe(true);
    expect(hasWindowControls('ios', 'iPadOS', '26.0')).toBe(true);
  });

  it('iPhone·옛 iPadOS·Android 는 없다', () => {
    expect(hasWindowControls('ios', 'iOS', '27.0')).toBe(false);
    expect(hasWindowControls('ios', 'iPadOS', '18.5')).toBe(false);
    expect(hasWindowControls('android', undefined, 34)).toBe(false);
  });
});
