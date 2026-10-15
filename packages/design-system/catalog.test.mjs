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
    .map((f) => readFileSync(join(dir, String(f)), 'utf8').match(/title:\s*'([^']+)'/)?.[1])
    .filter(Boolean);

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
