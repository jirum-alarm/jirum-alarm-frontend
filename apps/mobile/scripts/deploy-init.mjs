#!/usr/bin/env node

import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getProjectNodeStatus} from './project-runtime.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');

const checks = [
  {
    label: 'Xcode',
    command: 'xcodebuild',
    args: ['-version'],
  },
  {
    label: 'CocoaPods',
    command: 'bundle',
    args: ['exec', 'pod', '--version'],
  },
  {
    label: 'EAS CLI',
    command: 'pnpm',
    args: ['exec', 'eas', '--version'],
    requiresProjectNode: true,
  },
  {
    label: 'Java',
    command: 'java',
    args: ['-version'],
  },
];

function runCheck({label, command, args}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 10_000,
  });

  if (result.status === 0) {
    const firstLine =
      `${result.stdout}${result.stderr}`.split('\n').find(Boolean) ?? 'ok';
    console.log(`✓ ${label}: ${firstLine}`);
    return true;
  }

  console.log(`✕ ${label}: ${command} ${args.join(' ')} failed`);
  const output = `${result.stdout}${result.stderr}`.trim();
  if (output) {
    for (const line of output.split('\n').slice(0, 8)) {
      console.log(`  ${line}`);
    }
  }
  if (result.signal === 'SIGTERM') {
    console.log('  timed out after 10 seconds');
  }
  if (result.error) {
    console.log(`  ${result.error.message}`);
  }
  if (label === 'CocoaPods') {
    console.log('  Try: gem install bundler:2.6.9');
    console.log('  Then: cd apps/mobile && bundle install');
  }
  return false;
}

let ok = true;

const nodeStatus = getProjectNodeStatus(projectRoot);
if (nodeStatus.ok) {
  console.log(`✓ Project Node: v${nodeStatus.currentVersion}`);
} else {
  console.log(
    `✕ Project Node: current v${nodeStatus.currentVersion}, expected ${
      nodeStatus.expectedVersion
        ? `>=${nodeStatus.expectedVersion} <23`
        : nodeStatus.engines
    }`,
  );
  ok = false;
}

for (const check of checks) {
  if (check.requiresProjectNode && !nodeStatus.ok) {
    console.log(`- ${check.label}: skipped until Project Node matches`);
    continue;
  }

  ok = runCheck(check) && ok;
}

const googleServiceInfoPlist = resolve(
  projectRoot,
  'ios/GoogleService-Info.plist',
);
if (existsSync(googleServiceInfoPlist)) {
  console.log(`✓ Firebase iOS plist: ${googleServiceInfoPlist}`);
} else {
  console.log('✕ Firebase iOS plist: missing ios/GoogleService-Info.plist');
  ok = false;
}

const googleServicesJson = resolve(
  projectRoot,
  'android/app/google-services.json',
);
if (existsSync(googleServicesJson)) {
  console.log(`✓ Firebase Android google-services.json: ${googleServicesJson}`);
} else {
  console.log(
    '✕ Firebase Android google-services.json: missing android/app/google-services.json',
  );
  ok = false;
}

if (!nodeStatus.ok) {
  console.log('- Local iOS release config: skipped until Project Node matches');
  console.log(
    '- Local Android release config: skipped until Project Node matches',
  );
} else {
  const iosReleaseCheck = spawnSync(
    'node',
    ['scripts/ios-local-release.mjs', '--check'],
    {
      cwd: projectRoot,
      encoding: 'utf8',
    },
  );

  if (iosReleaseCheck.status === 0) {
    console.log('✓ Local iOS release config');
    console.log(iosReleaseCheck.stdout.trim());
  } else {
    console.log('✕ Local iOS release config');
    console.log(`${iosReleaseCheck.stdout}${iosReleaseCheck.stderr}`.trim());
    ok = false;
  }

  const androidReleaseCheck = spawnSync(
    'node',
    ['scripts/android-local-release.mjs', '--check'],
    {
      cwd: projectRoot,
      encoding: 'utf8',
    },
  );

  if (androidReleaseCheck.status === 0) {
    console.log('✓ Local Android release config');
    console.log(androidReleaseCheck.stdout.trim());
  } else {
    console.log('✕ Local Android release config');
    console.log(
      `${androidReleaseCheck.stdout}${androidReleaseCheck.stderr}`.trim(),
    );
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}
