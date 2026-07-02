import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path) {
  if (!existsSync(path)) {
    return null;
  }

  return readFileSync(path, 'utf8').trim();
}

function getRepoRoot(projectRoot) {
  return resolve(projectRoot, '../..');
}

function parseVersion(version) {
  return version.replace(/^v/u, '').split('.').map(Number);
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

export function getProjectNodeStatus(projectRoot) {
  const repoRoot = getRepoRoot(projectRoot);
  const packageJson = readJson(resolve(repoRoot, 'package.json'));
  const nvmVersion = readText(resolve(repoRoot, '.nvmrc'));
  const minimumVersion = nvmVersion?.replace(/^v/u, '');
  const currentVersion = process.versions.node;
  const currentMajor = parseVersion(currentVersion)[0];
  const expectedMajor = minimumVersion ? parseVersion(minimumVersion)[0] : null;
  const satisfiesMinimum = minimumVersion
    ? compareVersions(currentVersion, minimumVersion) >= 0
    : true;
  const satisfiesMajor =
    expectedMajor === null ? true : currentMajor === expectedMajor;
  const ok = satisfiesMinimum && satisfiesMajor;

  return {
    currentVersion,
    expectedVersion: minimumVersion,
    engines: packageJson.engines?.node ?? null,
    ok,
  };
}

export function assertProjectNode(projectRoot) {
  const status = getProjectNodeStatus(projectRoot);

  if (status.ok) {
    return;
  }

  const expected = status.expectedVersion
    ? `Node ${status.expectedVersion} from .nvmrc`
    : `Node ${status.engines}`;
  throw new Error(
    `Project Node mismatch. Current Node is ${status.currentVersion}, expected ${expected}. Run "nvm use" in the repository or use a shell that activates the project Node before running app-deploy.`,
  );
}
