/**
 * 문구·상호작용 규칙(writing.js)이 잡을 것만 잡는지 — 선택자 문법이 틀리면 ESLint 가 규칙째 버려 조용히 통과한다.
 *   node --test packages/design-system
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {test} from 'node:test';

const require = createRequire(import.meta.url);
const {Linter} = require('eslint');
const {rules} = require('./eslint.js');

const linter = new Linter();
const lint = (code) =>
  linter
    .verify(code, {languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}}, rules})
    .filter((m) => m.message.includes('문구·흐름 규칙'));

test('화면 글자의 합니다체·「실패했어요」·「에러」·수동형·지나친 높임·기다림 글자를 잡는다', () => {
  for (const bad of [
    "toast('저장했습니다.')",
    "toast.error('키워드 저장에 실패했어요.')",
    'toast.error(`${name} 로그인에 실패했어요`)',
    "toast.error('저장 중 에러가 생겼어요')",
    "toast.success('게시글이 삭제되었어요.')",
    "const t = '삭제하시겠어요?'",
    "const t = '지금 핫딜보다 다나와가 더 쌉니다.'",
    'const a = <p>상품이 없습니다.</p>;',
    'const a = <div>불러오는 중...</div>;',
    "window.confirm('알림을 모두 삭제할까요?')",
    "Alert.alert('작성 중인 글이 있어요')",
  ]) {
    assert.equal(lint(bad).length, 1, bad);
  }
});

test('해요체·버튼 안 진행 글자·개발자 글자·검색 설명·화면 읽기 라벨은 통과한다', () => {
  for (const ok of [
    "toast.error('키워드를 저장하지 못했어요. 다시 시도해 주세요.')",
    "toast.success('글을 삭제했어요.')",
    "const t = '알림을 모두 삭제할까요?'",
    'const a = <button>등록 중…</button>;',
    "console.error('로그인 에러:', e)",
    "throw new Error('Kakao SDK가 초기화되지 않았습니다.')",
    "export const metadata = {description: '인기 상품을 모았습니다.'}",
    'const a = <div aria-label="불러오는 중" />;',
    'const a = <View accessibilityLabel="상품 정보를 불러오는 중" />;',
    'confirm(next)',
  ]) {
    assert.equal(lint(ok).length, 0, ok);
  }
});
