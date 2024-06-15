const path = require('path');

// ESLint 명령어 빌드 함수
const buildEslintCommand = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter(f => f.startsWith('apps/admin/')).join(' --file ');
  const webFiles = relFilenames.filter(f => f.startsWith('apps/web/')).join(' --file ');

  let commands = [];
  if (adminFiles) {
    commands.push(`pnpm lint --filter=admin -- --fix --file ${adminFiles}`);
  }
  if (webFiles) {
    commands.push(`pnpm lint --filter=web -- --fix --file ${webFiles}`);
  }

  return commands.join(' && ');
};

const buildPrettierCommand = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter(f => f.startsWith('apps/admin/')).join(' ');
  const webFiles = relFilenames.filter(f => f.startsWith('apps/web/')).join(' ');

  let commands = [];
  if (adminFiles) {
    commands.push(`pnpm prettier-fix --filter=admin prettier-fix`);
  }
  if (webFiles) {
    commands.push(`pnpm prettier-fix --filter=web prettier-fix`);
  }

  return commands.join(' && ');
};

module.exports = {
  '*.{js,ts,tsx}': [buildEslintCommand, buildPrettierCommand],
  '*.{ts,tsx}': [() => 'pnpm check-types'],
};
