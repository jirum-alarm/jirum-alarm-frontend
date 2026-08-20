export {};

/**
 * 네이티브 탭바 표면색 가드.
 *
 * ★ iOS 는 탭바 색을 **두 개의 appearance** 로 관리한다:
 *   - standardAppearance:   일반 상태
 *   - scrollEdgeAppearance: 콘텐츠가 끝까지 스크롤된(edge) 상태
 *
 * 🔴 실제 사고: scrollEdgeAppearance 를 비워 뒀더니 시스템 기본값이 적용돼
 * **다크모드 기기의 홈 탭에서 탭바만 검게** 떴다. 앱은 아직 다크를 지원하지
 * 않는데(`dark:` 0곳) `userInterfaceStyle: automatic` 이라 OS 가 네이티브
 * 크롬에만 다크를 입힌 것. standardAppearance 만 보면 색이 지정돼 있어
 * 코드 리뷰로는 놓치기 쉽다 — 두 곳이 다 필요하다.
 *
 * 색 자체는 native-headers.ts 한 곳에서 온다(JS 탭바와 공유).
 */

// @types/node 를 이 앱에 넣지 않으므로 인라인 require 를 쓴다(기존 테스트와 동일).
const fs = require('fs');
const path = require('path');

const read = (p: string): string =>
  fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

const NAV = 'src/navigations/tab/createNativeBottomTabNavigator.tsx';
const HEADERS = 'src/navigations/tab/native-headers.ts';

const nav = read(NAV);
const headers = read(HEADERS);

describe('네이티브 탭바 appearance', () => {
  it('standardAppearance 와 scrollEdgeAppearance 를 모두 넘긴다', () => {
    // 둘 중 하나만 주면 나머지 상태에서 시스템 기본색(다크)이 나온다.
    expect(nav).toContain('standardAppearance=');
    expect(nav).toContain('scrollEdgeAppearance=');
  });

  it('두 appearance 가 같은 함수로 만들어진다 — 색이 갈리지 않게', () => {
    const calls = nav.match(/(standard|scrollEdge)Appearance=\{(\w+)\(/g) ?? [];
    expect(calls.length).toBe(2);
    const fns = calls.map(c => c.match(/[=]\{(\w+)\(/)?.[1]);
    expect(new Set(fns).size).toBe(1);
  });

  it('탭바 표면색은 native-headers 상수에서 온다 (하드코딩 금지)', () => {
    // 색을 여기 직접 적으면 JS 탭바와 갈린다.
    expect(nav).toContain('TAB_BAR_BACKGROUND_COLOR');
    expect(headers).toMatch(
      /export const TAB_BAR_BACKGROUND_COLOR = '#[0-9a-fA-F]{6}'/,
    );
  });

  it('appearance 를 만드는 함수가 배경색을 채운다', () => {
    // titleAppearance 가 글자색만 넣고 배경을 빼면 같은 증상이 재발한다.
    const fn = nav.slice(nav.indexOf('function titleAppearance'));
    const body = fn.slice(0, fn.indexOf('\n}'));
    expect(body).toContain('tabBarBackgroundColor');
    expect(body).toContain('TAB_BAR_BACKGROUND_COLOR');
  });
});
