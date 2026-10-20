// 요소 단위 UX 마찰 신호(dead click·rage click)의 판정 규칙 — DOM 설치는 ux-signals-client.ts.
//
// ★왜(2026-10-21): Clarity Data Export API 는 페이지 단위 집계만 주고 «어느 요소인지»는 로그인한 Clarity 화면에서만 보인다.
// 상품 상세에서 dead click 이 가장 많은데(10/20 이틀 250건) 무엇을 눌렀는지 몰라 고칠 수 없었다. 그래서 브라우저가 직접
// 판정해 /api/ux-signal 로 보내고, 웹 서버가 한 줄 JSON 으로 stdout 에 쓴다(→ Loki, `|= "ux_signal" | json`).
//
// 이 파일은 DOM 전역을 만지지 않는 순수 로직이다(node --test 로 그대로 돈다). 요소는 필요한 속성만 가진 ElementLike 로 받는다.

type UxSignalType = 'dead_click' | 'rage_click' | 'vital';
type UxDevice = 'mobile' | 'desktop';

export type UxSignal = {
  t: UxSignalType;
  page: string;
  dev: UxDevice;
  vw: number;
  el?: string;
  txt?: string;
  interactive?: boolean;
  count?: number;
  x?: number;
  y?: number;
  name?: string;
  value?: number;
  rating?: string;
  nav?: string;
};

/** 클릭 뒤 이 시간 동안 아무 변화가 없으면 dead — Clarity 의 «클릭 뒤 반응 없음»과 같은 정의. */
const DEAD_CLICK_WINDOW_MS = 1000;
/** 1초 안에, 첫 클릭 반경 30px 안에서 3번 이상 = rage. */
export const RAGE_WINDOW_MS = 1000;
const RAGE_RADIUS_PX = 30;
const RAGE_MIN_CLICKS = 3;
export const MAX_SIGNALS_PER_PAGEVIEW = 30;
export const FLUSH_EVERY = 10;
const EL_MAX = 120;
const TXT_MAX = 40;

// gitops apps/seo-watch clarity_export.py 의 page_of 와 같은 규칙 — 숫자 id·16자 이상 hex·UUID 를 :id 로 접는다.
// 두 수집 경로의 page 가 같아야 Clarity 집계와 이 신호를 page 로 붙여 볼 수 있다.
const ID_SEGMENT = /\/(\d+|[0-9a-f]{16,}|[0-9a-f-]{36})(?=\/|$)/g;

export const pageOf = (pathname: string): string => {
  const path = (pathname.split(/[?#]/)[0] || '/').replace(ID_SEGMENT, '/:id');
  return path.replace(/\/+$/, '') || '/';
};

export const deviceOf = (viewportWidth: number): UxDevice =>
  viewportWidth < 768 ? 'mobile' : 'desktop';

// 내 정보가 화면 글자로 보이는 곳(닉네임·이메일·내 키워드·알림함) — 여기선 요소 글자를 싣지 않는다.
const PRIVATE_TEXT_PAGES = ['/mypage', '/login', '/signup', '/alarm', '/like'];

const isPrivateTextPage = (pathname: string) =>
  PRIVATE_TEXT_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** 판정에 필요한 만큼만 — 테스트는 이 모양의 객체를 만들어 넣는다. */
export type ElementLike = {
  tagName: string;
  id?: string;
  className?: unknown;
  parentElement: ElementLike | null;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  isContentEditable?: boolean;
  innerText?: string;
  textContent?: string | null;
};

const INTERACTIVE_TAGS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'SUMMARY']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'tab', 'checkbox', 'switch']);

const isInteractiveNode = (el: ElementLike) => {
  const tag = el.tagName.toUpperCase();
  if (INTERACTIVE_TAGS.has(tag)) return true;
  if (tag === 'A' && el.hasAttribute('href')) return true;
  if (INTERACTIVE_ROLES.has(el.getAttribute('role') ?? '')) return true;
  if (el.hasAttribute('onclick')) return true;
  const editable = el.getAttribute('contenteditable');
  return editable !== null && editable !== 'false';
};

/**
 * 대화형 요소 안인가(위로 올라가며). React onClick 은 DOM 속성으로 안 보여 false 가 틀릴 수 있다 —
 * 그래서 dead 판정은 이 값이 아니라 «클릭 뒤 변화 없음»으로 하고, 이건 보조 필드로만 싣는다.
 */
export const isInteractive = (el: ElementLike | null): boolean => {
  for (let cur = el; cur; cur = cur.parentElement) {
    if (isInteractiveNode(cur)) return true;
  }
  return false;
};

const isTextEntry = (el: ElementLike | null): boolean => {
  for (let cur = el; cur; cur = cur.parentElement) {
    const tag = cur.tagName.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || cur.isContentEditable) {
      return true;
    }
  }
  return false;
};

const classesOf = (el: ElementLike): string[] => {
  // SVG 요소의 className 은 문자열이 아니라 SVGAnimatedString 이다.
  const raw = typeof el.className === 'string' ? el.className : el.getAttribute('class');
  return (raw ?? '').split(/\s+/).filter(Boolean);
};

const partOf = (el: ElementLike): { part: string; anchored: boolean } => {
  const tag = el.tagName.toLowerCase();
  const testId = el.getAttribute('data-testid');
  if (testId) return { part: `${tag}[data-testid="${testId}"]`, anchored: true };
  if (el.id) return { part: `${tag}#${el.id}`, anchored: true };
  const label = el.getAttribute('aria-label');
  if (label) return { part: `${tag}[aria-label="${label.slice(0, 30)}"]`, anchored: false };
  const cls = classesOf(el).slice(0, 2);
  return { part: cls.length ? `${tag}.${cls.join('.')}` : tag, anchored: false };
};

/**
 * 짧은 선택자 — 대상 + 위로 최대 3단계. id·data-testid 가 있는 조상에서 멈춘다(그 위는 정보가 없다).
 * 120자를 넘으면 바깥 조각부터 버린다(안쪽이 실제로 누른 것).
 */
export const selectorOf = (el: ElementLike): string => {
  const parts: string[] = [];
  for (let cur: ElementLike | null = el, depth = 0; cur && depth <= 3; cur = cur.parentElement) {
    const tag = cur.tagName.toUpperCase();
    if (tag === 'BODY' || tag === 'HTML') break;
    const { part, anchored } = partOf(cur);
    parts.unshift(part);
    if (anchored) break;
    depth += 1;
  }
  while (parts.length > 1 && parts.join(' > ').length > EL_MAX) parts.shift();
  return parts.join(' > ').slice(0, EL_MAX);
};

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const LONG_DIGITS = /\d[\d -]{8,}\d/g;

/** 요소 글자 앞 40자. 입력칸·편집 영역은 절대 읽지 않는다(value·사용자가 친 글). 이메일·긴 숫자는 가린다. */
export const textOf = (el: ElementLike, pathname: string): string => {
  if (isPrivateTextPage(pathname) || isTextEntry(el)) return '';
  const raw = el.innerText ?? el.textContent ?? '';
  return raw
    .slice(0, 400)
    .replace(EMAIL, '[email]')
    .replace(LONG_DIGITS, '[num]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, TXT_MAX);
};

/** 요소 안 상대 위치(0~1, 소수 둘째 자리). 크기가 0 이면 싣지 않는다. */
export const relativePos = (
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x?: number; y?: number } => {
  if (!(rect.width > 0 && rect.height > 0)) return {};
  const clamp = (v: number) => Math.min(1, Math.max(0, Math.round(v * 100) / 100));
  return {
    x: clamp((clientX - rect.left) / rect.width),
    y: clamp((clientY - rect.top) / rect.height),
  };
};

type ClickPoint = { t: number; x: number; y: number };

type RageBurst<T> = { count: number; first: ClickPoint; meta: T };

/**
 * 연타 묶기. 클릭이 버스트 첫 클릭 반경 30px 안이고 직전 클릭과 1초 안이면 같은 버스트로 잇는다.
 * 버스트가 끝날 때(다른 곳 클릭·close) 그 안에 «1초 안 3회»가 한 번이라도 있었으면 rage 한 건(count = 전체 클릭 수).
 */
export const createRageTracker = <T>() => {
  let clicks: ClickPoint[] = [];
  let meta: T | null = null;

  const qualifies = () =>
    clicks.some(
      (c, i) =>
        i + RAGE_MIN_CLICKS - 1 < clicks.length &&
        clicks[i + RAGE_MIN_CLICKS - 1].t - c.t <= RAGE_WINDOW_MS,
    );

  const close = (): RageBurst<T> | null => {
    const burst =
      clicks.length >= RAGE_MIN_CLICKS && qualifies() && meta !== null
        ? { count: clicks.length, first: clicks[0], meta }
        : null;
    clicks = [];
    meta = null;
    return burst;
  };

  return {
    /** 새 클릭을 넣는다. 이전 버스트가 이 클릭으로 끝났으면 그 rage 를 돌려준다. `position` = 이 클릭의 버스트 안 순번(1부터). */
    add(point: ClickPoint, clickMeta: T): { closed: RageBurst<T> | null; position: number } {
      const first = clicks[0];
      const last = clicks[clicks.length - 1];
      const joins =
        first &&
        last &&
        point.t - last.t <= RAGE_WINDOW_MS &&
        Math.hypot(point.x - first.x, point.y - first.y) <= RAGE_RADIUS_PX;
      const closed = joins ? null : close();
      if (!joins) meta = clickMeta;
      clicks.push(point);
      return { closed, position: clicks.length };
    },
    /** 마지막 클릭 뒤 1초가 지났거나 페이지를 떠날 때. */
    close,
  };
};

/** 클릭 순간과 판정 순간의 화면 상태 — 다르면 클릭이 무언가를 바꾼 것. */
export type PageState = { url: string; scrollX: number; scrollY: number; active: unknown };

export type ClickWatchEnv = {
  state(): PageState;
  /** 변화 감지 시작(DOM 변화·안쪽 스크롤·포커스 이동·창 숨김/새 창). 멈추는 함수를 돌려준다. */
  observe(onChange: () => void): () => void;
  schedule(fn: () => void, ms: number): unknown;
};

/**
 * dead 판정: 클릭 직후 관찰을 시작해 1초 뒤 ① DOM 변화 ② URL 변화 ③ 스크롤 변화 ④ 포커스 이동 ⑤ 새 창(창 숨김·blur)이
 * 하나도 없었으면 done(true). 관찰은 capture 단계 click 에서 시작하므로 React onClick(버블)이 바꾼 DOM 도 잡힌다.
 * `before.active` 는 pointerdown 때 값을 넘긴다 — 포커스는 click 이 아니라 mousedown 에 옮겨 가기 때문이다.
 */
export const watchClick = (
  env: ClickWatchEnv,
  done: (dead: boolean) => void,
  activeAtPointerDown?: unknown,
) => {
  const before = env.state();
  if (activeAtPointerDown !== undefined) before.active = activeAtPointerDown;
  let changed = false;
  const stop = env.observe(() => {
    changed = true;
  });
  env.schedule(() => {
    stop();
    const after = env.state();
    const moved =
      after.url !== before.url ||
      after.scrollX !== before.scrollX ||
      after.scrollY !== before.scrollY ||
      after.active !== before.active;
    done(!changed && !moved);
  }, DEAD_CLICK_WINDOW_MS);
};
