import {resolveFontFamily} from '../src/shared/components/ui/Text/AppText';

declare const __dirname: string;

describe('AppText — 굵기별 Pretendard 파일', () => {
  it('className 굵기를 파일로 바꾼다(마지막 것이 이긴다)', () => {
    expect(resolveFontFamily('text-sm text-gray-700', undefined)).toBe(
      'Pretendard-Regular',
    );
    expect(resolveFontFamily('text-lg font-bold', undefined)).toBe(
      'Pretendard-Bold',
    );
    expect(resolveFontFamily('font-medium font-semibold', undefined)).toBe(
      'Pretendard-SemiBold',
    );
    // 접두사 붙은 굵기(active: 등)는 기본 상태가 아니다.
    expect(resolveFontFamily('active:font-bold', undefined)).toBe(
      'Pretendard-Regular',
    );
  });

  it('style.fontWeight 도 본다', () => {
    expect(resolveFontFamily(undefined, {fontWeight: '600'})).toBe(
      'Pretendard-SemiBold',
    );
    expect(resolveFontFamily(undefined, [{fontWeight: 'bold'}])).toBe(
      'Pretendard-Bold',
    );
  });

  it('호출부가 글꼴을 정했으면 건드리지 않는다', () => {
    expect(resolveFontFamily('font-pretendard-semibold', undefined)).toBe(
      undefined,
    );
    expect(
      resolveFontFamily('font-bold', {fontFamily: 'Pretendard-Bold'}),
    ).toBe(undefined);
  });
});

/**
 * 회귀 가드: react-native 의 Text·TextInput 을 직접 쓰면 글자 확대 상한과
 * Pretendard 가 빠진다(React 19 라 defaultProps 로 전역 지정이 안 된다).
 */
it('react-native 에서 Text·TextInput 을 직접 import 하지 않는다', () => {
  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '../src');
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) {
        if (name !== 'gql') walk(p);
      } else if (/\.tsx?$/.test(name) && !p.endsWith('AppText.tsx')) {
        const src: string = fs.readFileSync(p, 'utf8');
        for (const m of src.matchAll(
          /import\s*\{([^}]*)\}\s*from\s*'react-native'/g,
        )) {
          const names = m[1].split(',').map(n => n.trim());
          if (names.includes('Text') || names.includes('TextInput')) {
            offenders.push(path.relative(root, p));
          }
        }
      }
    }
  };
  walk(root);
  expect(offenders).toEqual([]);
});
