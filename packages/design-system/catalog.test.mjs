/**
 * 카탈로그가 실제 코드와 맞는지 — 부품을 만들고 등록을 빼먹거나, 옮기고 경로를 안 고치면 여기서 막힌다.
 *   node --test packages/design-system
 */
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {test} from 'node:test';

const require = createRequire(import.meta.url);
const {catalog} = require('./catalog.js');
const recipes = require('./recipes.js');
const {layout} = require('./layout.js');

const root = new URL('../../', import.meta.url).pathname;

/** 폴더면 그 안의 *.stories.tsx, 파일이면 같은 폴더의 <이름>.stories.tsx 에서 title 을 모은다. */
const storyTitlesUnder = (dir) =>
  readdirSync(dir, {recursive: true})
    .filter((f) => String(f).endsWith('.stories.tsx'))
    // meta 의 title 만 골라내기 어렵다(목업 데이터에도 title 키가 있다) — 파일 안의 title 문자열을 다 모은다.
    .flatMap((f) => [...readFileSync(join(dir, String(f)), 'utf8').matchAll(/title:\s*'([^']+)'/g)].map((m) => m[1]));

const allStoryTitles = [
  ...storyTitlesUnder(join(root, 'apps/web/src')),
  ...storyTitlesUnder(join(root, 'apps/design/src')),
];

test('id 가 겹치지 않는다', () => {
  const ids = catalog.map((e) => e.id);
  assert.deepEqual(ids, [...new Set(ids)]);
});

test('적힌 경로가 실제로 있다(옮기면 카탈로그도 고친다)', () => {
  for (const e of catalog) {
    for (const p of [e.web, e.app].filter(Boolean)) assert.ok(existsSync(join(root, p)), `${e.id}: ${p} 없음`);
  }
});

test('보조 파일·참고 예시 경로도 실제로 있다', () => {
  for (const e of catalog) {
    for (const p of [...(e.related ?? []), ...(e.examples ?? [])]) assert.ok(existsSync(join(root, p)), `${e.id}: ${p} 없음`);
  }
});

/**
 * 역방향 — 공용 폴더에 부품을 만들면 지도에 올리거나, 올리지 않는 이유를 여기 적는다.
 * 예전엔 등록된 것만 검사해서 상품 카드·헤더·목록 행처럼 가장 자주 쓰는 부품이 지도에 없었다(2026-10-16 리뷰).
 */
const NOT_PARTS = {
  // web shared/ui
  'apps/web/src/shared/ui/AlarmLinkButton.tsx': '헤더 알림 아이콘 동작 — 자리 하나',
  'apps/web/src/shared/ui/ColorSchemeButton.tsx': '헤더 화면 모드 아이콘 동작 — 자리 하나',
  'apps/web/src/shared/ui/DisplayTime.tsx': '시간 글자 포맷(모양 없음)',
  'apps/web/src/shared/ui/ImageComponent.tsx': 'next/image 래퍼(기반 도구)',
  'apps/web/src/shared/ui/ImageWithFallback.tsx': 'next/image 래퍼(기반 도구)',
  'apps/web/src/shared/ui/InteractiveMoreLink.tsx': '「더보기」 글자 링크 — 섹션 제목 오른쪽 슬롯',
  'apps/web/src/shared/ui/Link.tsx': 'next/link 래퍼(기반 도구)',
  'apps/web/src/shared/ui/MSW.tsx': '개발용 목 서버',
  'apps/web/src/shared/ui/TabScrollTopButton.tsx': '탭 다시 누르면 맨 위로(동작만)',
  'apps/web/src/shared/ui/TopButton.tsx': '떠 있는 「맨 위로」 — 상세 한 자리',
  'apps/web/src/shared/ui/adsense': '애드센스 광고 칸(외부 소재)',
  'apps/web/src/shared/ui/headless': '포커스 가두기·스크롤 잠금 같은 동작(모양 없음)',
  'apps/web/src/shared/ui/common/icons': '아이콘·그림 모음',
  'apps/web/src/shared/ui/common/Logo': '브랜드 로고',
  'apps/web/src/shared/ui/layout/BasicLayout.tsx': '페이지 틀(헤더+본문+하단 탭 배치)',
  'apps/web/src/shared/ui/layout/BottomNav.tsx': '하단 탭 — 앱은 네이티브 탭바',
  // 앱 shared/components
  'apps/mobile/src/shared/components/icons': '아이콘·그림 모음',
  'apps/mobile/src/shared/components/OfflineBanner.tsx': '오프라인 띠 — 앱 전역 한 자리',
  'apps/mobile/src/shared/components/PushPermissionPrePrompt.tsx': '알림 권한 안내 — 한 흐름 전용',
  'apps/mobile/src/shared/components/SwipeToDelete.tsx': '밀어서 삭제 동작(모양 없음)',
  'apps/mobile/src/shared/components/UpdateAvailableSheet.tsx': '업데이트 안내 시트 — 한 흐름 전용',
  'apps/mobile/src/shared/components/WebViewErrorView.tsx': '웹뷰 실패 화면 — 웹뷰 전용',
  'apps/mobile/src/shared/components/WebViewLoadingIndicator.tsx': '웹뷰 로딩 — 웹뷰 전용',
  'apps/mobile/src/shared/components/WebViewPrewarm.tsx': '웹뷰 예열(화면 없음)',
  'apps/mobile/src/shared/components/WindowControlsSafeArea.tsx': '창 컨트롤 여백(화면 없음)',
};

const units = (dir, {files = true, dirs = true} = {}) =>
  readdirSync(join(root, dir), {withFileTypes: true})
    .filter((d) => (d.isDirectory() ? dirs : files && /\.tsx$/.test(d.name) && !/\.(stories|test)\./.test(d.name)))
    .map((d) => `${dir}/${d.name}`);

test('공용 폴더의 부품은 지도에 있거나, 올리지 않는 이유가 적혀 있다', () => {
  const listed = catalog.flatMap((e) => [e.web, e.app, ...(e.related ?? []), ...(e.examples ?? [])]).filter(Boolean);
  const covered = (u) => u in NOT_PARTS || listed.some((p) => p === u || p.startsWith(`${u}/`));
  const all = [
    ...units('apps/web/src/shared/ui', {dirs: false}),
    ...units('apps/web/src/shared/ui').filter((u) => !u.endsWith('/common') && !u.endsWith('/layout')).filter((u) => statSync(join(root, u)).isDirectory()),
    ...units('apps/web/src/shared/ui/common'),
    ...units('apps/web/src/shared/ui/layout'),
    ...units('apps/mobile/src/shared/components').filter((u) => !/\/(ui|product)$/.test(u)),
    ...units('apps/mobile/src/shared/components/ui'),
    ...units('apps/mobile/src/shared/components/product'),
  ];
  const missing = all.filter((u) => !covered(u));
  assert.deepEqual(missing, [], `카탈로그에 없고 NOT_PARTS 에도 없는 공용 부품: ${missing.join(', ')}`);
  for (const p of Object.keys(NOT_PARTS)) assert.ok(existsSync(join(root, p)), `NOT_PARTS 에 지워진 경로: ${p}`);
});

test('레시피 이름은 recipes.js 에 있다', () => {
  for (const e of catalog.filter((e) => e.recipe)) assert.ok(e.recipe in recipes, `${e.id}: recipes.${e.recipe} 없음`);
});

test('레시피는 전부 카탈로그에 있다(만들고 등록을 빼먹지 않는다)', () => {
  const listed = new Set(catalog.map((e) => e.recipe).filter(Boolean));
  // buttonTone 은 button 의 고르기 함수, cardLabel 은 ProductCardStatus 가 쓴다.
  const helpers = new Set(['buttonTone']);
  for (const name of Object.keys(recipes)) {
    if (!helpers.has(name)) assert.ok(listed.has(name), `recipes.${name} 이 카탈로그에 없다`);
  }
});

test('모든 부품은 놀이터에서 만져 볼 스토리가 있다', () => {
  for (const e of catalog) assert.ok(allStoryTitles.includes(e.story), `${e.id}: 스토리 「${e.story}」 없음`);
});

test('web 부품의 스토리는 부품 옆에 있다(놀이터가 web 소스에서 모아 온다)', () => {
  for (const e of catalog.filter((e) => e.web)) {
    const p = join(root, e.web);
    const dir = statSync(p).isDirectory() ? p : join(p, '..');
    const own = storyTitlesUnder(dir);
    assert.ok(own.includes(e.story), `${e.id}: ${dir} 에 「${e.story}」 스토리가 없다`);
  }
});

test('조립 규칙의 아이콘 크기는 큰 것부터 줄어든다', () => {
  const sizes = Object.values(layout.icon);
  assert.deepEqual(sizes, [...sizes].sort((a, b) => b - a));
  assert.ok(layout.minTouch >= 44);
});
