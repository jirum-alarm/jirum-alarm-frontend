/**
 * 디자인 시스템이 정본이다 — web·앱이 모양을 레시피에서 가져가는지를 **디자인 시스템 쪽에서** 본다.
 *   node --test packages/design-system
 *
 * 전엔 앱 테스트(design-system-component-parity)가 web 경로를 따로 들고 두 앱 소스를 대조했다. 그러면 web 을
 * 옮길 때마다 앱 테스트가 깨지고(13번 고침), 정본(카탈로그)과 검사 목록이 따로 놀았다. 이제 «어느 자리가 어느
 * 레시피를 읽어야 하나»는 카탈로그(web·app·sites) 한 곳에 있고, 이 파일이 그걸 돈다(2026-10-20).
 *
 * 모양이 틀렸으면 자리에서 고치지 말고 레시피(recipes.js)·토큰을 먼저 고친다 — 두 플랫폼이 같이 바뀐다.
 */
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {test} from 'node:test';

const require = createRequire(import.meta.url);
const {catalog} = require('./catalog.js');
const recipes = require('./recipes.js');

const root = new URL('../../', import.meta.url).pathname;
const SOURCE = /\.(ts|tsx)$/;
const NOT_SOURCE = /\.(stories|test)\.tsx?$/;

/** 파일이면 그 파일, 폴더면 안의 소스 전부(스토리·테스트 제외). */
const readPart = (rel) => {
  const abs = join(root, rel);
  if (!statSync(abs).isDirectory()) return readFileSync(abs, 'utf8');
  return readdirSync(abs, {recursive: true})
    .map(String)
    .filter((f) => SOURCE.test(f) && !NOT_SOURCE.test(f))
    .map((f) => readFileSync(join(abs, f), 'utf8'))
    .join('\n');
};

/** import {a, b} from '@jirum/design-system/recipes' 에 name 이 있는지(여러 줄 import 포함). */
const importsRecipe = (src, name) =>
  new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '@jirum/design-system/recipes'`).test(src);

const sourcesUnder = (rel) =>
  readdirSync(join(root, rel), {recursive: true})
    .map(String)
    .filter((f) => SOURCE.test(f) && !NOT_SOURCE.test(f))
    .map((f) => join(rel, f));

// ── 1. 카탈로그의 부품·자리가 레시피를 읽는다
/** 레시피 대신 같은 값을 다른 길로 넣는 앱 부품(이유 필수). */
const APP_RECIPE_EXCEPTIONS = {
  // Animated.View 깜빡임 판이라 색을 style 로 준다 — c.gray[200] = 레시피 skeleton 의 bg-gray-200 과 같은 값.
  skeleton: (src) => /c\.gray\[200\]/.test(src),
};

const pairs = catalog.filter((e) => e.recipe && e.web && e.app);

test('web·앱 구현이 둘 다 있는 부품은 둘 다 레시피를 읽는다', () => {
  assert.ok(pairs.length >= 8, `짝이 ${pairs.length}개 — 카탈로그를 못 읽었나`);
  const missing = [];
  for (const e of pairs) {
    if (!importsRecipe(readPart(e.web), e.recipe)) missing.push(`${e.id}: ${e.web}`);
    const app = readPart(e.app);
    const ok = APP_RECIPE_EXCEPTIONS[e.id] ? APP_RECIPE_EXCEPTIONS[e.id](app) : importsRecipe(app, e.recipe);
    if (!ok) missing.push(`${e.id}: ${e.app}`);
  }
  assert.deepEqual(missing, []);
});

test('레시피를 직접 읽어 그리는 자리(sites)는 그 레시피를 import 한다', () => {
  const missing = catalog.flatMap((e) =>
    (e.sites ?? []).filter((p) => !importsRecipe(readPart(p), e.recipe)).map((p) => `${e.id}: ${p}`),
  );
  assert.deepEqual(missing, []);
});

// ── 2. 레시피를 읽는 곳에 옛 손글씨 모양이 남지 않는다(레시피가 생기기 전 각자 적던 클래스 — 다시 적으면 두 플랫폼이 갈린다)
const RAW_COLOR = /\b(?:bg|text|border)-(?:gray|primary|secondary|error|success|warning|fixed)-\d{2,3}\b/;
const HAND_WRITTEN = {
  // 모양이 전부 레시피인 부품 — 색 클래스가 하나도 없어야 한다.
  badge: RAW_COLOR,
  chip: RAW_COLOR,
  cardLabel: RAW_COLOR,
  toggle: RAW_COLOR,
  button: RAW_COLOR,
  toast: /bg-fixed-\d00/,
  // 자리마다 다른 것과 섞이는 레시피 — 예전 손글씨 그대로만 막는다.
  sectionTitle: /text-lg font-(?:bold|semibold) text-gray-900|text-sm text-gray-500 hover:text-gray-700|titleClassName="text-fixed-white"/,
  tab: /\bbg-(?:gray-900|fixed-800)\b/,
  cardThumb: /border-gray-200 bg-gray-50/,
  infoBox: /rounded-xl border border-gray-200 bg-gray-50/,
  dealRow: /rounded-lg border border-gray-100 p-3/,
  linkChip: /rounded-full border border-gray-200 px-\d/,
  notificationRow: /opacity-60/,
};

test('레시피를 읽는 부품·자리에 옛 손글씨 모양이 없다', () => {
  const offenders = [];
  for (const [id, re] of Object.entries(HAND_WRITTEN)) {
    const e = catalog.find((c) => c.id === id);
    assert.ok(e, `카탈로그에 ${id} 없음`);
    // toast 컴포넌트 폴더는 아이콘 색을 쓰므로 판 색만 본다(위 정규식). 부품 자체 + 자리 전부.
    for (const p of [e.web, e.app, ...(e.sites ?? [])].filter(Boolean)) {
      if (re.test(readPart(p))) offenders.push(`${id}: ${p}`);
    }
  }
  assert.deepEqual(offenders, []);
});

// ── 3. 레시피 문자열을 통째로 복사해 붙이지 않는다(import 대신 값 복사 = 레시피를 고쳐도 그 자리는 안 바뀐다)
const recipeStrings = (value, out = []) => {
  if (typeof value === 'string') {
    if (value.trim().split(/\s+/).length >= 4) out.push(value.trim());
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) recipeStrings(v, out);
  }
  return out;
};

test('앱 소스에 레시피 클래스 문자열을 통째로 복사하지 않는다', () => {
  const strings = [...new Set(recipeStrings(recipes))];
  assert.ok(strings.length > 20, `레시피 문자열 수집이 비었다(${strings.length})`);
  const copies = [];
  for (const dir of ['apps/web/src', 'apps/mobile/src']) {
    for (const file of sourcesUnder(dir)) {
      const src = readFileSync(join(root, file), 'utf8');
      for (const s of strings) if (src.includes(s)) copies.push(`${file} — "${s}"`);
    }
  }
  assert.deepEqual(copies, []);
});

// ── 4. web 에서 공용 부품이 하는 일을 손으로 다시 하지 않는다
const WEB_ONLY_IN = [
  // [무엇, 정규식, 이 파일에만 있어도 된다, 왜]
  ['시트 가림막·판', /Drawer\.Overlay/, 'shared/ui/common/BottomSheet/BottomSheet.tsx', '예전엔 11벌 복사'],
  ['깜빡이는 자리표시 판', /\banimate-pulse\b/, 'shared/ui/common/Skeleton/Skeleton.tsx', '예전엔 12개 파일 54곳, 색이 gray-100·50 으로 갈렸다'],
];

test('web 에서 시트 겉·스켈레톤 판을 공용 부품 밖에서 다시 그리지 않는다', () => {
  const files = sourcesUnder('apps/web/src').filter((f) => f.endsWith('.tsx'));
  assert.ok(files.length > 300, `web 소스 스캔이 비었다(${files.length})`);
  const offenders = [];
  for (const [what, re, allowed] of WEB_ONLY_IN) {
    for (const f of files) {
      if (f.endsWith(allowed)) continue;
      if (re.test(readFileSync(join(root, f), 'utf8'))) offenders.push(`${what}: ${f}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('web 어디에도 칩·태그 모양을 손으로 다시 적지 않는다(여러 줄 JSX 도 파일 단위로 본다)', () => {
  const offenders = sourcesUnder('apps/web/src')
    .filter((f) => f.endsWith('.tsx'))
    .filter((f) =>
      /rounded-full border border-gray-200 (?:bg-white )?px-|rounded-full bg-gray-100 px-2\.5/.test(
        readFileSync(join(root, f), 'utf8'),
      ),
    );
  assert.deepEqual(offenders, []);
});

// 주 버튼(라임 판 + 짙은 글자)은 Button 이나 buttonClass() 로 — 손으로 적은 14곳이 높이(h-12·h-14·py-3·py-3.5)·모서리·비활성 모양이
// 갈렸고 대부분 눌림 반응이 없었다(2026-10-22).
const WEB_PRIMARY_BUTTON_EXCEPTIONS = {
  // 도움말 본문 안 아이콘 달린 작은 권유 링크 — 화면 아래 주 버튼(lg)이 아니고 레시피 md 는 짙은 판이라 맞는 모양이 없다.
  'apps/web/src/app/(desktop-ready)/help/page.tsx': 1,
  // 떠 있는 글쓰기 버튼(FAB) — 알약·그림자, 버튼 레시피의 모양이 아니다.
  'apps/web/src/features/community/ui/CommunityList.tsx': 1,
};

test('web 에서 주 버튼 모양을 손으로 다시 적지 않는다(Button·buttonClass)', () => {
  const offenders = [];
  for (const f of sourcesUnder('apps/web/src').filter((f) => f.endsWith('.tsx'))) {
    if (f.includes('shared/ui/common/Button/')) continue;
    const strings = readFileSync(join(root, f), 'utf8').match(/(["'`])[^"'`\n]*\bbg-primary-500\b[^"'`\n]*\1/g) ?? [];
    const n = strings.filter((c) => /\btext-fixed-900\b/.test(c) && /\b(?:h-1[0-4]|py-3(?:\.5)?)\b/.test(c)).length;
    if (n > (WEB_PRIMARY_BUTTON_EXCEPTIONS[f] ?? 0)) offenders.push(`${f}: ${n}`);
  }
  assert.deepEqual(offenders, []);
});

test('홈 랭킹 카드 크기 — web 클래스·앱 숫자가 layout.rankingCard 와 같다', () => {
  // 앱은 layout 숫자를 import 하고(Animated·스켈레톤), web 은 같은 값의 클래스를 쓴다(PC 에선 pc:h-auto 로 풀어야 해 style 로 못 옮긴다).
  const {layout} = require('./layout.js');
  const {height, thumbHeight, inactiveScale} = layout.rankingCard;
  const web = [
    'apps/web/src/entities/product-list/ui/ranking/ProductRankingImageCard.tsx',
    'apps/web/src/entities/product-list/ui/ranking/ADProductRankingImageCard.tsx',
    'apps/web/src/widgets/home/ui/mobile/RankingSkeleton.tsx',
  ];
  for (const f of web) {
    const src = readPart(f);
    assert.ok(src.includes(`h-[${height}px]`), `${f}: 카드 h-[${height}px] 아님`);
    assert.ok(src.includes(`h-${thumbHeight / 4}`), `${f}: 사진 h-${thumbHeight / 4} 아님`);
    assert.ok(src.includes(`scale-${inactiveScale * 100}`), `${f}: 옆 카드 scale-${inactiveScale * 100} 아님`);
  }
  for (const f of ['apps/mobile/src/entities/home/ui/JirumRankingSlider.tsx', 'apps/mobile/src/screens/home/ui/HomeSkeletons.tsx']) {
    const src = readPart(f);
    assert.match(src, /layout\.rankingCard\./, `${f}: layout.rankingCard 를 안 읽는다`);
    assert.doesNotMatch(src, /height: 352|\[1, 0\.9\]|\? 1 : 0\.9/, `${f}: 랭킹 카드 숫자를 손으로 적었다`);
  }
});

test('홈 상단바 — web 전환 클래스가 layout.homeHeader.transitionMs 와 같다', () => {
  const {layout} = require('./layout.js');
  const src = readPart('apps/web/src/widgets/home/ui/mobile/HomeHeader.tsx');
  assert.ok(src.includes(`duration-${layout.homeHeader.transitionMs}`), 'web 상단바 duration 이 정본과 다르다');
  assert.match(src, /layout\.homeHeader\.scrollThreshold/);
});

test('카탈로그 sites 경로가 있다(빈 검사로 통과하지 않게)', () => {
  const sites = catalog.flatMap((e) => e.sites ?? []);
  assert.ok(sites.length >= 40, `sites ${sites.length}개`);
  for (const p of sites) assert.ok(existsSync(join(root, p)), `${p} 없음`);
});
