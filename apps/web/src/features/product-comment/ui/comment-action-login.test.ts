import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * 댓글 좋아요·대댓글 — 비로그인이 눌러도 «아무 일 없음»이 되지 않게(Clarity dead click 1위 화면, 2026-10-20).
 * 예전엔 비로그인에 disabled 라 클릭이 버튼에 닿지도 않아 안내 토스트가 절대 안 떴다.
 * 실제 클릭 → 로그인 모달은 운영 빌드 헤드리스로 확인했다(브라우저 테스트는 화면 하네스 몫). 여기선 회귀만 막는다.
 */
const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'CommentAction.tsx'),
  'utf8',
);

test('비로그인이라고 버튼을 막지 않는다(disabled 금지)', () => {
  assert.doesNotMatch(src, /disabled=\{!isUserLogin\}/);
});

test('비로그인 클릭은 로그인 안내로 — 좋아요·대댓글 둘 다', () => {
  assert.match(src, /useRedirectIfNotLoggedIn/);
  const like = src.slice(src.indexOf('const handleLike'), src.indexOf('const handleReply'));
  const reply = src.slice(src.indexOf('const handleReply'), src.indexOf('const isReply'));
  for (const [name, body] of [
    ['좋아요', like],
    ['대댓글', reply],
  ]) {
    assert.match(
      body,
      /if \(!isUserLogin\) \{\s*promptLogin\(\);\s*return;/,
      `${name}: 비로그인 분기`,
    );
  }
});
