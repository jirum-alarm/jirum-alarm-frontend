import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const m = require('./kakao-app-open.ts') as typeof import('./kakao-app-open');

const memory = () => {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
};

const base = {
  on: true,
  kakaoInApp: true,
  jirumApp: false,
  platform: 'ios' as const,
  path: '/products/123',
  search: '',
};

describe('shouldAutoOpen', () => {
  it('켠 기기·카톡 인앱·앱 화면에서만', () => {
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on' }), true);
    assert.equal(m.shouldAutoOpen({ ...base, pref: null }), false); // 묻기 전엔 안 튕긴다
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'off' }), false);
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', on: false }), false);
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', kakaoInApp: false }), false);
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', jirumApp: true }), false);
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', platform: null }), false); // PC 카톡
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', path: '/beauty/1' }), false); // 앱이 안 그리는 화면
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', path: '/' }), false);
  });

  it('앱을 못 찾고 돌아온 페이지에선 다시 튕기지 않는다', () => {
    assert.equal(m.shouldAutoOpen({ ...base, pref: 'on', search: '?kakao_app=missing' }), false);
  });
});

describe('shouldInvite', () => {
  it('정하지 않은 기기에 한 번만', () => {
    const storage = memory();
    const args = { ...base, pref: null, storage, firstVisitDone: true };
    assert.equal(m.shouldInvite(args), true);
    // 첫 방문 시트가 뜨는 방문엔 겹치지 않게 미룬다
    assert.equal(m.shouldInvite({ ...args, firstVisitDone: false }), false);
    m.markInvited(storage);
    assert.equal(m.shouldInvite(args), false);
    assert.equal(m.shouldInvite({ ...args, storage: memory(), pref: 'off' }), false);
  });
});

describe('appOpenUrl', () => {
  it('iOS 는 앱 스킴(쿼리에 출처·게스트)', () => {
    assert.equal(
      m.appOpenUrl(
        'ios',
        '/products/123?x=1',
        'kakao_auto',
        'https://jirum-alarm.com',
        'abcdef01-2345-6789',
      ),
      'jirumalarm:///products/123?handoff=kakao_auto&gd=abcdef01-2345-6789',
    );
  });

  it('안드로이드는 우리 앱 지정 intent, 못 찾으면 이 페이지 + kakao_app=missing', () => {
    const url = m.appOpenUrl('android', '/products/123', 'kakao_auto', 'https://jirum-alarm.com');
    assert.match(
      url,
      /^intent:\/\/\/products\/123\?handoff=kakao_auto#Intent;scheme=jirumalarm;package=com\.solcode\.jirmalam;/,
    );
    const fallback = decodeURIComponent(url.match(/S\.browser_fallback_url=([^;]+)/)![1]);
    assert.equal(fallback, 'https://jirum-alarm.com/products/123?kakao_app=missing');
  });

  it('외부 주소·이상한 기기 id 는 싣지 않는다', () => {
    assert.equal(m.appOpenUrl('ios', '//evil.com/x', 's', 'o'), 'jirumalarm:///?handoff=s');
    assert.equal(
      m.appOpenUrl('ios', '/products/1', 's', 'o', 'x&y=1'),
      'jirumalarm:///products/1?handoff=s',
    );
  });
});

describe('iOS 실패 학습', () => {
  it('연속 두 번 안 열리면 끈다, 한 번 열리면 센 것을 지운다', () => {
    const storage = memory();
    m.writePref(storage, 'on');
    assert.equal(m.recordIosFailure(storage), false);
    m.recordOpenSuccess(storage);
    assert.equal(m.recordIosFailure(storage), false);
    assert.equal(m.readPref(storage), 'on');
    assert.equal(m.recordIosFailure(storage), true);
    assert.equal(m.readPref(storage), 'off');
  });

  it('저장소가 없거나 던져도 죽지 않는다', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    assert.equal(m.readPref(broken), null);
    m.writePref(broken, 'on');
    assert.equal(m.readPref(null), null);
  });
});
