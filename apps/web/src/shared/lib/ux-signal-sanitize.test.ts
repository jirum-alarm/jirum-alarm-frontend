import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { sanitizeUxSignals, uaInfoOf } =
  require('./ux-signal-sanitize.ts') as typeof import('./ux-signal-sanitize');

const body = (v: unknown) => JSON.stringify(v);

describe('sanitizeUxSignals', () => {
  it('dead·rage·vital 을 통과시키고 모르는 키는 버린다', () => {
    const out = sanitizeUxSignals(
      body([
        {
          t: 'dead_click',
          page: '/products/:id',
          el: 'div.price > span',
          txt: '12,900원',
          interactive: false,
          vw: 390.4,
          dev: 'mobile',
          x: 0.5,
          y: 0.25,
          cookie: 'secret',
          value: 'nope',
        },
        { t: 'rage_click', page: '/', el: 'img', count: 4, dev: 'desktop', vw: 1440 },
        { t: 'vital', page: '/', name: 'LCP', value: 1234.6, rating: 'good', nav: 'navigate' },
      ]),
    );
    assert.deepEqual(out, [
      {
        t: 'dead_click',
        page: '/products/:id',
        dev: 'mobile',
        vw: 390,
        el: 'div.price > span',
        txt: '12,900원',
        interactive: false,
        x: 0.5,
        y: 0.25,
      },
      { t: 'rage_click', page: '/', dev: 'desktop', vw: 1440, el: 'img', count: 4 },
      { t: 'vital', page: '/', name: 'LCP', value: 1235, rating: 'good', nav: 'navigate' },
    ]);
  });

  it('필수 값이 틀린 건은 통째로 버리고 나머지는 남긴다', () => {
    const out = sanitizeUxSignals(
      body([
        { t: 'hack', page: '/' },
        { t: 'dead_click', page: 'products' },
        { t: 'vital', page: '/', name: 'XYZ', value: 1 },
        { t: 'vital', page: '/', name: 'INP', value: -1 },
        { t: 'rage_click', page: '/', count: 2 },
        'string',
        null,
        { t: 'dead_click', page: '/ok' },
      ]),
    );
    assert.deepEqual(out, [{ t: 'dead_click', page: '/ok' }]);
  });

  it('길이 상한·범위 밖 숫자·제어 문자', () => {
    const [s] = sanitizeUxSignals(
      body([
        { t: 'dead_click', page: '/', el: 'e'.repeat(500), txt: 'a\nb'.repeat(30), x: 2, vw: -5 },
      ]),
    );
    assert.equal((s.el as string).length, 120);
    assert.equal((s.txt as string).length, 40);
    assert.ok(!(s.txt as string).includes('\n'));
    assert.equal(s.x, undefined);
    assert.equal(s.vw, undefined);
  });

  it('배열이 아니거나 30건 초과·16KB 초과·깨진 JSON 은 빈 배열', () => {
    assert.deepEqual(sanitizeUxSignals(body({ t: 'dead_click', page: '/' })), []);
    assert.deepEqual(sanitizeUxSignals(body(Array(31).fill({ t: 'dead_click', page: '/' }))), []);
    assert.deepEqual(
      sanitizeUxSignals(body([{ t: 'dead_click', page: `/${'a'.repeat(17000)}` }])),
      [],
    );
    assert.deepEqual(sanitizeUxSignals('{not json'), []);
    assert.deepEqual(sanitizeUxSignals(''), []);
  });
});

describe('uaInfoOf', () => {
  it('기기·브라우저를 나눈다', () => {
    assert.deepEqual(
      uaInfoOf(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.0',
      ),
      { ua_dev: 'mobile', br: 'kakao' },
    );
    assert.deepEqual(
      uaInfoOf(
        'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.8.1)',
      ),
      { ua_dev: 'mobile', br: 'naver' },
    );
    assert.deepEqual(
      uaInfoOf(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
      ),
      { ua_dev: 'desktop', br: 'chrome' },
    );
    assert.deepEqual(
      uaInfoOf(
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ),
      { ua_dev: 'tablet', br: 'safari' },
    );
    assert.equal(uaInfoOf('Mozilla/5.0 IOS ReactNative Webview Jirum Alarm').br, 'app');
  });
});
