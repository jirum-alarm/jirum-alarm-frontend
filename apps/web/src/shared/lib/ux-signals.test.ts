import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import type { ClickWatchEnv, ElementLike, PageState } from './ux-signals';

const require = createRequire(import.meta.url);
const {
  createRageTracker,
  deviceOf,
  isInteractive,
  pageOf,
  relativePos,
  selectorOf,
  textOf,
  watchClick,
} = require('./ux-signals.ts') as typeof import('./ux-signals');

type FakeInit = {
  tag: string;
  id?: string;
  className?: unknown;
  attrs?: Record<string, string>;
  text?: string;
  editable?: boolean;
};

const el = (init: FakeInit, parent: ElementLike | null = null): ElementLike => ({
  tagName: init.tag.toUpperCase(),
  id: init.id ?? '',
  className: init.className ?? '',
  parentElement: parent,
  getAttribute: (name: string) => init.attrs?.[name] ?? null,
  hasAttribute: (name: string) => init.attrs?.[name] !== undefined,
  isContentEditable: init.editable ?? false,
  innerText: init.text,
});

describe('pageOf — gitops clarity_export.py page_of 와 같은 규칙', () => {
  it('숫자 id·긴 hex·UUID 를 :id 로 접고 쿼리·끝 슬래시를 버린다', () => {
    assert.equal(pageOf('/products/123'), '/products/:id');
    assert.equal(pageOf('/products/123/comment/'), '/products/:id/comment');
    assert.equal(pageOf('/products/123?x=1#a'), '/products/:id');
    assert.equal(pageOf('/m/0123456789abcdef0123'), '/m/:id');
    assert.equal(pageOf('/x/550e8400-e29b-41d4-a716-446655440000/y'), '/x/:id/y');
    assert.equal(pageOf('/'), '/');
    assert.equal(pageOf(''), '/');
  });

  it('짧은 hex·글자 섞인 슬러그는 그대로', () => {
    assert.equal(pageOf('/deals/galaxy-s25'), '/deals/galaxy-s25');
    assert.equal(pageOf('/x/abc123'), '/x/abc123');
  });
});

describe('deviceOf', () => {
  it('768 미만 모바일', () => {
    assert.equal(deviceOf(390), 'mobile');
    assert.equal(deviceOf(767), 'mobile');
    assert.equal(deviceOf(768), 'desktop');
  });
});

describe('isInteractive', () => {
  it('a[href]·button·role 안이면 true(위로 올라가며)', () => {
    const button = el({ tag: 'button' });
    assert.equal(isInteractive(el({ tag: 'svg' }, el({ tag: 'span' }, button))), true);
    assert.equal(isInteractive(el({ tag: 'span' }, el({ tag: 'a', attrs: { href: '/x' } }))), true);
    assert.equal(isInteractive(el({ tag: 'div', attrs: { role: 'tab' } })), true);
    assert.equal(isInteractive(el({ tag: 'div', attrs: { contenteditable: 'true' } })), true);
  });

  it('href 없는 a·일반 div·role=presentation 은 false', () => {
    assert.equal(isInteractive(el({ tag: 'a' })), false);
    assert.equal(isInteractive(el({ tag: 'span' }, el({ tag: 'div' }))), false);
    assert.equal(isInteractive(el({ tag: 'div', attrs: { role: 'presentation' } })), false);
  });
});

describe('selectorOf', () => {
  it('대상 + 위로 최대 3단계, 클래스는 앞 2개', () => {
    const root = el({ tag: 'main', className: 'a b c' });
    const l1 = el({ tag: 'section', className: 'hero' }, root);
    const l2 = el({ tag: 'div', className: 'price box big' }, l1);
    const l3 = el({ tag: 'p' }, l2);
    const target = el({ tag: 'span', className: 'won' }, l3);
    assert.equal(selectorOf(target), 'section.hero > div.price.box > p > span.won');
  });

  it('data-testid·id 조상에서 멈추고 aria-label 을 쓴다', () => {
    const card = el({ tag: 'article', attrs: { 'data-testid': 'deal-card' } }, el({ tag: 'main' }));
    const img = el({ tag: 'img', attrs: { 'aria-label': '상품 사진' } }, card);
    assert.equal(selectorOf(img), 'article[data-testid="deal-card"] > img[aria-label="상품 사진"]');
    const withId = el({ tag: 'span' }, el({ tag: 'div', id: 'chart' }, el({ tag: 'main' })));
    assert.equal(selectorOf(withId), 'div#chart > span');
  });

  it('body 위로는 안 가고, SVG className(객체)은 class 속성으로', () => {
    const body = el({ tag: 'body', className: 'x' });
    const svg = el({ tag: 'svg', className: { baseVal: 'icon' }, attrs: { class: 'icon' } }, body);
    assert.equal(selectorOf(svg), 'svg.icon');
  });

  it('120자를 넘으면 바깥 조각부터 버린다', () => {
    const long = 'x'.repeat(50);
    const a = el({ tag: 'div', className: `${long}1 ${long}2` });
    const b = el({ tag: 'div', className: `${long}3` }, a);
    const target = el({ tag: 'span', className: 'won' }, b);
    const sel = selectorOf(target);
    assert.ok(sel.length <= 120, sel);
    assert.ok(sel.endsWith('span.won'), sel);
  });
});

describe('textOf', () => {
  it('공백을 접고 앞 40자', () => {
    const t = el({ tag: 'div', text: '  최저가\n\n  12,900원   쿠팡 ' + '가'.repeat(60) });
    const out = textOf(t, '/products/1');
    assert.ok(out.startsWith('최저가 12,900원 쿠팡 '), out);
    assert.equal(out.length, 40);
  });

  it('입력칸·편집 영역·내 정보 화면은 읽지 않는다', () => {
    assert.equal(textOf(el({ tag: 'textarea', text: '비밀' }), '/products/1'), '');
    assert.equal(
      textOf(el({ tag: 'span', text: '내가 친 글' }, el({ tag: 'div', editable: true })), '/'),
      '',
    );
    assert.equal(textOf(el({ tag: 'span', text: 'me@x.com' }), '/mypage/account'), '');
    assert.equal(textOf(el({ tag: 'span', text: '로그인' }), '/login'), '');
  });

  it('이메일·긴 숫자는 가린다', () => {
    assert.equal(
      textOf(el({ tag: 'p', text: '문의 a.b@c.com 010-1234-5678' }), '/help'),
      '문의 [email] [num]',
    );
  });
});

describe('relativePos', () => {
  it('요소 안 0~1, 소수 둘째 자리, 밖은 잘라 붙인다', () => {
    assert.deepEqual(relativePos(150, 60, { left: 100, top: 50, width: 200, height: 40 }), {
      x: 0.25,
      y: 0.25,
    });
    assert.deepEqual(relativePos(0, 999, { left: 100, top: 50, width: 200, height: 40 }), {
      x: 0,
      y: 1,
    });
    assert.deepEqual(relativePos(1, 1, { left: 0, top: 0, width: 0, height: 10 }), {});
  });
});

describe('createRageTracker', () => {
  it('1초 안 반경 30px 3회 → 다음 버스트가 시작될 때 rage 한 건(count 전체)', () => {
    const r = createRageTracker<string>();
    assert.equal(r.add({ t: 0, x: 100, y: 100 }, 'a').position, 1);
    assert.equal(r.add({ t: 200, x: 110, y: 105 }, 'b').position, 2);
    assert.equal(r.add({ t: 400, x: 95, y: 98 }, 'c').position, 3);
    assert.equal(r.add({ t: 600, x: 100, y: 100 }, 'd').position, 4);
    const next = r.add({ t: 700, x: 400, y: 400 }, 'z');
    assert.deepEqual(next.closed, { count: 4, first: { t: 0, x: 100, y: 100 }, meta: 'a' });
    assert.equal(next.position, 1);
  });

  it('2회·멀리 떨어진 클릭·느린 클릭은 rage 아님', () => {
    const r = createRageTracker<string>();
    r.add({ t: 0, x: 0, y: 0 }, 'a');
    r.add({ t: 100, x: 0, y: 0 }, 'a');
    assert.equal(r.close(), null);
    r.add({ t: 0, x: 0, y: 0 }, 'a');
    r.add({ t: 100, x: 50, y: 0 }, 'b');
    r.add({ t: 200, x: 0, y: 0 }, 'c');
    assert.equal(r.close(), null);
    // 직전과는 1초 안이지만 3회가 1초 안에 들지 않는다(0·900·1800).
    r.add({ t: 0, x: 0, y: 0 }, 'a');
    r.add({ t: 900, x: 0, y: 0 }, 'a');
    r.add({ t: 1800, x: 0, y: 0 }, 'a');
    assert.equal(r.close(), null);
  });

  it('close 는 남은 버스트를 내보내고 비운다', () => {
    const r = createRageTracker<string>();
    for (const t of [0, 100, 200]) r.add({ t, x: 5, y: 5 }, 'm');
    assert.equal(r.close()?.count, 3);
    assert.equal(r.close(), null);
  });
});

describe('watchClick — 클릭 뒤 1초 동안 변화가 없어야 dead', () => {
  const fakeEnv = (initial: PageState) => {
    let state = { ...initial };
    let onChange: (() => void) | null = null;
    let stopped = false;
    const timers: { at: number; fn: () => void }[] = [];
    let now = 0;
    const env: ClickWatchEnv = {
      state: () => ({ ...state }),
      observe: (cb) => {
        onChange = cb;
        return () => {
          stopped = true;
        };
      },
      schedule: (fn, ms) => timers.push({ at: now + ms, fn }),
    };
    return {
      env,
      set: (patch: Partial<PageState>) => (state = { ...state, ...patch }),
      change: () => onChange?.(),
      advance: (ms: number) => {
        now += ms;
        for (const t of timers.filter((x) => x.at <= now)) {
          timers.splice(timers.indexOf(t), 1);
          t.fn();
        }
      },
      stopped: () => stopped,
    };
  };
  const base: PageState = { url: 'https://x/a', scrollX: 0, scrollY: 0, active: 'body' };

  it('아무 변화 없으면 1000ms 에 dead, 그 전엔 판정하지 않는다', () => {
    const f = fakeEnv(base);
    const results: boolean[] = [];
    watchClick(f.env, (d) => results.push(d));
    f.advance(999);
    assert.deepEqual(results, []);
    f.advance(1);
    assert.deepEqual(results, [true]);
    assert.equal(f.stopped(), true);
  });

  it('DOM 변화(관찰 콜백)가 있으면 dead 아님', () => {
    const f = fakeEnv(base);
    const results: boolean[] = [];
    watchClick(f.env, (d) => results.push(d));
    f.advance(500);
    f.change();
    f.advance(500);
    assert.deepEqual(results, [false]);
  });

  it('URL·스크롤·포커스가 바뀌면 dead 아님', () => {
    for (const patch of [{ url: 'https://x/b' }, { scrollY: 300 }, { active: 'input' }]) {
      const f = fakeEnv(base);
      const results: boolean[] = [];
      watchClick(f.env, (d) => results.push(d));
      f.set(patch);
      f.advance(1000);
      assert.deepEqual(results, [false], JSON.stringify(patch));
    }
  });

  it('pointerdown 때 포커스가 다른 곳이었으면(클릭으로 blur) dead 아님', () => {
    const f = fakeEnv(base);
    const results: boolean[] = [];
    watchClick(f.env, (d) => results.push(d), 'input');
    f.advance(1000);
    assert.deepEqual(results, [false]);
  });
});
