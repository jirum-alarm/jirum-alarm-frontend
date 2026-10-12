import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// 배지 기준 문장은 web·앱이 각자 들고 있다(서버 hot-deal-criteria.ts 가 원본). 한쪽만 고치면 같은 배지를
// 플랫폼마다 다르게 설명하게 된다 — 두 파일의 short·title·detail 문자열이 순서까지 같아야 한다.
const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const strings = (src: string) =>
  [...src.matchAll(/\b(short|title|detail):\s*'([^']+)'/g)].map((m) => `${m[1]}=${m[2]}`);

describe('배지 기준 문구 — web·앱 일치', () => {
  it('세 배지의 short·title·detail 이 같다', () => {
    const web = strings(read('./hotdeal.ts'));
    const app = strings(read('../../../../mobile/src/shared/components/product/HotdealBadge.tsx'));
    assert.equal(web.length, 9);
    assert.deepEqual(app, web);
  });
});
