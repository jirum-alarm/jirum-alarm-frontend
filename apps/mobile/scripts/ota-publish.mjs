#!/usr/bin/env node
/**
 * OTA 발행 한 줄 — 지문 확인 → production 채널 eas update → Sentry 소스맵 업로드.
 *
 *   pnpm ota:publish "메시지"
 *
 * 소스맵이 없으면 Sentry 에 쌓인 크래시 스택이 압축된 번들 좌표라 어느 파일 몇 번째 줄인지 못 읽는다.
 * 토큰(SENTRY_AUTH_TOKEN)은 EAS production env 에 sensitive 로 있다 — `eas env:exec` 로 이 과정에만
 * 꺼내 쓴다(파일·셸에 남기지 않는다). 업로드가 실패해도 발행은 이미 끝났으니 경고만 하고 넘어간다.
 *
 * ★발행 전 기동 확인(AGENTS.md §Mobile App)은 이 스크립트가 대신하지 않는다.
 */
import {execFileSync} from 'node:child_process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('사용법: pnpm ota:publish "무엇을 내보내는지 한 줄"');
  process.exit(2);
}

const run = (cmd, args) =>
  execFileSync(cmd, args, {cwd: root, stdio: 'inherit'});

run('node', ['scripts/native-fingerprint.mjs', '--check']);
run('npx', [
  'eas',
  'update',
  '--channel',
  'production',
  '--environment',
  'production',
  '--non-interactive',
  '--message',
  message,
]);

try {
  run('npx', [
    'eas',
    'env:exec',
    'production',
    // bare 라 업로드 스크립트가 app.json 플러그인 설정을 못 읽는다 — org·project·url **셋 다** 줘야 한다
    // (하나라도 비면 플러그인 설정을 읽으러 갔다가 exit 1 — 10/1 0f059bf6 업로드가 이걸로 실패).
    'SENTRY_ORG=jirumalarm SENTRY_PROJECT=jirum-alarm-app SENTRY_URL=https://sentry.io/ npx sentry-expo-upload-sourcemaps dist',
  ]);
} catch {
  console.warn(
    '⚠️ Sentry 소스맵 업로드 실패 — 발행은 끝났다. SENTRY_AUTH_TOKEN(EAS production, sensitive)을 확인하고' +
      ' `npx eas env:exec production "SENTRY_ORG=jirumalarm SENTRY_PROJECT=jirum-alarm-app SENTRY_URL=https://sentry.io/ npx sentry-expo-upload-sourcemaps dist"` 로 다시 올린다.',
  );
}
