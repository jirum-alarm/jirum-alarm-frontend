import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

const projectRoot = process.cwd();

function restoreFile({source, destination, label}) {
  const destinationPath = resolve(projectRoot, destination);

  if (existsSync(destinationPath)) {
    console.log(`${label} already exists at ${destination}.`);
    return;
  }

  if (!source) {
    throw new Error(`${label} is not configured. Set it as an EAS file environment variable.`);
  }

  if (!existsSync(source)) {
    throw new Error(`${label} does not exist at ${source}.`);
  }

  mkdirSync(dirname(destinationPath), {recursive: true});
  copyFileSync(source, destinationPath);
  console.log(`Restored ${label} to ${destination}.`);
}

if (process.env.EAS_BUILD_PLATFORM === 'android') {
  restoreFile({
    source: process.env.GOOGLE_SERVICES_JSON,
    destination: 'android/app/google-services.json',
    label: 'GOOGLE_SERVICES_JSON',
  });
}

if (process.env.EAS_BUILD_PLATFORM === 'ios') {
  restoreFile({
    source: process.env.GOOGLE_SERVICE_INFO_PLIST,
    destination: 'ios/GoogleService-Info.plist',
    label: 'GOOGLE_SERVICE_INFO_PLIST',
  });
}
