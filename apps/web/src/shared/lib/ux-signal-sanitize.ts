// /api/ux-signal 이 받은 본문 검증 — 브라우저가 보낸 값은 아무나 위조할 수 있으니 로그에 쓰기 전에 키·타입·길이를 다시 본다.
// 모르는 키는 버리고, 필수 값이 틀린 건은 통째로 버린다. 순수 로직(node --test).

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_SIGNALS = 30;

const TYPES = new Set(['dead_click', 'rage_click', 'vital']);
const VITALS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']);
const RATINGS = new Set(['good', 'needs-improvement', 'poor']);
const DEVICES = new Set(['mobile', 'desktop']);

export type SanitizedSignal = Record<string, string | number | boolean>;

const str = (v: unknown, max: number) =>
  typeof v === 'string' && v.length > 0 ? v.slice(0, max) : undefined;
const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : undefined;
const oneOf = (v: unknown, set: Set<string>) =>
  typeof v === 'string' && set.has(v) ? v : undefined;
// 로그 한 줄을 깨거나 다른 줄인 척하는 제어 문자는 공백으로.
// eslint-disable-next-line no-control-regex -- 제어 문자를 지우는 게 목적이다
const clean = (v: string | undefined) => v?.replace(/[\u0000-\u001f\u007f]/g, ' ');

const sanitizeOne = (raw: unknown): SanitizedSignal | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const t = oneOf(r.t, TYPES);
  const page = clean(str(r.page, 200));
  if (!t || !page?.startsWith('/')) return null;

  const out: SanitizedSignal = { t, page };
  const put = (key: string, value: string | number | boolean | undefined) => {
    if (value !== undefined) out[key] = value;
  };
  put('dev', oneOf(r.dev, DEVICES));
  put('vw', num(r.vw, 0, 10000) !== undefined ? Math.round(r.vw as number) : undefined);
  put('el', clean(str(r.el, 120)));

  if (t === 'vital') {
    const name = oneOf(r.name, VITALS);
    const value = num(r.value, 0, 600000);
    if (!name || value === undefined) return null;
    put('name', name);
    put('value', Math.round(value));
    put('rating', oneOf(r.rating, RATINGS));
    put('nav', clean(str(r.nav, 24)));
    return out;
  }

  put('txt', clean(str(r.txt, 40)));
  put('interactive', typeof r.interactive === 'boolean' ? r.interactive : undefined);
  put('x', num(r.x, 0, 1));
  put('y', num(r.y, 0, 1));
  if (t === 'rage_click') {
    const count = num(r.count, 3, 100);
    if (count === undefined) return null;
    put('count', Math.round(count));
  }
  return out;
};

/** 본문 문자열 → 통과한 신호들. JSON 이 아니거나 배열이 아니거나 너무 크면 빈 배열. */
export const sanitizeUxSignals = (body: string): SanitizedSignal[] => {
  if (body.length === 0 || new TextEncoder().encode(body).length > MAX_BODY_BYTES) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed) || parsed.length > MAX_SIGNALS) return [];
  return parsed.map(sanitizeOne).filter((s): s is SanitizedSignal => s !== null);
};

/** 서버가 UA 로 본 기기·브라우저 구분 — 화면 폭(dev)과 따로 싣는다(태블릿·PC 좁은 창을 가른다). */
export const uaInfoOf = (ua: string): { ua_dev: string; br: string } => {
  const ua_dev = /iPad|Tablet/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|Android/i.test(ua)
      ? 'mobile'
      : 'desktop';
  const br = /Webview Jirum Alarm/i.test(ua)
    ? 'app'
    : /KAKAOTALK/i.test(ua)
      ? 'kakao'
      : /NAVER/i.test(ua)
        ? 'naver'
        : /SamsungBrowser/i.test(ua)
          ? 'samsung'
          : /Whale/i.test(ua)
            ? 'whale'
            : /CriOS|Chrome\//i.test(ua)
              ? 'chrome'
              : /Safari/i.test(ua)
                ? 'safari'
                : 'other';
  return { ua_dev, br };
};
