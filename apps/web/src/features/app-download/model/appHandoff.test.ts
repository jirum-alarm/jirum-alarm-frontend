import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  androidOpenAppUrl,
  appHandoffHref,
  iosOpenAppUrl,
  normalizeHandoffPath,
  playStoreUrl,
  readHandoffHash,
} = require('./appHandoff.ts') as typeof import('./appHandoff');

/** 크롬이 intent:// 를 푸는 방식대로 나눈다 — `#Intent;` 앞은 데이터 주소, 뒤는 key=value. */
const parseIntent = (href: string) => {
  const [data, extras] = href.split('#Intent;');
  const fields = Object.fromEntries(
    extras
      .replace(/;end$/, '')
      .split(';')
      .map((kv) => [kv.slice(0, kv.indexOf('=')), kv.slice(kv.indexOf('=') + 1)]),
  );
  return { data: data.replace(/^intent:\/\//, ''), fields };
};

test('안드로이드: 앱이 있으면 같은 상품을 https 로, 우리 앱에만 연다', () => {
  const { data, fields } = parseIntent(androidOpenAppUrl('/products/123', 'detail_header'));
  assert.equal(
    `${fields.scheme}://${data}`,
    'https://www.jirum-alarm.com/products/123?handoff=detail_header',
  );
  assert.equal(fields.package, 'com.solcode.jirmalam');
});

test('안드로이드: 앱이 없으면 Play 로 — referrer 에 출처와 보던 경로가 실린다', () => {
  const { fields } = parseIntent(
    androidOpenAppUrl('/products/123?utm_source=x#frag', 'first_visit_detail'),
  );
  const fallback = new URL(decodeURIComponent(fields['S.browser_fallback_url']));
  assert.equal(fallback.host, 'play.google.com');
  assert.equal(fallback.searchParams.get('id'), 'com.solcode.jirmalam');
  // Play 는 referrer 값(한 번 디코드된 문자열)을 앱에 그대로 넘긴다.
  const referrer = new URLSearchParams(fallback.searchParams.get('referrer') ?? '');
  assert.equal(referrer.get('utm_source'), 'jirum_web');
  assert.equal(referrer.get('utm_medium'), 'first_visit_detail');
  assert.equal(referrer.get('utm_campaign'), 'app_handoff');
  assert.equal(referrer.get('jirum_path'), '/products/123');
});

test('Play referrer 는 이중 인코딩되지 않는다', () => {
  const url = new URL(playStoreUrl('banner'));
  assert.equal(
    url.searchParams.get('referrer'),
    'utm_source=jirum_web&utm_medium=banner&utm_campaign=app_handoff&jirum_path=%2F',
  );
});

test('iOS: 유니버설 링크 경로는 www(다른 도메인)로 + 해시 표시', () => {
  assert.equal(
    iosOpenAppUrl('/products/123', 'detail_header'),
    'https://www.jirum-alarm.com/products/123#handoff=detail_header',
  );
  assert.equal(
    iosOpenAppUrl('/community/80', 'detail_header'),
    'https://www.jirum-alarm.com/community/80#handoff=detail_header',
  );
});

test('iOS: AASA 범위 밖(홈·알림)은 유니버설 링크가 안 되니 App Store 로', () => {
  assert.equal(iosOpenAppUrl('/', 'banner'), null);
  assert.equal(iosOpenAppUrl('/alarm', 'alarm_tab'), null);
  // 접두사만 같은 경로에 속지 않는다.
  assert.equal(iosOpenAppUrl('/productsearch', 'banner'), null);
  assert.match(
    appHandoffHref('apple', '/', 'banner', { iosUniversalLink: true }),
    /^https:\/\/apps\.apple\.com\//,
  );
});

test('iOS: 「App Store」 버튼(기본)은 상품 경로여도 스토어 직행 — 앱 없는 다수에게 우회를 만들지 않는다', () => {
  assert.match(
    appHandoffHref('apple', '/products/1', 'first_visit_detail'),
    /^https:\/\/apps\.apple\.com\//,
  );
  assert.equal(
    appHandoffHref('apple', '/products/1', 'detail_header', { iosUniversalLink: true }),
    'https://www.jirum-alarm.com/products/1#handoff=detail_header',
  );
});

test('안드로이드는 옵션과 무관하게 intent', () => {
  assert.match(
    appHandoffHref('android', '/', 'banner'),
    /^intent:\/\/www\.jirum-alarm\.com\/\?handoff=banner#Intent;/,
  );
});

test('외부 주소·프로토콜 상대 주소는 홈으로 접는다(남의 주소를 앱·스토어에 싣지 않는다)', () => {
  assert.equal(normalizeHandoffPath('https://evil.com/x'), '/');
  assert.equal(normalizeHandoffPath('//evil.com/x'), '/');
  assert.equal(normalizeHandoffPath('/products/1?a=b'), '/products/1');
});

test('도착 해시 읽기 — 정확한 모양만', () => {
  assert.equal(readHandoffHash('#handoff=detail_header'), 'detail_header');
  assert.equal(readHandoffHash('#comments'), null);
  assert.equal(readHandoffHash(''), null);
  assert.equal(readHandoffHash('#handoff=<script>'), null);
});
