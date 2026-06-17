const path = require("node:path");

const buildEslintCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));

  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const mobileFiles = relFilenames.filter((f) => f.startsWith("apps/mobile/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));
  const landingFiles = relFilenames.filter((f) =>
    f.startsWith("apps/landing/")
  );

  const commands = [];

  if (adminFiles.length > 0) {
    commands.push(`pnpm lint --filter=admin -- --fix`);
  }

  if (mobileFiles.length > 0) {
    commands.push(`pnpm lint --filter=mobile -- --fix`);
  }

  if (webFiles.length > 0) {
    commands.push(`pnpm lint --filter=web -- --fix`);
  }

  if (landingFiles.length > 0) {
    commands.push(`pnpm lint --filter=landing -- --fix`);
  }

  return commands;
};

const buildPrettierCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const mobileFiles = relFilenames.filter((f) => f.startsWith("apps/mobile/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));
  const landingFiles = relFilenames.filter((f) =>
    f.startsWith("apps/landing/")
  );

  const commands = [];

  if (adminFiles.length > 0) {
    commands.push(`pnpm --filter=admin prettier-fix`);
  }

  if (mobileFiles.length > 0) {
    commands.push(`pnpm --filter=mobile prettier-fix`);
  }

  if (webFiles.length > 0) {
    commands.push(`pnpm --filter=web prettier-fix`);
  }

  if (landingFiles.length > 0) {
    commands.push(`pnpm --filter=landing prettier-fix`);
  }

  return commands;
};

const buildCheckTypesCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const mobileFiles = relFilenames.filter((f) => f.startsWith("apps/mobile/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));
  const landingFiles = relFilenames.filter((f) =>
    f.startsWith("apps/landing/")
  );

  const packages = [];

  if (adminFiles.length > 0) {
    packages.push("admin");
  }

  if (mobileFiles.length > 0) {
    packages.push("mobile");
  }

  if (webFiles.length > 0) {
    packages.push("web");
  }

  if (landingFiles.length > 0) {
    packages.push("landing");
  }

  // 앱(admin/mobile/web/landing) 파일이 하나도 없으면(예: packages/* 만 변경) 빈 배열 반환.
  // 무조건 문자열을 돌려주면 `--filter=`(빈 값)로 turbo가 "selector not used" 에러.
  if (packages.length === 0) {
    return [];
  }

  return `pnpm check-types --filter=${packages.join(" --filter=")}`;
};

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "*.{ts,tsx}": [buildCheckTypesCommands],
};
