// 브라우저 쪽 UX 신호 수집기 — 판정 규칙은 ux-signals.ts, 받는 쪽은 app/api/ux-signal/route.ts.
// 메모리에 모았다가 10건마다·화면을 떠날 때(visibilitychange hidden·pagehide) sendBeacon 한 번. 실패해도 다시 보내지 않는다.
import { isCrawlerBrowser } from '@/shared/config/user-agent';

import {
  createRageTracker,
  deviceOf,
  FLUSH_EVERY,
  isInteractive,
  MAX_SIGNALS_PER_PAGEVIEW,
  pageOf,
  RAGE_WINDOW_MS,
  relativePos,
  selectorOf,
  textOf,
  type UxSignal,
  watchClick,
} from './ux-signals';

const ENDPOINT = '/api/ux-signal';

let queue: UxSignal[] = [];
let sentPath = '';
let sentOnPath = 0;
let enabled = false;

const viewport = () => {
  const vw = Math.round(window.innerWidth);
  return { vw, dev: deviceOf(vw) };
};

const flush = () => {
  if (queue.length === 0) return;
  const body = JSON.stringify(queue);
  queue = [];
  try {
    navigator.sendBeacon(ENDPOINT, body);
  } catch {
    // 보내기 실패는 버린다 — 수집기가 사용자 화면을 방해하면 안 된다.
  }
};

/** 한 화면(경로)당 30건까지. 클라이언트 이동으로 경로가 바뀌면 다시 센다. */
const push = (signal: UxSignal) => {
  if (!enabled) return;
  const path = window.location.pathname;
  if (path !== sentPath) {
    sentPath = path;
    sentOnPath = 0;
  }
  if (sentOnPath >= MAX_SIGNALS_PER_PAGEVIEW) return;
  sentOnPath += 1;
  queue.push(signal);
  // 화면이 이미 숨은 뒤 들어온 것(INP·CLS 는 숨을 때 확정된다)은 바로 보낸다 — 우리 hidden 핸들러가 먼저 돌았을 수 있다.
  if (queue.length >= FLUSH_EVERY || document.visibilityState === 'hidden') flush();
};

type ClickMeta = Omit<UxSignal, 't'>;

const describe = (target: Element, event: MouseEvent): ClickMeta => {
  const pathname = window.location.pathname;
  return {
    page: pageOf(pathname),
    el: selectorOf(target),
    txt: textOf(target as HTMLElement, pathname),
    interactive: isInteractive(target),
    ...viewport(),
    ...relativePos(event.clientX, event.clientY, target.getBoundingClientRect()),
  };
};

const pageState = () => ({
  url: window.location.href,
  scrollX: Math.round(window.scrollX),
  scrollY: Math.round(window.scrollY),
  active: document.activeElement,
});

// 클릭 뒤 변화 관찰 — DOM(MutationObserver)·안쪽 스크롤·포커스 이동·창 숨김(새 창·앱 전환)·blur(새 탭).
const observeChanges = (onChange: () => void) => {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  const opts = { capture: true, passive: true } as const;
  document.addEventListener('scroll', onChange, opts);
  document.addEventListener('focusin', onChange, opts);
  document.addEventListener('visibilitychange', onChange, opts);
  window.addEventListener('blur', onChange, opts);
  window.addEventListener('popstate', onChange, opts);
  return () => {
    mo.disconnect();
    document.removeEventListener('scroll', onChange, opts);
    document.removeEventListener('focusin', onChange, opts);
    document.removeEventListener('visibilitychange', onChange, opts);
    window.removeEventListener('blur', onChange, opts);
    window.removeEventListener('popstate', onChange, opts);
  };
};

const startClickWatch = () => {
  const rage = createRageTracker<ClickMeta>();
  let rageTimer: ReturnType<typeof setTimeout> | undefined;
  let activeAtPointerDown: unknown;

  const emitRage = (burst: ReturnType<typeof rage.close>) => {
    if (burst) push({ t: 'rage_click', ...burst.meta, count: burst.count });
  };

  document.addEventListener(
    'pointerdown',
    () => {
      activeAtPointerDown = document.activeElement;
    },
    { capture: true, passive: true },
  );

  document.addEventListener(
    'click',
    (event) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const meta = describe(event.target, event);
      const { closed, position } = rage.add(
        { t: event.timeStamp, x: event.clientX, y: event.clientY },
        meta,
      );
      emitRage(closed);
      clearTimeout(rageTimer);
      rageTimer = setTimeout(() => emitRage(rage.close()), RAGE_WINDOW_MS + 50);
      // 연타의 두 번째부터는 dead 로 따로 세지 않는다(rage 한 건으로 묶인다).
      if (position > 1) return;
      // 키보드로 누른 클릭(detail 0)엔 pointerdown 이 없다 — 지난 포인터의 포커스 값을 쓰지 않는다.
      const focusBefore = event.detail > 0 ? activeAtPointerDown : undefined;
      activeAtPointerDown = undefined;
      watchClick(
        {
          state: pageState,
          observe: observeChanges,
          schedule: (fn, ms) => window.setTimeout(fn, ms),
        },
        (dead) => {
          if (dead) push({ t: 'dead_click', ...meta });
        },
        focusBefore,
      );
    },
    { capture: true, passive: true },
  );

  const leave = () => {
    emitRage(rage.close());
    flush();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') leave();
  });
  window.addEventListener('pagehide', leave);
};

type VitalLike = { name: string; value: number; rating: string; navigationType: string };

const seenVitals = new Set<string>();

/** 웹 바이탈 한 건 — 지표마다 페이지 로드당 1회(같은 이름 두 번째부터 버림). CLS 는 1000 배 정수(GA4 쪽과 같은 단위). */
export const recordUxVital = (metric: VitalLike, landingPath: string, target?: string) => {
  if (seenVitals.has(metric.name)) return;
  seenVitals.add(metric.name);
  push({
    t: 'vital',
    page: pageOf(landingPath),
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    nav: metric.navigationType,
    ...(target ? { el: target.slice(0, 120) } : {}),
    ...viewport(),
  });
};

const isAutomated = () => navigator.webdriver === true || isCrawlerBrowser();

/** 루트에서 한 번. 봇·자동화 브라우저는 켜지 않고, 프리렌더 중이면 사용자가 실제로 열 때까지 기다린다. */
export const installUxSignals = () => {
  if (enabled || typeof navigator.sendBeacon !== 'function' || isAutomated()) return;
  const start = () => {
    enabled = true;
    startClickWatch();
  };
  const doc = document as Document & { prerendering?: boolean };
  if (doc.prerendering) {
    doc.addEventListener('prerenderingchange', start, { once: true });
  } else {
    start();
  }
};
