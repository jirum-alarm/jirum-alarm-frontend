/**
 * 토큰 JSON ↔ 생성물(build/) 동기화 가드.
 * 빌드를 다시 돌려서 build/ 산출물이 커밋된 것과 다르면 실패시킨다.
 * → "토큰 JSON만 고치고 build 안 했다"거나 "생성물을 손으로 고쳤다"를 CI/pre-commit에서 차단.
 *
 * 사용: node scripts/verify-no-drift.mjs   (design-tokens 패키지 루트에서)
 * CI 예: pnpm --filter @jirum/design-tokens build && pnpm --filter @jirum/design-tokens verify
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(root, 'build');

const snapshot = () => {
  const out = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out[p] = readFileSync(p, 'utf8');
    }
  };
  try {
    walk(buildDir);
  } catch {
    /* build/ 없음 → 아래에서 빈 스냅샷 비교로 잡힘 */
  }
  return out;
};

const before = snapshot();
execSync('pnpm build', { cwd: root, stdio: 'inherit' });
const after = snapshot();

const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
const drifted = [...keys].filter((k) => before[k] !== after[k]);

if (drifted.length > 0) {
  console.error('\n❌ 디자인 토큰 drift 감지 — 토큰 JSON과 생성물이 어긋났습니다:');
  for (const f of drifted) console.error('   - ' + f.replace(root + '/', ''));
  console.error('\n해결: `pnpm --filter @jirum/design-tokens build` 후 생성물을 커밋하세요.\n');
  process.exit(1);
}

console.log('✅ 디자인 토큰 동기화 OK (생성물이 토큰 JSON과 일치).');
