import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { jsonLdHtml } = require('./json-ld.ts') as typeof import('./json-ld');

describe('jsonLdHtml', () => {
  it('제목에 </script> 가 있어도 스크립트를 닫지 못한다', () => {
    const { __html } = jsonLdHtml({ name: '특가</script><script>alert(1)</script>' });
    assert.ok(!__html.includes('</script'));
    assert.ok(!__html.includes('<'));
  });

  it('파싱하면 원래 값 그대로', () => {
    const data = { '@type': 'Product', name: '<b>콜라</b> 24캔', offers: { price: 12900 } };
    assert.deepEqual(JSON.parse(jsonLdHtml(data).__html), data);
  });
});
