const path = require("path");

const CHUNK_SIZE = 5;

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const buildEslintCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));

  const commands = [];

  if (adminFiles.length > 0) {
    const adminChunks = chunkArray(adminFiles, CHUNK_SIZE);
    adminChunks.forEach((chunk) => {
      const filesArgs = chunk.map((f) => `--file ${f}`).join(" ");
      commands.push(`pnpm lint --filter=admin -- --fix ${filesArgs}`);
    });
  }

  if (webFiles.length > 0) {
    const webChunks = chunkArray(webFiles, CHUNK_SIZE);
    webChunks.forEach((chunk) => {
      const filesArgs = chunk.map((f) => `--file ${f}`).join(" ");
      commands.push(`pnpm lint --filter=web -- --fix ${filesArgs}`);
    });
  }

  return commands;
};

const buildPrettierCommands = (filenames) => {
  const relFilenames = filenames.map((f) => path.relative(process.cwd(), f));
  const adminFiles = relFilenames.filter((f) => f.startsWith("apps/admin/"));
  const webFiles = relFilenames.filter((f) => f.startsWith("apps/web/"));

  const commands = [];

  if (adminFiles.length > 0) {
    const adminChunks = chunkArray(adminFiles, CHUNK_SIZE);
    adminChunks.forEach(() => {
      commands.push(`pnpm --filter=admin prettier-fix`);
    });
  }

  if (webFiles.length > 0) {
    const webChunks = chunkArray(webFiles, CHUNK_SIZE);
    webChunks.forEach(() => {
      commands.push(`pnpm --filter=web prettier-fix`);
    });
  }

  return commands;
};

module.exports = {
  "*.{js,ts,tsx}": [buildEslintCommands, buildPrettierCommands],
  "*.{ts,tsx}": [() => "pnpm check-types"],
};
