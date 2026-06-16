#!/usr/bin/env node

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const iosProjectFile = resolve(
  projectRoot,
  'ios/jirumAlarmMobile.xcodeproj/project.pbxproj',
);
const googleServiceInfoPlist = resolve(
  projectRoot,
  'ios/GoogleService-Info.plist',
);
const easJsonPath = resolve(projectRoot, 'eas.json');

const args = process.argv.slice(2);
const options = {
  appVersion: null,
  build: true,
  bump: true,
  checkOnly: false,
  clearCache: false,
  output: null,
  profile: 'production',
  submit: true,
  targetBuildNumber: null,
};

function printHelp() {
  console.log(`
Usage:
  node scripts/ios-local-release.mjs [options]

Options:
  --profile <name>        EAS profile to use. Default: production
  --output <path>         IPA output path. Default: build/jirum-alarm-ios-<version>-<build>.ipa
  --app-version <x.y.z>   Set iOS marketing version before building
  --build-number <n>      Set iOS build number instead of auto-incrementing
  --no-bump               Keep the current iOS build number
  --no-submit             Build only, do not submit to TestFlight
  --submit-only           Submit an existing IPA path, requires --output
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
  } else if (arg === '--build-number') {
    options.targetBuildNumber = Number(args[++index]);
  } else if (arg === '--no-bump') {
    options.bump = false;
  } else if (arg === '--no-submit') {
    options.submit = false;
  } else if (arg === '--submit-only') {
    options.build = false;
    options.bump = false;
    options.submit = true;
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
  options.targetBuildNumber !== null &&
  (!Number.isInteger(options.targetBuildNumber) ||
    options.targetBuildNumber < 1)
) {
  throw new Error('--build-number must be a positive integer.');
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

function getIosBuildInfo() {
  const project = readFileSync(iosProjectFile, 'utf8');
  const buildNumbers = [
    ...project.matchAll(/CURRENT_PROJECT_VERSION = ([0-9]+);/g),
  ].map(match => Number(match[1]));
  const marketingVersions = [
    ...project.matchAll(/MARKETING_VERSION = ([^;]+);/g),
  ].map(match => match[1].trim());

  if (buildNumbers.length === 0) {
    throw new Error(
      'Could not find CURRENT_PROJECT_VERSION in the Xcode project.',
    );
  }

  if (marketingVersions.length === 0) {
    throw new Error('Could not find MARKETING_VERSION in the Xcode project.');
  }

  return {
    buildNumber: Math.max(...buildNumbers),
    marketingVersion: marketingVersions[0],
    project,
  };
}

function setIosBuildNumber(buildNumber) {
  const {project} = getIosBuildInfo();
  const updatedProject = project.replace(
    /CURRENT_PROJECT_VERSION = [0-9]+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`,
  );
  writeFileSync(iosProjectFile, updatedProject);
}

function setIosMarketingVersion(marketingVersion) {
  const {project} = getIosBuildInfo();
  const updatedProject = project.replace(
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${marketingVersion};`,
  );
  writeFileSync(iosProjectFile, updatedProject);
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

function ensureLocalPrerequisites() {
  if (!existsSync(googleServiceInfoPlist)) {
    throw new Error(
      'Missing ios/GoogleService-Info.plist. Restore it locally before running the iOS release.',
    );
  }

  const easJson = readJson(easJsonPath);
  const buildProfile = easJson.build?.[options.profile];
  const submitProfile = easJson.submit?.[options.profile];

  if (!buildProfile) {
    throw new Error(`Missing EAS build profile: ${options.profile}`);
  }

  if (buildProfile.ios?.credentialsSource !== 'remote') {
    throw new Error(
      `Expected build.${options.profile}.ios.credentialsSource to be "remote".`,
    );
  }

  if (options.submit && !submitProfile?.ios?.ascAppId) {
    throw new Error(
      `Missing submit.${options.profile}.ios.ascAppId in eas.json.`,
    );
  }
}

ensureLocalPrerequisites();

let {buildNumber, marketingVersion} = getIosBuildInfo();
const plannedMarketingVersion = options.appVersion ?? marketingVersion;
const plannedBuildNumber =
  options.targetBuildNumber ??
  (options.build && options.bump ? buildNumber + 1 : buildNumber);
const plannedOutput = resolve(
  projectRoot,
  options.output ??
    `build/jirum-alarm-ios-${plannedMarketingVersion}-${plannedBuildNumber}.ipa`,
);

if (options.checkOnly) {
  console.log(`Local iOS release setup is ready.
Profile: ${options.profile}
Version: ${marketingVersion}
Planned version: ${plannedMarketingVersion}
Current build number: ${buildNumber}
Planned build number: ${plannedBuildNumber}
Output: ${plannedOutput}
Submit: ${options.submit ? 'yes' : 'no'}
Firebase plist: ${googleServiceInfoPlist}`);
  process.exit(0);
}

if (options.build) {
  if (plannedMarketingVersion !== marketingVersion) {
    setIosMarketingVersion(plannedMarketingVersion);
    marketingVersion = plannedMarketingVersion;
    console.log(`Updated iOS marketing version to ${marketingVersion}.`);
  }

  const nextBuildNumber = plannedBuildNumber;
  if (nextBuildNumber !== buildNumber) {
    setIosBuildNumber(nextBuildNumber);
    buildNumber = nextBuildNumber;
    ({marketingVersion} = getIosBuildInfo());
    console.log(`Updated iOS build number to ${buildNumber}.`);
  }
}

const defaultOutput = resolve(
  projectRoot,
  `build/jirum-alarm-ios-${marketingVersion}-${buildNumber}.ipa`,
);
const outputPath = resolve(projectRoot, options.output ?? defaultOutput);

if (!options.build && !existsSync(outputPath)) {
  throw new Error(`Missing IPA for --submit-only: ${outputPath}`);
}

mkdirSync(dirname(outputPath), {recursive: true});

const localBuildEnv = {
  GOOGLE_SERVICE_INFO_PLIST: googleServiceInfoPlist,
};

if (options.build) {
  const buildArgs = [
    'exec',
    'eas',
    'build',
    '-p',
    'ios',
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
  run('pnpm', [
    'exec',
    'eas',
    'submit',
    '-p',
    'ios',
    '--profile',
    options.profile,
    '--path',
    outputPath,
    '--non-interactive',
    '--wait',
  ]);
}

console.log(`\nDone. IPA: ${outputPath}`);
