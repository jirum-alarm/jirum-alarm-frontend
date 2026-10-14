import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { kakaoBridgeApplies, markKakaoBridgeSeen, seenKakaoBridgeToday } =
  require('./kakao-bridge.ts') as typeof import('./kakao-bridge');

describe('kakaoBridgeApplies', () => {
  it('카톡 인앱이고 우리 앱이 아니고 켜져 있을 때만', () => {
    assert.equal(kakaoBridgeApplies({ kakaoInApp: true, jirumApp: false, on: true }), true);
    assert.equal(kakaoBridgeApplies({ kakaoInApp: true, jirumApp: false, on: false }), false);
    assert.equal(kakaoBridgeApplies({ kakaoInApp: false, jirumApp: false, on: true }), false);
    // 우리 앱 웹뷰는 이미 앱이다
    assert.equal(kakaoBridgeApplies({ kakaoInApp: true, jirumApp: true, on: true }), false);
  });
});

describe('하루 한 번', () => {
  it('KST 날짜가 바뀌면 다시 보인다', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    const night = new Date('2026-10-14T14:30:00Z'); // KST 10/14 23:30
    assert.equal(seenKakaoBridgeToday(storage, night), false);
    markKakaoBridgeSeen(storage, night);
    assert.equal(seenKakaoBridgeToday(storage, night), true);
    assert.equal(seenKakaoBridgeToday(storage, new Date('2026-10-14T15:30:00Z')), false); // KST 10/15 00:30
  });

  it('저장소가 없거나 던지면 보여 준다', () => {
    assert.equal(seenKakaoBridgeToday(null), false);
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    assert.equal(seenKakaoBridgeToday(broken), false);
  });
});
