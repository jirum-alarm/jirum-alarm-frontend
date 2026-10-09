import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { partialGraphqlData } =
  require('./graphql-partial.ts') as typeof import('./graphql-partial');

describe('partialGraphqlData', () => {
  it('2026-10-09 /deals 500 모양 — errors 와 함께 온 목록을 꺼낸다', () => {
    const error = {
      name: 'FetchError',
      data: {
        errors: [
          {
            message: 'Int cannot represent non-integer value: 219.76',
            path: ['publishedModelPages', 29, 'activePrice'],
          },
        ],
        data: {
          publishedModelPages: [
            { slug: 'a', activePrice: 13900 },
            { slug: 'b', activePrice: null },
          ],
        },
      },
    };
    const data = partialGraphqlData<{ publishedModelPages: { slug: string }[] }>(error);
    assert.equal(data?.publishedModelPages.length, 2);
  });

  it('data 가 null 까지 번졌거나(non-null 필드 실패) 오류 모양이 아니면 null — 호출부가 던진다', () => {
    assert.equal(partialGraphqlData({ data: { errors: [{}], data: null } }), null);
    assert.equal(partialGraphqlData(new Error('network')), null);
    assert.equal(partialGraphqlData(undefined), null);
  });
});
