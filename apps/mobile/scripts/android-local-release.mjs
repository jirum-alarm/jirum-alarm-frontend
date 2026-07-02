#!/usr/bin/env node

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertProjectNode} from './project-runtime.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const buildDir = resolve(projectRoot, 'build');
const androidBuildGradle = resolve(projectRoot, 'android/app/build.gradle');
const googleServicesJson = resolve(
  projectRoot,
  'android/app/google-services.json',
);
const easJsonPath = resolve(projectRoot, 'eas.json');

const args = process.argv.slice(2);
const options = {
  appVersion: null,
  build: true,
  bump: true,
  checkOnly: false,
  clearCache: false,
  interactiveSubmit: false,
  output: null,
  profile: 'production',
  submit: true,
  targetVersionCode: null,
};

function printHelp() {
  console.log(`
Usage:
  node scripts/android-local-release.mjs [options]

Options:
  --profile <name>        EAS profile to use. Default: production
  --output <path>         Android output path. Default: build/jirum-alarm-android-<version>-<versionCode>.<aab|apk>
  --app-version <x.y.z>   Set Android versionName before building
  --version-code <n>      Set Android versionCode instead of auto-incrementing
  --no-bump               Keep the current Android versionCode
  --no-submit             Build only, do not submit to Google Play
  --submit-only           Submit an existing build path, requires --output
  --interactive-submit    Allow EAS Submit prompts for first-time credential setup
  --check                 Validate local release setup without building
  --clear-cache           Pass --clear-cache to EAS local build
  --help                  Show this help
`);
}

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--') {
    continue;
  }

  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }

  if (arg === '--profile') {
    options.profile = args[++index];
  } else if (arg === '--output') {
    options.output = args[++index];
  } else if (arg === '--app-version') {
    options.appVersion = args[++index];
  } else if (arg === '--version-code') {
    options.targetVersionCode = Number(args[++index]);
  } else if (arg === '--no-bump') {
    options.bump = false;
  } else if (arg === '--no-submit') {
    options.submit = false;
  } else if (arg === '--submit-only') {
    options.build = false;
    options.bump = false;
    options.submit = true;
  } else if (arg === '--interactive-submit') {
    options.interactiveSubmit = true;
  } else if (arg === '--check') {
    options.checkOnly = true;
  } else if (arg === '--clear-cache') {
    options.clearCache = true;
  } else {
    throw new Error(`Unknown option: ${arg}`);
  }
}

if (!options.profile) {
  throw new Error('Missing --profile value.');
}

if (
  options.targetVersionCode !== null &&
  (!Number.isInteger(options.targetVersionCode) ||
    options.targetVersionCode < 1)
) {
  throw new Error('--version-code must be a positive integer.');
}

if (
  options.appVersion !== null &&
  !/^\d+\.\d+\.\d+$/u.test(options.appVersion)
) {
  throw new Error('--app-version must use x.y.z format.');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getAndroidBuildInfo() {
  const gradle = readFileSync(androidBuildGradle, 'utf8');
  const versionCodeMatch = gradle.match(/^\s*versionCode\s+([0-9]+)\s*$/m);
  const versionNameMatch = gradle.match(/^\s*versionName\s+"([^"]+)"\s*$/m);

  if (!versionCodeMatch) {
    throw new Error('Could not find versionCode in android/app/build.gradle.');
  }

  if (!versionNameMatch) {
    throw new Error('Could not find versionName in android/app/build.gradle.');
  }

  return {
    gradle,
    versionCode: Number(versionCodeMatch[1]),
    versionName: versionNameMatch[1],
  };
}

function setAndroidVersionCode(versionCode) {
  const {gradle} = getAndroidBuildInfo();
  const updatedGradle = gradle.replace(
    /^(\s*versionCode\s+)[0-9]+(\s*)$/m,
    `$1${versionCode}$2`,
  );
  writeFileSync(androidBuildGradle, updatedGradle);
}

function setAndroidVersionName(versionName) {
  const {gradle} = getAndroidBuildInfo();
  const updatedGradle = gradle.replace(
    /^(\s*versionName\s+)"[^"]+"(\s*)$/m,
    `$1"${versionName}"$2`,
  );
  writeFileSync(androidBuildGradle, updatedGradle);
}

function run(command, commandArgs, env = {}) {
  console.log(`\n$ ${[command, ...commandArgs].join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    env: {...process.env, ...env},
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveOutputPath(output, defaultOutput) {
  if (!output) {
    return defaultOutput;
  }

  const outputPath = resolve(projectRoot, output);
  if (existsSync(outputPath)) {
    return outputPath;
  }

  if (!output.includes('/') && !output.startsWith('~')) {
    const buildOutputPath = resolve(buildDir, output);
    if (existsSync(buildOutputPath)) {
      return buildOutputPath;
    }
  }

  return outputPath;
}

function ensureLocalPrerequisites() {
  if (!existsSync(googleServicesJson)) {
    throw new Error(
      'Missing android/app/google-services.json. Restore it locally before running the Android release.',
    );
  }

  const easJson = readJson(easJsonPath);
  const buildProfile = easJson.build?.[options.profile];
  const submitProfile = easJson.submit?.[options.profile];

  if (!buildProfile) {
    throw new Error(`Missing EAS build profile: ${options.profile}`);
  }

  if (buildProfile.android?.credentialsSource !== 'remote') {
    throw new Error(
      `Expected build.${options.profile}.android.credentialsSource to be "remote".`,
    );
  }

  if (options.submit && buildProfile.android?.buildType !== 'app-bundle') {
    throw new Error(
      `Expected build.${options.profile}.android.buildType to be "app-bundle" for Play Store release.`,
    );
  }

  if (options.submit && !submitProfile?.android) {
    throw new Error(`Missing submit.${options.profile}.android in eas.json.`);
  }

  const serviceAccountKeyPath = submitProfile?.android?.serviceAccountKeyPath;
  if (options.submit && serviceAccountKeyPath) {
    const resolvedPath = resolve(projectRoot, serviceAccountKeyPath);
    if (!existsSync(resolvedPath)) {
      throw new Error(
        `Missing Android service account key at ${resolvedPath}.`,
      );
    }
  }
}

try {
  assertProjectNode(projectRoot);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

ensureLocalPrerequisites();

let {versionCode, versionName} = getAndroidBuildInfo();
const easJson = readJson(easJsonPath);
const buildProfile = easJson.build?.[options.profile];
const outputExtension =
  buildProfile?.android?.buildType === 'apk' ? 'apk' : 'aab';
const plannedVersionName = options.appVersion ?? versionName;
const plannedVersionCode =
  options.targetVersionCode ??
  (options.build && options.bump ? versionCode + 1 : versionCode);
const plannedOutput = resolve(
  projectRoot,
  options.output ??
    `build/jirum-alarm-android-${plannedVersionName}-${plannedVersionCode}.${outputExtension}`,
);

if (options.checkOnly) {
  const submitProfile = easJson.submit?.[options.profile]?.android;
  console.log(`Local Android release setup is ready.
Profile: ${options.profile}
Version: ${versionName}
Planned version: ${plannedVersionName}
Current versionCode: ${versionCode}
Planned versionCode: ${plannedVersionCode}
Output: ${plannedOutput}
Submit: ${options.submit ? 'yes' : 'no'}
Build type: ${buildProfile?.android?.buildType ?? 'default'}
Play track: ${submitProfile?.track ?? 'default'}
Google services JSON: ${googleServicesJson}
Play service account: ${
    submitProfile?.serviceAccountKeyPath
      ? submitProfile.serviceAccountKeyPath
      : 'EAS remote key expected'
  }`);
  process.exit(0);
}

if (options.build) {
  if (plannedVersionName !== versionName) {
    setAndroidVersionName(plannedVersionName);
    versionName = plannedVersionName;
    console.log(`Updated Android versionName to ${versionName}.`);
  }

  const nextVersionCode = plannedVersionCode;
  if (nextVersionCode !== versionCode) {
    setAndroidVersionCode(nextVersionCode);
    versionCode = nextVersionCode;
    ({versionName} = getAndroidBuildInfo());
    console.log(`Updated Android versionCode to ${versionCode}.`);
  }
}

const defaultOutput = resolve(
  projectRoot,
  `build/jirum-alarm-android-${versionName}-${versionCode}.${outputExtension}`,
);
const outputPath = resolveOutputPath(options.output, defaultOutput);

if (!options.build && !existsSync(outputPath)) {
  throw new Error(`Missing Android build for --submit-only: ${outputPath}`);
}

if (options.submit && extname(outputPath).toLowerCase() !== '.aab') {
  throw new Error('Play Store submission requires an .aab output.');
}

mkdirSync(dirname(outputPath), {recursive: true});

const profileEnv = buildProfile?.env ?? {};
const localBuildEnv = {
  ...profileEnv,
  NODE_ENV: profileEnv.NODE_ENV ?? 'production',
  GOOGLE_SERVICES_JSON: googleServicesJson,
};

if (options.build) {
  const buildArgs = [
    'exec',
    'eas',
    'build',
    '-p',
    'android',
    '--profile',
    options.profile,
    '--local',
    '--output',
    outputPath,
    '--non-interactive',
  ];

  if (options.clearCache) {
    buildArgs.push('--clear-cache');
  }

  run('pnpm', buildArgs, localBuildEnv);
}

if (options.submit) {
  const submitArgs = [
    'exec',
    'eas',
    'submit',
    '-p',
    'android',
    '--profile',
    options.profile,
    '--path',
    outputPath,
    '--wait',
  ];

  if (!options.interactiveSubmit) {
    submitArgs.push('--non-interactive');
  }

  run('pnpm', submitArgs);
}

console.log(`\nDone. Android build: ${outputPath}`);
