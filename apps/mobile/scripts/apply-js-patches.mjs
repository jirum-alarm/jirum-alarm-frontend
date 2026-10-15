#!/usr/bin/env node
/**
 * js-patches/<패키지>@<버전>.patch 를 설치된 패키지에 적용한다(postinstall).
 *
 * pnpm patchedDependencies 를 안 쓰는 이유: 패치 파일을 pnpm-workspace.yaml 에 걸면 웹·어드민 Docker 이미지의
 * `pnpm install` 이 그 파일을 못 찾아 ENOENT 로 죽는다(Dockerfile 이 patches/ 를 복사하지 않는다, 2026-10-16 실측).
 * patch-package(postinstall 의 앞 단계)가 보는 patches/ 를 안 쓰는 이유: 거긴 네이티브 지문 입력이라
 * JS 만 고쳐도 runtimeVersion 을 올려야 한다. 그래서 여기엔 **JS 파일만** 받는다 — 네이티브는 patches/ 로.
 *
 * 이미 적용됐는지는 고친 파일마다 들어 있는 `[jirum patch]` 주석으로 본다(재설치마다 돌아도 같다).
 * 패키지 버전이 패치와 다르거나 패치가 안 맞으면 설치를 실패시킨다 — 조용히 빠지면 고친 버그가 되살아난다.
 */
import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'js-patches');
const require = createRequire(join(root, 'package.json'));
const MARKER = '[jirum patch]';

function fail(message) {
  console.error(`js-patches: ${message}`);
  process.exit(1);
}

for (const name of readdirSync(dir)
  .filter(f => f.endsWith('.patch'))
  .sort()) {
  const [, pkg, version] = name.match(/^(.+)@([^@]+)\.patch$/) ?? [];
  if (!pkg) fail(`${name}: 파일 이름은 <패키지>@<버전>.patch`);

  const pkgDir = dirname(require.resolve(`${pkg}/package.json`));
  const installed = JSON.parse(
    readFileSync(join(pkgDir, 'package.json'), 'utf8'),
  ).version;
  if (installed !== version) {
    fail(
      `${name}: 설치된 ${pkg} 는 ${installed} — 새 버전 소스에 맞춰 패치를 다시 만들 것(js-patches/README.md)`,
    );
  }

  const patchPath = join(dir, name);
  const files = [
    ...readFileSync(patchPath, 'utf8').matchAll(/^\+\+\+ b\/(\S+)/gm),
  ].map(m => m[1]);
  for (const file of files) {
    if (
      !file.endsWith('.js') ||
      /^(ios|android|React|ReactAndroid|ReactCommon)\//.test(file)
    ) {
      fail(
        `${name}: ${file} — JS 파일만 받는다(네이티브는 patches/ 와 runtimeVersion 올림으로)`,
      );
    }
  }
  if (
    files.every(file =>
      readFileSync(join(pkgDir, file), 'utf8').includes(MARKER),
    )
  )
    continue;

  // pnpm 이 저장소 파일을 하드링크로 깔았을 수 있다(CI 리눅스) — 고치기 전에 사본으로 바꿔 저장소를 건드리지 않는다.
  for (const file of files) {
    const path = join(pkgDir, file);
    const content = readFileSync(path);
    unlinkSync(path);
    writeFileSync(path, content);
  }
  try {
    execFileSync('patch', ['-p1', '-N', '-s', '-d', pkgDir, '-i', patchPath], {
      stdio: 'inherit',
    });
  } catch {
    fail(`${name}: 적용 실패`);
  }
  console.log(`js-patches: ${name} 적용`);
}
