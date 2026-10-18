import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { kstDate, seasonStatus } =
  require('./season-calendar.ts') as typeof import('./season-calendar');

const at = (iso: string) => Date.parse(iso);

describe('seasonStatus — 허브 머리의 «지금» 한 줄', () => {
  it('광군제 전엔 KST 날짜로 D-day 를 센다', () => {
    assert.deepEqual(seasonStatus(at('2026-10-19T06:00:00+09:00')), {
      label: '광군제(11/11)까지 D-23',
      live: false,
    });
    // KST 자정 직전(UTC 로는 같은 날)이라도 KST 날짜 기준
    assert.equal(seasonStatus(at('2026-11-10T23:59:00+09:00')).label, '광군제(11/11)까지 D-1');
  });

  it('구간별 문구', () => {
    assert.equal(seasonStatus(at('2026-11-11T00:00:00+09:00')).live, true);
    assert.match(seasonStatus(at('2026-11-15T12:00:00+09:00')).label, /^광군제 진행 중/);
    assert.match(seasonStatus(at('2026-11-20T00:00:00+09:00')).label, /^블랙프라이데이/);
    assert.match(seasonStatus(at('2026-12-04T00:00:00+09:00')).label, /^12\.12/);
    assert.match(seasonStatus(at('2026-12-12T23:00:00+09:00')).label, /^12\.12/);
    assert.deepEqual(seasonStatus(at('2026-12-13T00:00:00+09:00')), {
      label: '2026 시즌이 끝났어요',
      live: false,
    });
  });

  it('kstDate 는 UTC 15시에 날짜가 넘어간다', () => {
    assert.equal(kstDate(at('2026-11-10T14:59:59Z')), '2026-11-10');
    assert.equal(kstDate(at('2026-11-10T15:00:00Z')), '2026-11-11');
  });
});
