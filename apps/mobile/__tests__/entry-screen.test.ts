import {resolveEntryScreen} from '@/shared/lib/navigation/entry-screen';

describe('resolveEntryScreen', () => {
  const stack = (names: string[]) => ({
    index: names.length - 1,
    routes: names.map(name => ({name})),
  });

  it('같은 스택 이전 스크린', () => {
    expect(
      resolveEntryScreen(stack(['Search', 'ProductDetail']), stack(['Home'])),
    ).toBe('screen:Search');
  });

  it('스택 첫 화면이면 부모 탭', () => {
    expect(
      resolveEntryScreen(stack(['ProductDetail']), stack(['Home', 'Alarm'])),
    ).toBe('root:Alarm');
    expect(
      resolveEntryScreen(stack(['ProductDetail']), undefined),
    ).toBeUndefined();
  });
});
