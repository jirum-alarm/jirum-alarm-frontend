/**
 * 다크모드 = 토큰 값 바꿔치기(palette.js). className 은 그대로 두고 :root 변수만 라이트/다크로 갈린다.
 * 깨지면 "다크에서 한 색만 안 바뀐다"(키 누락) 또는 "라이트까지 바뀐다"(변수 누락)로 조용히 드러난다.
 */
import {dark, fixed, light} from '../src/shared/theme/palette';
import {hasTextColor} from '../src/shared/components/ui/Text/AppText';

const keysOf = (theme: Record<string, unknown>) =>
  Object.entries(theme).flatMap(([name, value]) =>
    typeof value === 'string'
      ? [name]
      : Object.keys(value as object).map(step => `${name}-${step}`),
  );

describe('palette', () => {
  it('라이트·다크가 같은 토큰을 가진다', () => {
    expect(keysOf(dark).sort()).toEqual(keysOf(light).sort());
  });

  it('fixed 는 라이트 회색·흰색 그대로다(테마 무관)', () => {
    expect(fixed.white).toBe(light.white);
    expect(fixed[900]).toBe(light.gray[900]);
  });
});

describe('tailwind 설정', () => {
  const config = require('../tailwind.config.js');

  it('테마 색은 전부 변수를 가리킨다(투명도 수식어 유지)', () => {
    const colors = config.theme.extend.colors;
    expect(colors.white).toBe('rgb(var(--color-white) / <alpha-value>)');
    expect(colors.gray[500]).toBe('rgb(var(--color-gray-500) / <alpha-value>)');
    expect(colors.fixed.white).toBe('#FFFFFF');
  });

  it(':root 에 라이트, prefers-color-scheme: dark 에 다크 값을 깐다', () => {
    let base: Record<string, any> = {};
    config.plugins[0]({addBase: (b: Record<string, any>) => (base = b)});
    expect(base[':root']['--color-white']).toBe('255 255 255');
    expect(
      base['@media (prefers-color-scheme: dark)'][':root']['--color-white'],
    ).toBe('12 17 29');
    expect(Object.keys(base[':root']).sort()).toEqual(
      keysOf(light)
        .map(k => `--color-${k}`)
        .sort(),
    );
  });
});

describe('AppText 다크 기본 글자색 — 색을 정한 글자는 건드리지 않는다', () => {
  it.each([
    ['text-sm text-gray-900', true],
    ['text-xs font-semibold text-fixed-white', true],
    ['text-[#ffb200]', true],
    ['text-primary-500 font-bold', true],
    ['text-green-600', true],
    ['text-2xl font-bold', false],
    ['text-[13px] font-bold', false],
    ['text-center text-sm', false],
    [undefined, false],
  ])('%s → %s', (className, expected) => {
    expect(hasTextColor(className, undefined)).toBe(expected);
  });

  it('style.color 도 본다', () => {
    expect(hasTextColor(undefined, {color: '#fff'})).toBe(true);
  });
});
