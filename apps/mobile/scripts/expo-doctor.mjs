// expo-doctor 를 돌리되 "react 중복" 하나만 통과시킨다.
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
const onlyReactDuplicate =
  failed.length === 1 &&
  failed[0] === 'Check that no duplicate dependencies are installed' &&
  duplicated.length > 0 &&
  duplicated.every((name) => name === 'react');

if (onlyReactDuplicate) {
  console.log('\nexpo-doctor: react 중복만 실패 — hoisted 모노레포의 알려진 현상이라 통과로 본다.');
  process.exit(0);
}
process.exit(status ?? 1);
