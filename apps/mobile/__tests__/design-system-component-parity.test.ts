/**
 * 앱 부품이 디자인 시스템 값을 다른 길로 넣는 자리 — 앱에만 있는 규칙.
 *
 * «web·앱이 같은 레시피를 읽나»(카탈로그 짝·레시피를 읽는 자리·옛 손글씨 모양·레시피 문자열 복사)는
 * 이제 디자인 시스템 쪽 packages/design-system/consumers.test.mjs 가 카탈로그를 돌며 본다(2026-10-20).
 * 전엔 이 파일이 web 경로를 따로 들고 대조해 web 을 옮길 때마다 깨졌다. 여기엔 web 을 읽는 검사를 두지 않는다.
 */
const fs = require('fs');
const path = require('path');
declare const __dirname: string;

const native = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../src', p), 'utf8');

describe('채운 탭 — 앱 탭 줄은 손으로 그리지 않고 TabPill 을 쓴다', () => {
  it.each([
    'features/community/ui/CommunityTabBar.tsx',
    'entities/trending/ui/CategoryTabBar.tsx',
    'entities/home/ui/TossHomeSection.tsx',
  ])('%s', file => {
    expect(native(file)).toContain('<TabPill');
  });
});

describe('시트 — 앱 시트 둘이 디자인 시스템 값을 style 로 받는 자리', () => {
  it('위 모서리는 radius.sheet 토큰(예전 16 은 web 20 보다 각졌다)', () => {
    expect(native('shared/components/BottomSheet.tsx')).toMatch(
      /radius\.sheet/,
    );
    expect(native('screens/detail/ui/ShareSheet.tsx')).toContain(
      'SHEET_RADIUS',
    );
    expect(native('screens/detail/ui/ShareSheet.tsx')).not.toMatch(
      /borderTopLeftRadius: 16/,
    );
  });

  it('다크 판 위 테두리 — 레시피(dark:border-t)와 앱 시트 둘(useSheetPanelStyle)이 같이 간다', () => {
    const {sheet} = require('@jirum/design-system/recipes');
    expect(sheet.panel).toContain('dark:border-t dark:border-gray-100');
    expect(native('shared/components/BottomSheet.tsx')).toMatch(
      /borderTopWidth: 1, borderColor: c\.gray\[100\]/,
    );
    // 판 색을 손으로 다시 쓰면 다크 테두리가 빠진다 — 두 시트 모두 훅으로.
    for (const f of [
      'shared/components/BottomSheet.tsx',
      'screens/detail/ui/ShareSheet.tsx',
    ]) {
      expect(native(f)).toContain('useSheetPanelStyle()');
      expect(native(f)).not.toContain('{backgroundColor: c.white},');
    }
  });
});

describe('스켈레톤 — 앱 SkeletonBox 는 레시피와 같은 gray-200 을 style 로', () => {
  it('레시피 색은 gray-200 이고 앱 SkeletonBox 도 같은 색', () => {
    const {skeleton} = require('@jirum/design-system/recipes');
    expect(skeleton).toBe('bg-gray-200');
    expect(native('shared/components/Skeletons.tsx')).toContain('c.gray[200]');
  });
});

describe('단어 태그 — 앱 관심사 태그가 다시 6px 사각(rounded-md)으로 갈리지 않는다', () => {
  it('ThemeDetailScreen', () => {
    expect(native('screens/mypage/ThemeDetailScreen.tsx')).not.toMatch(
      /rounded-md (?:bg-gray-50|border border-gray-200) px-2\.5/,
    );
  });
});

describe('토스트 — 머무는 시간은 디자인 시스템 layout.duration', () => {
  it('앱 토스트가 숫자를 다시 적지 않는다', () => {
    const src = native('shared/lib/feedback/toast.ts');
    expect(src).toContain('layout.duration.toast');
    expect(src).toContain('layout.duration.toastWithAction');
    expect(src).not.toMatch(/VISIBILITY(?:_WITH_ACTION)?_MS = \d/);
  });
});

export {};
