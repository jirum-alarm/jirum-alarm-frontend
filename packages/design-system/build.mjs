#!/usr/bin/env node
/**
 * tokens.js → theme.css (Tailwind v4 용). 토큰을 고쳤으면 이걸 돌려 theme.css 를 같이 커밋한다.
 *
 *   node build.mjs          # theme.css 를 다시 쓴다
 *   node build.mjs --check  # 커밋된 theme.css 가 tokens.js 와 다르면 실패(pre-commit·테스트)
 *
 * web 의 `--color-*` 는 hex 그대로 둔다 — SVG 속성에 `var(--color-gray-500)` 를 직접 넣는 곳이 있어
 * 앱처럼 'R G B' 로 바꾸면 그 자리가 깨진다.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {light, dark, fixed, brand, fontSize, radius, shadow} = require('./tokens.js');

/** {white: '#..', gray: {50: '#..'}} → [['white', '#..'], ['gray-50', '#..'], ...] */
const flat = (palette) =>
  Object.entries(palette).flatMap(([name, value]) =>
    typeof value === 'string' ? [[name, value]] : Object.entries(value).map(([step, hex]) => [`${name}-${step}`, hex]),
  );

const decl = (prefix, entries) => entries.map(([k, v]) => `  --${prefix}-${k}: ${v.toLowerCase()};`);

export function render() {
  const lightColors = flat(light);
  const darkColors = Object.fromEntries(flat(dark));
  // 다크에서 값이 바뀌는 것만 덮어쓴다(같은 값을 다시 적으면 어느 쪽이 정본인지 흐려진다).
  const darkOverrides = lightColors.filter(([k, v]) => darkColors[k].toLowerCase() !== v.toLowerCase()).map(([k]) => [k, darkColors[k]]);

  return [
    '/* 생성 파일 — 손으로 고치지 말 것. 원본은 tokens.js, 다시 만들기: pnpm --filter @jirum/design-system build */',
    '',
    '@theme {',
    ...decl('color', lightColors),
    '',
    '  /* 테마와 무관하게 고정 — 다크에서도 같아야 하는 자리(색 배지 위 흰 글자, 라임 버튼 위 짙은 글자, 사진 위 배지) */',
    ...decl('color', flat({fixed})),
    '',
    ...decl('color', flat(brand)),
    '',
    '  /* 사이 글자 크기 — 줄높이는 비워 둔다(부모·leading-* 를 따른다) */',
    ...decl('text', Object.entries(fontSize)),
    '',
    ...decl('radius', Object.entries(radius)),
    '',
    ...decl('shadow', Object.entries(shadow)),
    '}',
    '',
    '/* 다크 = 클래스는 그대로, 같은 변수의 값만 바꾼다. web 은 <html class="dark">(사용자 설정)일 때만 켜진다. */',
    'html.dark {',
    ...decl('color', darkOverrides),
    '}',
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = new URL('./theme.css', import.meta.url);
  const next = render();
  if (process.argv.includes('--check')) {
    if (readFileSync(out, 'utf8') !== next) {
      console.error('theme.css 가 tokens.js 와 다릅니다 → pnpm --filter @jirum/design-system build 후 같이 커밋하세요.');
      process.exit(1);
    }
  } else {
    writeFileSync(out, next);
  }
}
