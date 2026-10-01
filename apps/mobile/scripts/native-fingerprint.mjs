#!/usr/bin/env node
/**
 * 네이티브 지문 — "이 JS 를 지금 스토어 바이너리에 OTA 로 보내도 되나" 를 기계가 판정한다.
 *
 * OTA 는 runtimeVersion 이 같은 바이너리에만 간다. 네이티브(ios/·android/·네이티브 패키지·
 * app.json 플러그인)가 바뀌었는데 runtimeVersion 을 그대로 두면, 새 네이티브를 기대하는 JS 가
 * 옛 바이너리에 꽂혀 **실행 즉시 죽는다**. 이 레포는 bare 라 runtimeVersion 이 리터럴이고
 * 올리는 건 사람 몫이었다 — 그 기억을 이 스크립트가 대신한다.
 *
 *   node scripts/native-fingerprint.mjs --check   # CI: 기준과 다르면 실패(무엇이 바뀌었는지 출력)
 *   node scripts/native-fingerprint.mjs --write   # runtimeVersion 을 올린 커밋에서 기준을 새로 찍는다
 *
 * 입력:
 *  - git 이 추적하는 ios/·android/ 파일 내용(Podfile.lock 포함 — iOS 전이 의존까지 덮는다)
 *  - 네이티브 코드를 가진 직접 의존성의 설치 버전(ios/·android/·podspec·expo-module.config.json)
 *  - patches/ 와 app.json(버전 필드 제외)
 *
 * ponytail: @expo/fingerprint 대신 직접 센다 — 그쪽은 실행 환경(CI·로컬)에 따라 해시가 흔들려
 * 오탐으로 자동 배포를 멈출 수 있다. 여기 입력은 git 추적 파일 + 설치 버전뿐이라 어디서 돌려도 같다.
 * 전이 의존 중 Android 전용 네이티브 변경은 못 본다(드묾) — 보이면 입력에 추가.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = join(root, 'native-fingerprint.json');
const require = createRequire(join(root, 'package.json'));
const sha = buf => createHash('sha1').update(buf).digest('hex').slice(0, 12);

function collect() {
  const inputs = {};

  const tracked = execFileSync('git', ['ls-files', 'ios', 'android', 'patches'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean);
  for (const file of tracked) {
    inputs[`file:${file}`] = sha(readFileSync(join(root, file)));
  }

  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  // 버전은 runtimeVersion 을 올릴 때 같이 바뀐다 — 그 자체는 네이티브 변경이 아니다.
  delete app.expo.version;
  delete app.expo.runtimeVersion;
  delete app.expo.ios?.buildNumber;
  delete app.expo.android?.versionCode;
  inputs['app.json'] = sha(JSON.stringify(app));

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const name of Object.keys(pkg.dependencies ?? {}).sort()) {
    let dir;
    try {
      dir = dirname(require.resolve(`${name}/package.json`));
    } catch {
      continue; // exports 가 package.json 을 막는 패키지 — 네이티브 모듈은 전부 노출한다.
    }
    const entries = readdirSync(dir);
    const isNative =
      entries.includes('ios') ||
      entries.includes('android') ||
      entries.includes('expo-module.config.json') ||
      entries.some(e => e.endsWith('.podspec'));
    if (!isNative) continue;
    const {version} = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    inputs[`dep:${name}`] = version;
  }

  return {runtimeVersion: pkgRuntime(), inputs};
}

function pkgRuntime() {
  return JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo.runtimeVersion;
}

function diff(a, b) {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  return keys.filter(k => a[k] !== b[k]).map(k => {
    if (!(k in a)) return `  + ${k}`;
    if (!(k in b)) return `  - ${k}`;
    return `  ~ ${k}  ${a[k]} → ${b[k]}`;
  });
}

const mode = process.argv[2];
const current = collect();

if (mode === '--write') {
  writeFileSync(baselinePath, JSON.stringify(current, null, 2) + '\n');
  console.log(
    `native-fingerprint: runtime ${current.runtimeVersion} 기준을 찍었어요 (${relative(process.cwd(), baselinePath)}).`,
  );
  process.exit(0);
}

if (mode !== '--check') {
  console.error('사용법: native-fingerprint.mjs --check | --write');
  process.exit(2);
}

if (!existsSync(baselinePath)) {
  console.error('native-fingerprint: 기준 파일이 없어요 — --write 로 먼저 찍으세요.');
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const changed = diff(baseline.inputs, current.inputs);
const runtimeChanged = baseline.runtimeVersion !== current.runtimeVersion;

if (changed.length === 0 && !runtimeChanged) {
  console.log(`native-fingerprint: runtime ${current.runtimeVersion} 그대로 — OTA 안전.`);
  process.exit(0);
}

if (changed.length > 0 && !runtimeChanged) {
  console.error(
    [
      `native-fingerprint: 네이티브가 바뀌었는데 runtimeVersion 은 ${current.runtimeVersion} 그대로예요.`,
      '이대로 OTA 를 내면 옛 바이너리에 새 네이티브를 기대하는 JS 가 꽂혀 실행 즉시 죽어요.',
      '바뀐 것:',
      ...changed,
      '',
      '→ 버전·runtimeVersion 을 올리고(app.json·Expo.plist·strings.xml 등, ota-updates-config 테스트가 정렬을 본다)',
      '  같은 커밋에서 `pnpm --filter mobile native:write` 로 기준을 새로 찍은 뒤 스토어 빌드를 내세요.',
    ].join('\n'),
  );
  process.exit(1);
}

// runtimeVersion 을 올렸는데 기준을 안 찍었다 — 새 바이너리의 기준이 없으면 다음 변경을 못 잡는다.
console.error(
  `native-fingerprint: runtimeVersion 이 ${baseline.runtimeVersion} → ${current.runtimeVersion} 로 바뀌었어요. ` +
    '`pnpm --filter mobile native:write` 로 기준을 같이 커밋하세요.',
);
process.exit(1);
