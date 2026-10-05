import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { resolveEntry } = require('./entry.ts') as typeof import('./entry');

const base = { prevPath: null, search: '', referrer: '', ownHost: 'jirum-alarm.com' };

describe('resolveEntry', () => {
  it('앱 안 이동이면 이전 경로', () => {
    assert.equal(
      resolveEntry({ ...base, prevPath: '/search', search: '?utm_source=kakao' }),
      'path:/search',
    );
  });

  it('첫 페이지면 utm > 외부 referrer > direct', () => {
    assert.equal(
      resolveEntry({ ...base, search: '?utm_source=kakao', referrer: 'https://www.google.com/' }),
      'utm:kakao',
    );
    assert.equal(
      resolveEntry({ ...base, referrer: 'https://www.google.com/' }),
      'ref:www.google.com',
    );
    assert.equal(resolveEntry(base), 'direct');
  });

  it('우리 도메인 referrer(새로고침 이동)는 이전 경로로', () => {
    assert.equal(
      resolveEntry({ ...base, referrer: 'https://jirum-alarm.com/trending?x=1' }),
      'path:/trending',
    );
  });
});
