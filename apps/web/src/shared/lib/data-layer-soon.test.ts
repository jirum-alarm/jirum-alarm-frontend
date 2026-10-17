import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

const require = createRequire(import.meta.url);
const { pushDataLayerSoon } = require('./data-layer-soon.ts') as typeof import('./data-layer-soon');

type FakeWindow = EventTarget & {
  dataLayer: Record<string, unknown>[];
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
};
type FakeDocument = EventTarget & { visibilityState: DocumentVisibilityState };

const g = globalThis as unknown as { window?: FakeWindow; document?: FakeDocument };
let win: FakeWindow;
let doc: FakeDocument;

const hide = () => {
  doc.visibilityState = 'hidden';
  doc.dispatchEvent(new Event('visibilitychange'));
};

describe('pushDataLayerSoon', () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ['setTimeout'] });
    win = Object.assign(new EventTarget(), {
      dataLayer: [] as Record<string, unknown>[],
      setTimeout: ((fn: () => void, ms?: number) => setTimeout(fn, ms)) as typeof setTimeout,
      clearTimeout: ((id: ReturnType<typeof setTimeout>) =>
        clearTimeout(id)) as typeof clearTimeout,
    });
    doc = Object.assign(new EventTarget(), {
      visibilityState: 'visible' as DocumentVisibilityState,
    });
    g.window = win;
    g.document = doc;
  });

  afterEach(() => {
    mock.timers.reset();
    delete g.window;
    delete g.document;
  });

  it('클릭 처리 중에는 넣지 않고 다음 태스크에 한 번 넣는다', () => {
    pushDataLayerSoon({ event: 'purchase_link_click' });
    assert.equal(win.dataLayer.length, 0);
    mock.timers.tick(0);
    assert.deepEqual(win.dataLayer, [{ event: 'purchase_link_click' }]);
    hide();
    assert.equal(win.dataLayer.length, 1);
  });

  it('타이머 전에 페이지가 숨으면(새 창) 그 순간 넣고 타이머로 또 넣지 않는다', () => {
    pushDataLayerSoon({ event: 'purchase_link_click' });
    hide();
    assert.equal(win.dataLayer.length, 1);
    mock.timers.tick(0);
    assert.equal(win.dataLayer.length, 1);
  });

  it('pagehide(같은 창 이동)에도 바로 넣는다', () => {
    pushDataLayerSoon({ event: 'purchase_link_click' });
    win.dispatchEvent(new Event('pagehide'));
    assert.equal(win.dataLayer.length, 1);
    mock.timers.tick(0);
    assert.equal(win.dataLayer.length, 1);
  });
});
