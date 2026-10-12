// expo-doctor 를 돌리되 알려진 두 가지(react 중복·SDK 패치 드리프트)만 통과시킨다.
// 모노레포가 node-linker=hoisted 라 루트 react(web 의 19.3)와 앱 react(RN 이 정한 버전)가 갈려서,
// RN 라이브러리마다 앱 react 사본이 중첩 설치된다. react 는 네이티브 코드가 없어 네이티브 빌드에 무해하고
// Metro 번들엔 한 벌만 들어간다. 다른 패키지가 중복되거나 다른 체크가 실패하면 그대로 실패한다.
import { spawnSync } from 'node:child_process';

const { status, stdout, stderr } = spawnSync('npx', ['expo-doctor'], { encoding: 'utf8' });
const out = stdout + stderr;
process.stdout.write(out);
if (status === 0) process.exit(0);

const failed = [...out.matchAll(/^✖ (.+)$/gm)].map((m) => m[1]);
const duplicated = [...out.matchAll(/Found duplicates for (\S+):/g)].map((m) => m[1]);

const DUPLICATE_CHECK = 'Check that no duplicate dependencies are installed';
const VERSION_CHECK = 'Check that packages match versions required by installed Expo SDK';

// react 중복 — hoisted 모노레포의 알려진 현상(위 주석).
const reactDuplicateOnly = duplicated.length > 0 && duplicated.every((name) => name === 'react');

// SDK 패치 버전 드리프트 — Expo 가 패치를 내면 그날부터 모든 커밋이 빨갛다(2026-08-18·10-12 두 번).
// 그런데 expo-updates 처럼 네이티브가 있는 패키지를 올리면 네이티브 지문이 바뀌어 스토어 빌드(runtime 올림)가 필요하다
// — 이미 빌드한 버전(10/12 1.5.1)이면 그것 때문에 다음 버전을 또 내야 한다. 그래서 **패치만** 어긋난 건 경고로 넘기고,
// 패키지는 다음 네이티브 묶음 때 `npx expo install --check` 로 함께 올린다. 마이너·메이저가 어긋나면 그대로 실패.
const versionSection =
  out.split(`✖ ${VERSION_CHECK}`)[1]?.split(/\n✖ |\n\d+ checks? failed/)[0] ?? '';
const mismatchHeaders = [...versionSection.matchAll(/(\w+) version mismatches/g)].map((m) => m[1]);
const patchDriftOnly = mismatchHeaders.length > 0 && mismatchHeaders.every((h) => h === 'Patch');

const tolerated = failed.filter(
  (name) =>
    (name === DUPLICATE_CHECK && reactDuplicateOnly) || (name === VERSION_CHECK && patchDriftOnly),
);

if (failed.length > 0 && tolerated.length === failed.length) {
  if (failed.includes(DUPLICATE_CHECK)) {
    console.log('\nexpo-doctor: react 중복만 실패 — hoisted 모노레포의 알려진 현상이라 통과로 본다.');
  }
  if (failed.includes(VERSION_CHECK)) {
    console.log(
      '\n⚠️ expo-doctor: SDK 패치 버전만 뒤처짐 — 통과로 본다. 다음 네이티브 묶음(runtime 올림) 때 `npx expo install --check` 로 올릴 것.',
    );
  }
  process.exit(0);
}
process.exit(status ?? 1);
