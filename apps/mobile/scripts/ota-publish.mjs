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
 *
 * ★옛 runtime 백포트(origin 에 ota/runtime-<runtime> 이 있으면)는 브랜치 끝을 **먼저 push 해서 차지한 뒤** 발행한다.
 * 2026-10-12 두 번: 발행 직전에 원격을 확인했는데도 `eas update` 가 몇 분 걸리는 사이 다른 세션이 같은 runtime 에
 * 발행해, 늦게 끝난 내 번들이 그 수정을 빼고 덮었다(복구 = 그 group republish). push 는 fast-forward 만 받으니
 * 먼저 push 하면 늦은 쪽이 발행 전에 거절당한다. main 의 runtime 은 브랜치가 없다(CI 자동 OTA 가 낸다) — 건너뛴다.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
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

const git = (...args) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const stop = reason => {
  console.error(`⛔ 발행하지 않았다 — ${reason}`);
  process.exit(1);
};

function claimBackportBranch() {
  const {runtimeVersion} = JSON.parse(
    readFileSync(join(root, 'app.json'), 'utf8'),
  ).expo;
  const branch = `ota/runtime-${runtimeVersion}`;
  if (!git('ls-remote', '--heads', 'origin', branch)) {
    console.log(`ℹ️ origin/${branch} 없음 — 백포트 브랜치 선점은 건너뛴다.`);
    return;
  }

  // 발행 번들은 작업 트리에서 만든다 — 커밋 안 된 변경이 있으면 브랜치 끝과 다른 걸 내보낸다.
  if (
    git(
      'status',
      '--porcelain',
      '--untracked-files=no',
      '--',
      '.',
      '../../packages',
    )
  ) {
    stop(
      '커밋 안 된 변경이 있다(apps/mobile·packages). 커밋하거나 되돌린 뒤 다시.',
    );
  }

  git('fetch', '-q', 'origin', branch);
  const remote = git('rev-parse', 'FETCH_HEAD');
  try {
    git('merge-base', '--is-ancestor', remote, 'HEAD');
  } catch {
    stop(
      `origin/${branch} 에 내 HEAD 에 없는 커밋이 있다 — 다른 세션이 먼저 냈을 수 있다. ` +
        `git rebase FETCH_HEAD 뒤 jest·기동 확인을 다시 하고 발행.`,
    );
  }

  if (remote === git('rev-parse', 'HEAD')) {
    console.log(`✓ origin/${branch} 끝이 이미 HEAD 다.`);
    return;
  }

  // `remote rejected (failure)` 는 가끔 일시적이다(10/12 2회) — 한 번만 다시. fast-forward 거절은 바로 멈춘다.
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync('git', ['push', 'origin', `HEAD:refs/heads/${branch}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      console.log(`✓ origin/${branch} 를 HEAD 로 먼저 올렸다 — 이제 발행한다.`);
      return;
    } catch (error) {
      const out = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      if (attempt >= 2 || /non-fast-forward|fetch first/.test(out)) {
        stop(
          `origin/${branch} push 거절 — 다른 세션이 먼저 올렸다. rebase 뒤 다시.\n${out}`,
        );
      }
    }
  }
}

run('node', ['scripts/native-fingerprint.mjs', '--check']);
claimBackportBranch();
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
