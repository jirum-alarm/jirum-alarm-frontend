import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// 「최근에 카카오으로 로그인했어요」 — 라벨 셋(카카오·네이버·이메일) 모두 "으로" 가 틀렸다(2026-10-15).
describe('로그인 모달 — 최근 로그인 방법 문구', () => {
  const src = readFileSync(new URL('./LoginModal.tsx', import.meta.url), 'utf8');

  it('조사까지 적은 문구 — 카카오로·네이버로·이메일로', () => {
    assert.match(src, /kakao: '카카오로'/);
    assert.match(src, /naver: '네이버로'/);
    assert.match(src, /email: '이메일로'/);
  });

  it('라벨 뒤에 조사를 이어 붙이지 않는다', () => {
    assert.doesNotMatch(src, /\}으로 로그인/);
    assert.doesNotMatch(src, /\}로 로그인/);
  });
});
