/**
 * 디자인 시스템의 약속을 기계가 지키게 한다 — 깨지면 "다크에서 한 색만 안 바뀐다"·"글자가 안 읽힌다"·
 * "고친 토큰이 web 에만 안 들어갔다"로 조용히 드러나는 것들.
 *   node --test packages/design-system
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';

import {render} from './build.mjs';

const require = createRequire(import.meta.url);
const {light, dark, fixed, brand, twMergeConfig} = require('./tokens.js');
const {patterns} = require('./eslint.js');

const keys = (palette) =>
  Object.entries(palette)
    .flatMap(([name, v]) => (typeof v === 'string' ? [name] : Object.keys(v).map((s) => `${name}-${s}`)))
    .sort();

test('theme.css 는 tokens.js 에서 생성한 그대로다(손으로 고쳤거나 build 를 빼먹지 않았다)', () => {
  assert.equal(readFileSync(new URL('./theme.css', import.meta.url), 'utf8'), render());
});

test('라이트·다크가 같은 토큰을 가진다', () => {
  assert.deepEqual(keys(dark), keys(light));
});

test('fixed 는 라이트 회색·흰색 그대로다(테마 무관)', () => {
  assert.equal(fixed.white, light.white);
  for (const step of Object.keys(light.gray)) assert.equal(fixed[step], light.gray[step]);
});

test('모든 값은 #RRGGBB', () => {
  const all = [light, dark, fixed, brand].flatMap((p) =>
    Object.values(p).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v))),
  );
  for (const hex of all) assert.match(hex, /^#[0-9A-F]{6}$/, hex);
});

// WCAG 상대 휘도·대비
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/**
 * README 의 "글자에 써도 되는 조합" — 본문 크기 기준 AA(4.5:1)를 두 테마 모두에서 넘어야 한다.
 * [글자, 바탕] 은 토큰 경로('gray.500') — 'fixed.900' 은 테마 무관.
 */
const TEXT_ON_SURFACE = [
  ['gray.900', 'white'],
  ['gray.700', 'white'],
  ['gray.600', 'white'],
  ['gray.500', 'white'], // 보조 글자의 최저선 — gray-400 은 글자 금지
  ['gray.500', 'gray.50'],
  ['error.600', 'white'],
  ['secondary.600', 'white'],
  ['secondary.600', 'secondary.50'],
  ['success.700', 'white'],
  ['success.700', 'success.50'],
  ['warning.700', 'white'],
  ['warning.800', 'warning.50'],
  ['fixed.900', 'primary.500'], // 라임 버튼 위 글자는 짙게(흰 글자는 1.4:1)
];
const pick = (theme, path) => {
  const [group, step] = path.split('.');
  if (group === 'fixed') return fixed[step];
  return step ? theme[group][step] : theme[group];
};

for (const [name, theme] of [
  ['라이트', light],
  ['다크', dark],
]) {
  test(`${name}: 글자·바탕 조합이 AA(4.5:1) 이상`, () => {
    for (const [fg, bg] of TEXT_ON_SURFACE) {
      const ratio = contrast(pick(theme, fg), pick(theme, bg));
      assert.ok(ratio >= 4.5, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
    }
  });
}

test('린트 정규식은 우회한 클래스만 잡는다', () => {
  const rx = patterns.map((p) => new RegExp(p));
  const flagged = (s) => rx.some((r) => r.test(s));
  for (const bad of [
    'bg-[#EB001C]',
    'hover:bg-[#F5DC3D]',
    'border-t-[#fff]',
    'text-emerald-700',
    'from-sky-50',
    'shadow-blue-500/20',
    'text-[13px]',
    'text-[13.5px]',
    'pc:text-[28px]',
    'rounded-[8px]',
    'rounded-t-[20px]',
    'shadow-[0_2px_12px_rgba(0,0,0,0.08)]',
    'flex text-semibold',
    'rounded-t-5',
    'bg-opacity-90',
  ])
    assert.ok(flagged(bad), `잡혀야 함: ${bad}`);
  for (const good of [
    'bg-error-500 text-13 text-sm text-[44px]',
    'text-success-700 bg-warning-50 bg-kakao text-fixed-white',
    'rounded-lg rounded-2xl rounded-t-sheet rounded-full',
    'shadow-card shadow-highlight shadow-primary-500 shadow-lg',
    'font-semibold text-black bg-black/50',
  ])
    assert.ok(!flagged(good), `잡히면 안 됨: ${good}`);
});

test('cn() 설정: tailwind-merge 가 사용자 정의 값을 색으로 오인해 지우지 않는다', () => {
  // 2026-10-09 회귀 — text-11 이 "글자 색"으로 읽혀 같은 cn() 의 text-gray-500 과 합쳐지며 사라졌다.
  const {extendTailwindMerge} = require('tailwind-merge');
  const tw = extendTailwindMerge(twMergeConfig);
  assert.equal(tw('text-11 font-medium text-success-700'), 'text-11 font-medium text-success-700');
  assert.equal(tw('pc:text-28 text-gray-900'), 'pc:text-28 text-gray-900');
  assert.equal(tw('shadow-highlight shadow-primary-500'), 'shadow-highlight shadow-primary-500');
  assert.equal(tw('rounded-lg rounded-t-sheet'), 'rounded-lg rounded-t-sheet');
  // 같은 종류끼리는 그대로 뒤의 것이 이긴다
  assert.equal(tw('text-sm text-13'), 'text-13');
  assert.equal(tw('shadow-card shadow-lg'), 'shadow-lg');
});

// ── recipes.js(컴포넌트 모양) ────────────────────────────────────────────────
const recipes = require('./recipes.js');

/** 'bg-gray-100' → 그 테마의 hex. 투명도(/80)는 사진 위라 대비를 잴 수 없어 건너뛴다(null). */
const colorOf = (theme, cls, prefix) => {
  const m = new RegExp(`^${prefix}-([a-z]+(?:-(?:[0-9]+|white))?)$`).exec(cls);
  if (!m) return undefined;
  const [name, step] = m[1].split('-');
  const hex =
    name === 'fixed' ? (step === 'white' ? fixed.white : fixed[step]) : step === undefined ? (theme[name] ?? brand[name]) : theme[name]?.[step];
  // 색처럼 생겼는데(gray-100) 토큰에 없으면 오타 — 건너뛰지 말고 실패시킨다. text-xs·text-sm 같은 크기는 색이 아니다.
  if (!hex && step !== undefined) throw new Error(`레시피의 ${cls} 는 토큰에 없는 색`);
  return hex;
};
const pairOf = (theme, {box, text}) => {
  const classes = `${box} ${text}`.split(/\s+/);
  if (classes.some((c) => /^bg-.*\/[0-9]+$/.test(c))) return null;
  // 다크에선 dark: 가 붙은 클래스가 이긴다. hover: 같은 다른 상태는 재지 않는다(colorOf 가 안 읽음).
  const darkOnly = theme === dark ? classes.filter((c) => c.startsWith('dark:')).map((c) => c.slice(5)) : [];
  const color = (prefix) =>
    [...darkOnly, ...classes].map((c) => colorOf(theme, c, prefix)).find(Boolean);
  const bg = color('bg') ?? theme.white;
  const fg = color('text');
  return fg ? [fg, bg] : null;
};
const recipePairs = () => [
  ...Object.entries(recipes.badge.variant).flatMap(([variant, tones]) =>
    Object.entries(tones).map(([tone, r]) => [`badge ${variant}/${tone}`, r]),
  ),
  ['chip selected', recipes.chip.selected],
  ['chip idle', recipes.chip.idle],
  ...['neutral', 'brand', 'segment'].flatMap((v) =>
    ['selected', 'idle'].map((state) => [`tab ${v}/${state}`, recipes.tab[v][state]]),
  ),
  ...Object.entries(recipes.sectionTitle).map(([k, text]) => [`sectionTitle ${k}`, {box: '', text}]),
  ['toast text', {box: recipes.toast.box, text: recipes.toast.text}],
  ['toast action', {box: recipes.toast.box, text: recipes.toast.action}],
  ['emptyText', {box: '', text: recipes.emptyText}],
  ...Object.entries(recipes.cardLabel.tone).map(([tone, r]) => [`cardLabel ${tone}`, r]),
  ['cardLabel strip', recipes.cardLabel.strip],
];

for (const [name, theme] of [
  ['라이트', light],
  ['다크', dark],
]) {
  test(`${name}: 컴포넌트 레시피의 글자·바탕이 AA(4.5:1) 이상`, () => {
    for (const [label, r] of recipePairs()) {
      const pair = pairOf(theme, r);
      if (!pair) continue;
      const ratio = contrast(...pair);
      assert.ok(ratio >= 4.5, `${label}: ${ratio.toFixed(2)}:1`);
    }
  });
}

test('레시피도 린트 규칙을 지킨다(hex·기본 팔레트·임의 크기 없음)', () => {
  const rx = patterns.map((p) => new RegExp(p));
  const all = JSON.stringify(recipes).match(/"[^"{}:,]+"/g).map((s) => s.slice(1, -1));
  for (const cls of all) assert.ok(!rx.some((r) => r.test(cls)), `레시피에 우회 클래스: ${cls}`);
});
