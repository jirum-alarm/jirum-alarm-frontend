import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { searchHref } = require('./search-href.ts') as typeof import('./search-href');

const keywordOf = (href: string) =>
  new URL(href, 'https://jirum-alarm.com').searchParams.get('keyword');

describe('searchHref', () => {
  it('특수문자가 든 검색어도 그대로 돌아온다', () => {
    for (const keyword of ['M&M', 'C#', 'a+b', '100%', '아이폰 16 프로', '삼성/LG', '?=']) {
      assert.equal(keywordOf(searchHref(keyword)), keyword);
    }
  });

  it('앞뒤 공백은 버린다', () => {
    assert.equal(searchHref('  햇반 '), `/search?keyword=${encodeURIComponent('햇반')}`);
  });
});
