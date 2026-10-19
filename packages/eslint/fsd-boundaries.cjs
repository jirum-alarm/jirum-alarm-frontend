/**
 * FSD 경계 — 아래 레이어가 위 레이어를 import 하거나, 같은 레이어의 다른 슬라이스를 import 하면 에러.
 * web(eslint 10 flat)·mobile(eslint 8 .eslintrc overrides) 둘 다 내장 `no-restricted-imports` 하나로 막는다
 * (플러그인 의존 없음 — 두 eslint 버전에서 같은 규칙이 돈다).
 *
 * 슬라이스 목록은 린트 시점에 디렉터리를 읽어 만든다 — 새 슬라이스를 만들어도 설정을 고칠 일이 없다.
 * `@/` 별칭 import 만 본다(상대 경로 `../../features/...` 는 대상 밖).
 */
const fs = require("node:fs");
const path = require("node:path");

const slicesOf = (srcDir, layer) => {
  const dir = path.join(srcDir, layer);
  if (!fs.existsSync(dir)) return [];
  return [
    ...new Set(
      fs.readdirSync(dir).map((name) => name.replace(/\.(tsx?|jsx?)$/, "")),
    ),
  ];
};

/**
 * @param {object} opts
 * @param {string} opts.srcDir      앱 src 절대 경로
 * @param {string} opts.filesPrefix override files 글롭 접두(예: 'src')
 * @param {string[][]} opts.layers  아래→위 순서. 한 칸에 여러 이름이면 같은 높이(예: mobile 최상위 screens·navigations…)
 * @param {string[]} opts.isolatedLayers 슬라이스끼리 서로 import 금지인 레이어
 * @param {Record<string, string[]>} opts.allowlist 파일(src 기준 상대) → 허용할 import 접두(예: '@/entities/auth')
 * @returns {{files: string[], ignores?: string[], rules: object}[]}
 */
function fsdBoundaries({
  srcDir,
  filesPrefix = "src",
  layers,
  isolatedLayers,
  allowlist = {},
}) {
  const blocks = [];
  const allowFiles = Object.keys(allowlist);

  const patterns = (restrictedPrefixes, allowed, message) => {
    const group = restrictedPrefixes
      .filter((p) => !allowed.includes(p))
      .flatMap((p) => [p, `${p}/**`]);
    return group.length ? [{ group, message }] : [];
  };

  const rule = (pats) => ["error", { patterns: pats }];

  layers.forEach((level, i) => {
    const upper = layers.slice(i + 1).flat();
    const upperPrefixes = upper.flatMap((l) =>
      slicesOf(srcDir, l).map((s) => `@/${l}/${s}`),
    );
    const upperMsg = `FSD: ${level.join("/")} 는 위 레이어(${upper.join(", ")})를 import 할 수 없습니다. 모듈을 아래 레이어로 옮기세요.`;

    for (const layer of level) {
      const sliced = isolatedLayers.includes(layer);
      const targets = sliced
        ? slicesOf(srcDir, layer).map((s) => ({
            glob: `${filesPrefix}/${layer}/${s}/**`,
            slice: s,
          }))
        : [{ glob: `${filesPrefix}/${layer}/**`, slice: null }];

      for (const { glob, slice } of targets) {
        const sibling = slice
          ? slicesOf(srcDir, layer)
              .filter((s) => s !== slice)
              .map((s) => `@/${layer}/${s}`)
          : [];
        const siblingMsg = `FSD: ${layer} 슬라이스끼리는 서로 import 할 수 없습니다. 공통 부분은 아래 레이어로 내리세요.`;
        const build = (allowed) => [
          ...patterns(upperPrefixes, allowed, upperMsg),
          ...patterns(sibling, allowed, siblingMsg),
        ];
        const inside = (f) =>
          f.startsWith(glob.replace("/**", "/").replace(`${filesPrefix}/`, ""));
        const exempt = allowFiles.filter(inside);
        const pats = build([]);
        if (pats.length) {
          blocks.push({
            files: [`${glob}`],
            ...(exempt.length
              ? { ignores: exempt.map((f) => `${filesPrefix}/${f}`) }
              : {}),
            rules: { "no-restricted-imports": rule(pats) },
          });
        }
        for (const f of exempt) {
          blocks.push({
            files: [`${filesPrefix}/${f}`],
            rules: { "no-restricted-imports": rule(build(allowlist[f])) },
          });
        }
      }
    }
  });
  return blocks;
}

module.exports = { fsdBoundaries };
