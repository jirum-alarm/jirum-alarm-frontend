const path = require("path");

const buildEslintCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));
  const landingFiles = relFilenames.filter((f) =>
    f.startsWith("apps/landing/")
  );

  const commands = [];

  if (adminFiles.length > 0) {
    commands.push(`pnpm lint --filter=admin -- --fix`);
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
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));
  const landingFiles = relFilenames.filter((f) =>
    f.startsWith("apps/landing/")
  );

  const commands = [];

  if (adminFiles.length > 0) {
    commands.push(`pnpm --filter=admin prettier-fix`);
  }

  if (webFiles.length > 0) {
    commands.push(`pnpm --filter=web prettier-fix`);
  }

  if (landingFiles.length > 0) {
    commands.push(`pnpm --filter=landing prettier-fix`);
  }

  return commands;
};

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "*.{ts,tsx}": [() => "pnpm check-types"],
};
