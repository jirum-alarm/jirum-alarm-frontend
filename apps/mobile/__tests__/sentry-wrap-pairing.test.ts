export {};

/**
 * Sentry 의 `init` 과 `wrap` 은 **같은 조건으로 켜고 꺼야 한다.**
 *
 * 🔴실제 사고(2026-08-26 확인): `initSentry()` 는 DSN 이 없으면 early return 하는데
 * `Sentry.wrap(App)` 은 **무조건** 실행되고 있었다. 그런데 이 레포엔
 * `EXPO_PUBLIC_SENTRY_DSN` 이 eas.json 에도 EAS 환경변수에도 **없다** →
 * 릴리스 빌드가 "init 안 된 채 wrap 만 걸린" 상태로 나갔고, 앱 시작 계측이
 * 받아줄 클라이언트를 못 찾는다:
 *   `App Start Span could not be finished. Sentry.wrap was called before Sentry.init`
 *
 * ⚠️이 결함은 tsc·lint·기존 테스트를 **전부 통과했다**(문법은 멀쩡하다).
 * 그래서 "두 호출의 조건이 같은가"를 소스 구조로 고정한다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const app = read('App.tsx');
const sentry = read('src/shared/lib/monitoring/sentry.ts');

/** 주석을 걷어낸 코드 — 주석이 함수명을 언급해서 substring 검사가 오염된다. */
const code = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('★init 과 wrap 은 짝이다', () => {
  it('App.tsx 가 Sentry.wrap 을 직접 부르지 않는다', () => {
    // 직접 부르면 init 여부와 무관하게 걸린다 — 그게 이번 사고였다.
    expect(code(app)).not.toMatch(/Sentry\.wrap\s*\(/);
  });

  it('대신 조건을 아는 wrapApp 을 쓴다', () => {
    expect(code(app)).toMatch(/wrapApp\s*\(\s*App\s*\)/);
  });

  it('wrapApp 은 isEnabled 가 false 면 원본을 그대로 돌려준다', () => {
    const body = code(sentry).slice(
      code(sentry).indexOf('export function wrapApp'),
    );
    expect(body).toMatch(/if\s*\(\s*!isEnabled\(\)\s*\)\s*return\s+app/);
  });

  it('initSentry 도 같은 isEnabled 게이트를 쓴다', () => {
    const body = code(sentry).slice(
      code(sentry).indexOf('export function initSentry'),
    );
    expect(body).toMatch(/if\s*\(\s*!isEnabled\(\)/);
  });

  /**
   * DSN 이 있어야 init 이 도는 구조이므로, DSN 이 사라지면 조용히 꺼진다.
   * 그 자체는 의도된 설계(no-op)지만 **wrap 까지 같이 꺼져야** 안전하다.
   */
  it('isEnabled 는 DSN 존재 + 프로덕션을 함께 본다', () => {
    expect(code(sentry)).toMatch(
      /isEnabled\s*=\s*\(\)\s*=>[\s\S]{0,80}SENTRY_DSN/,
    );
    expect(code(sentry)).toMatch(/__DEV__/);
  });
});
