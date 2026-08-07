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

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "*.{ts,tsx}": [buildCheckTypesCommands],
};
