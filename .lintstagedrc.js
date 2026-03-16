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

  return `pnpm check-types --filter=${packages.join(" --filter=")}`;
};

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "*.{ts,tsx}": [buildCheckTypesCommands],
};
