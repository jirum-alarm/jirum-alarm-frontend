import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { monotonePath, niceTicks } = require('./price-chart.ts') as typeof import('./price-chart');

// 2026-10-11 감자면 1개월: 4,750원 4일 → 4,250원. Catmull-Rom 은 마지막 4,750 뒤에서 위로 솟아 "더 비쌌던 날"을 그렸다.
test('monotonePath — 평평하다 뚝 떨어져도 제어점이 구간 밖으로 안 나간다', () => {
  const pts = [
    { x: 0, y: 100 },
    { x: 10, y: 100 },
    { x: 20, y: 100 },
    { x: 30, y: 100 },
    { x: 40, y: 200 },
    { x: 50, y: 200 },
  ];
  const segs = [...monotonePath(pts).matchAll(/C (\S+) (\S+), (\S+) (\S+),/g)];
  assert.equal(segs.length, pts.length - 1);
  segs.forEach((m, i) => {
    const lo = Math.min(pts[i].y, pts[i + 1].y);
    const hi = Math.max(pts[i].y, pts[i + 1].y);
    for (const c of [Number(m[2]), Number(m[4])]) {
      assert.ok(c >= lo - 1e-9 && c <= hi + 1e-9, `구간 ${i} 제어점 ${c} 가 ${lo}~${hi} 밖`);
    }
  });
});

test('niceTicks — 4,082~4,919 축은 떨어지는 값 3~5개', () => {
  const { step, prices } = niceTicks(4082, 4919);
  assert.ok(prices.length >= 3 && prices.length <= 5);
  for (const p of prices) {
    assert.ok(p >= 4082 && p <= 4919);
    assert.equal(p % step, 0);
  }
});
