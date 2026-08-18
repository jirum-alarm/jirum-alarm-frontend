/**
 * className 이 안 먹는 크롬(시스템 헤더·탭바)의 색이 한 곳에만 있는지 지킨다.
 *
 * 이 색들은 NativeWind `dark:` 로 못 고치는 자리라, 흩어지면 다크모드 착수 때
 * 네 곳을 각각 찾아 고쳐야 하고 한 곳을 놓치면 헤더만 흰색으로 남는다.
 * 특히 탭바는 JS·네이티브 두 벌이라 어긋나면 탭바 색이 갈린다
 * (실제로 이 영역은 과거 반복 회귀한 자리).
 */
// ⚠️@types/node 가 없어 top-level import 는 tsc 가 죽는다 → 인라인 require.
// 그리고 테스트들이 tsc 스코프를 공유하므로 `fs`/`path` 같은 흔한 이름을
// top-level const 로 두면 다른 테스트와 재선언 충돌한다(실제로 겪음).
const read = (rel: string) => {
  const nodeFs = require('fs');

  const nodePath = require('path');
  return nodeFs.readFileSync(
    nodePath.join(__dirname, '..', rel),
    'utf8',
  ) as string;
};

const listDir = (rel: string): string[] => {
  const nodeFs = require('fs');

  const nodePath = require('path');
  return nodeFs.readdirSync(nodePath.join(__dirname, '..', rel));
};

const NAV_DIR = 'src/navigations/tab';
const SOURCE = `${NAV_DIR}/native-headers.ts`;

describe('크롬 색 단일 출처', () => {
  it('native-headers 가 헤더·탭바 색 상수를 모두 내보낸다', () => {
    const src = read(SOURCE);
    for (const name of [
      'HEADER_TINT_COLOR',
      'HEADER_BACKGROUND_COLOR',
      'TAB_BAR_BACKGROUND_COLOR',
      'TAB_BAR_BORDER_COLOR',
    ]) {
      expect(src).toContain(`export const ${name} =`);
    }
  });

  it('다른 네비게이션 파일에 헤더·탭바 색을 하드코딩하지 않는다', () => {
    const files = listDir(NAV_DIR).filter(
      (f: string) => /\.tsx?$/.test(f) && f !== 'native-headers.ts',
    );

    for (const file of files) {
      const src = read(`${NAV_DIR}/${file}`);
      // 헤더 옵션에 색을 직접 박은 경우
      expect(src).not.toMatch(/headerTintColor:\s*'#/);
      expect(src).not.toMatch(/headerStyle:\s*\{backgroundColor:\s*'#/);
      // 탭바 배경/경계선을 직접 박은 경우.
      // ⚠️`tabBarBackgroundColor` 만 보면 StyleSheet 의 맨 `backgroundColor`
      // 를 놓친다(실제로 이 테스트 첫 판이 그래서 회귀를 못 잡았다).
      expect(src).not.toMatch(/tabBarBackgroundColor:\s*'#/);
      expect(src).not.toMatch(/borderTopColor:\s*'#/);
      expect(src).not.toMatch(/backgroundColor:\s*'#(?:fff|FFF)/);
    }
  });

  it('JS 탭바와 네이티브 탭바가 같은 상수를 쓴다 — 두 벌이 갈리면 안 된다', () => {
    for (const file of [
      'MainTabNavigator.tsx',
      'createNativeBottomTabNavigator.tsx',
    ]) {
      expect(read(`${NAV_DIR}/${file}`)).toContain('TAB_BAR_BACKGROUND_COLOR');
    }
  });
});
