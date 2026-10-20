import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * web 토스트 계약 — 앱 showToast 와 같은 종류·같은 머무는 시간·스크린리더.
 * (전엔 앱 테스트 design-system-component-parity 가 이 파일들을 경로로 읽어 대조했다 — web 쪽 규칙은 web 에, 2026-10-20)
 */
const here = dirname(fileURLToPath(import.meta.url));
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const webSrc = join(here, '../../../..');

test('success·error·info 와 동작 버튼이 있고, 성공·실패를 아이콘으로 가른다', () => {
  const store = read('useToast.tsx');
  assert.match(store, /success:/);
  assert.match(store, /error:/);
  assert.match(store, /action\?: ToastAction/);
  const toaster = read('Toaster.tsx');
  assert.ok(toaster.includes('SuccessIcon'));
  assert.ok(toaster.includes('ErrorIcon'));
});

test('머무는 시간은 디자인 시스템 layout.duration(앱과 같은 값) — 숫자를 다시 적지 않는다', () => {
  const store = read('useToast.tsx');
  assert.ok(store.includes('layout.duration.toast'));
  assert.ok(store.includes('layout.duration.toastWithAction'));
  assert.doesNotMatch(store, /VISIBLE(?:_WITH_ACTION)?_MS = \d/);
});

test('스크린리더가 읽는다(앱 accessibilityLiveRegion 과 같게)', () => {
  assert.match(read('Toast.tsx'), /aria-live="polite"/);
});

test('실패 문구에 성공 아이콘이 붙지 않는다(호출부 전체)', () => {
  const files = (readdirSync(webSrc, { recursive: true }) as string[]).filter(
    (f) => /\.(ts|tsx)$/.test(f) && !/\.test\.ts$/.test(f),
  );
  assert.ok(files.length > 300, `web 소스 스캔이 비었다(${files.length})`);
  const offenders = files.flatMap((f) =>
    readFileSync(join(webSrc, f), 'utf8')
      .split('\n')
      .filter((l) => /toast\.success\(/.test(l) && /실패|에러|오류/.test(l))
      .map((l) => `${f}: ${l.trim()}`),
  );
  assert.deepEqual(offenders, []);
});
