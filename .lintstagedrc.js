const fs = require("node:fs");
const path = require("node:path");

// 워크스페이스 앱 목록. 새 앱을 추가하면 **여기만** 고친다.
// (이전엔 세 함수가 각자 4개를 하드코딩해서 apps/ai 추가 시 check-types 가
//  `--filter=` 빈 셀렉터로 죽었다 — turbo 가 "selector must have a reference" 로 거부.)
const APPS = ["admin", "mobile", "web", "landing", "ai"];

const matchedApps = (filenames) => {
  const rel = filenames.map((f) => path.relative(process.cwd(), f));
  return APPS.filter((app) => rel.some((f) => f.startsWith(`apps/${app}/`)));
};

const buildEslintCommands = (filenames) =>
  matchedApps(filenames).map((app) => `pnpm lint --filter=${app} -- --fix`);

const buildPrettierCommands = (filenames) =>
  matchedApps(filenames).map((app) => `pnpm --filter=${app} prettier-fix`);

const buildCheckTypesCommands = (filenames) => {
  const apps = matchedApps(filenames);
  // 매칭 0개면 명령을 만들지 않는다. 빈 배열을 반환하면 lint-staged 가 그냥 건너뛴다.
  if (apps.length === 0) return [];
  return [`pnpm check-types ${apps.map((a) => `--filter=${a}`).join(" ")}`];
};

// apps/mobile 테스트 중 web 소스를 직접 읽어 대조하는 것("web/src" 를 담은 파일)은 web 만 고쳐도 깨진다.
// web 커밋 때 같이 돌려 깨뜨린 커밋에서 막는다 — 목록은 매번 grep 하므로 테스트가 늘어도 손댈 곳이 없다.
// (2026-10-07: web 마이페이지 메뉴 이동이 mypage-port-parity 를 깨뜨렸는데 다음 앱 커밋의 CI 에서야 드러났다.)
const MOBILE_TESTS = "apps/mobile/__tests__";
const buildWebCoupledMobileTests = () => {
  const tests = fs
    .readdirSync(MOBILE_TESTS, { withFileTypes: true })
    .filter((e) => e.isFile() && fs.readFileSync(path.join(MOBILE_TESTS, e.name), "utf8").includes("web/src"))
    .map((e) => `__tests__/${e.name}`);
  return tests.length ? [`pnpm --filter=mobile exec jest ${tests.join(" ")}`] : [];
};

// 디자인 시스템(packages/design-system): theme.css 가 tokens.js 와 맞는지·대비·린트 정규식을 테스트로 본다.
// 린트 규칙(eslint.js)을 바꿨으면 그 규칙을 쓰는 앱을 전부 다시 린트한다 — 안 그러면 다음에 앱을 고친 사람의 커밋이 막힌다.
const DESIGN_SYSTEM_APPS = ["web", "mobile", "ai", "landing"];
const buildDesignSystemCommands = () => ["pnpm --filter @jirum/design-system test"];
const buildDesignSystemLintCommands = () => DESIGN_SYSTEM_APPS.map((app) => `pnpm lint --filter=${app} -- --fix`);

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "packages/design-system/**": [buildDesignSystemCommands],
  "packages/design-system/eslint.js": [buildDesignSystemLintCommands],
  "*.{ts,tsx}": [buildCheckTypesCommands],
  "apps/web/src/**": [buildWebCoupledMobileTests],
};
