import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// 검색 목록 queryKey 에 칩 변수(categoryIds·providerIds)가 들어가야 한다 — 변수만 바꾸고 키에서 빼면
// React Query 가 같은 캐시를 재사용해 칩만 바뀌고 목록은 그대로다. (전엔 앱 테스트가 이 web 파일을 읽어 봤다.)
const source = readFileSync(new URL('./product.queries.ts', import.meta.url), 'utf8');

test('검색 목록 queryKey 에 categoryIds·providerIds 가 들어간다', () => {
  assert.match(source, /categoryIds: variables\.categoryIds/);
  assert.match(source, /providerIds: variables\.providerIds/);
});
