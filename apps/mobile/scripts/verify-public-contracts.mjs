import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_SERVICE_URL = 'https://jirum-alarm.com';
const CURRENT_GRAPHQL_ENDPOINT = 'https://jirum-api.kyojs.com/graphql';
const CURRENT_ANDROID_PACKAGE = 'com.solcode.jirmalam';
const CURRENT_IOS_BUNDLE_ID = 'com.jirum-alarm.jirumalarm';
const CURRENT_APP_STORE_ID = '6474611420';
const CURRENT_GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const CURRENT_APP_STORE_URL =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';
const CURRENT_WEBVIEW_USER_AGENTS = [
  'IOS ReactNative Webview Jirum Alarm',
  'Android ReactNative Webview Jirum Alarm',
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function extractFirst(text, pattern, label, filePath) {
  const match = text.match(pattern);

  if (!match) {
    throw new Error(`Could not find ${label} in ${filePath}`);
  }

  return match[1];
}

function extractAll(text, pattern, label, filePath) {
  const matches = [...text.matchAll(pattern)].map((match) => match[1]);

  if (matches.length === 0) {
    throw new Error(`Could not find ${label} in ${filePath}`);
  }

  return [...new Set(matches)];
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected "${expected}", received "${actual}"`);
  }
}

function assertSameMembers(actual, expected, label) {
  const actualList = [...new Set(actual)].sort();
  const expectedList = [...new Set(expected)].sort();

  if (JSON.stringify(actualList) !== JSON.stringify(expectedList)) {
    throw new Error(
      `${label} mismatch: expected [${expectedList.join(', ')}], received [${actualList.join(', ')}]`,
    );
  }
}

function walkSourceFiles(relativeDir) {
  const rootDir = path.join(repoRoot, relativeDir);
  const files = [];

  function visit(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (/\.(ts|tsx|js|jsx|mjs)$/u.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  visit(rootDir);
  return files;
}

function collectStoreIds(relativeDir) {
  const googlePlayIds = new Set();
  const appStoreIds = new Set();

  for (const filePath of walkSourceFiles(relativeDir)) {
    const text = readFileSync(filePath, 'utf8');

    for (const match of text.matchAll(/https:\/\/play\.google\.com\/store\/apps\/details\?id=([A-Za-z0-9._-]+)/gu)) {
      googlePlayIds.add(match[1]);
    }

    for (const match of text.matchAll(/https:\/\/apps\.apple\.com\/[A-Za-z-]+\/app(?:\/[^\s'"`]+)?\/id(\d+)/gu)) {
      appStoreIds.add(match[1]);
    }
  }

  return {
    googlePlayIds: [...googlePlayIds],
    appStoreIds: [...appStoreIds],
  };
}

function main() {
  const mobileEnvPath = 'apps/mobile/src/constants/env.ts';
  const mobileEndpointPath = 'apps/mobile/src/shared/constant/endpoint.ts';
  const mobileAppConfigPath = 'apps/mobile/app.json';
  const webEnvPath = 'apps/web/src/shared/config/env.ts';
  const webDockerfilePath = 'apps/web/deploy/production/Dockerfile';
  const webAgentPath = 'apps/web/src/app/actions/agent.ts';
  const webDevicePath = 'apps/web/src/shared/model/device.ts';
  const webDownloadPath = 'apps/web/src/shared/hooks/useAppDownloadLink.tsx';
  const landingDownloadPath = 'apps/landing/src/app/components/key-visual/AppDownload.tsx';

  const mobileEnv = readRepoFile(mobileEnvPath);
  const mobileEndpoint = readRepoFile(mobileEndpointPath);
  const mobileAppConfig = readRepoFile(mobileAppConfigPath);
  const webEnv = readRepoFile(webEnvPath);
  const webDockerfile = readRepoFile(webDockerfilePath);
  const webAgent = readRepoFile(webAgentPath);
  const webDevice = readRepoFile(webDevicePath);
  const webDownload = readRepoFile(webDownloadPath);
  const landingDownload = readRepoFile(landingDownloadPath);

  const mobileServiceUrl = extractFirst(
    mobileEnv,
    /const SERVICE_URL = '([^']+)'/u,
    'mobile SERVICE_URL',
    mobileEnvPath,
  );
  const webServiceUrl = extractFirst(
    webEnv,
    /export const NEXT_PUBLIC_DEFAULT_SERVICE_URL = '([^']+)'/u,
    'web NEXT_PUBLIC_DEFAULT_SERVICE_URL',
    webEnvPath,
  );
  const dockerServiceUrls = extractAll(
    webDockerfile,
    /ARG NEXT_PUBLIC_SERVICE_URL=([^\s]+)/gu,
    'web Docker NEXT_PUBLIC_SERVICE_URL',
    webDockerfilePath,
  );

  assertEqual(mobileServiceUrl, CURRENT_SERVICE_URL, 'Mobile SERVICE_URL');
  assertEqual(webServiceUrl, CURRENT_SERVICE_URL, 'Web service URL');
  assertSameMembers(dockerServiceUrls, [CURRENT_SERVICE_URL], 'Web Docker service URLs');

  const graphqlEndpoint = extractFirst(
    mobileEndpoint,
    /export const GRAPHQL_ENDPOINT = '([^']+)'/u,
    'mobile GRAPHQL_ENDPOINT',
    mobileEndpointPath,
  );

  assertEqual(graphqlEndpoint, CURRENT_GRAPHQL_ENDPOINT, 'Mobile GRAPHQL_ENDPOINT');

  const mobileUserAgents = extractAll(
    mobileEnv,
    /'([^']+ReactNative Webview Jirum Alarm)'/gu,
    'mobile WebView user agents',
    mobileEnvPath,
  );
  const webAgentUserAgents = extractAll(
    webAgent,
    /\/([^/]+ReactNative Webview Jirum Alarm)\/i/gu,
    'web server user-agent recognizers',
    webAgentPath,
  );
  const webDeviceUserAgents = extractAll(
    webDevice,
    /\/([^/]+ReactNative Webview Jirum Alarm)\/i/gu,
    'web client user-agent recognizers',
    webDevicePath,
  );

  assertSameMembers(mobileUserAgents, CURRENT_WEBVIEW_USER_AGENTS, 'Mobile WebView user agents');
  assertSameMembers(
    webAgentUserAgents,
    CURRENT_WEBVIEW_USER_AGENTS,
    'Web server WebView user agents',
  );
  assertSameMembers(
    webDeviceUserAgents,
    CURRENT_WEBVIEW_USER_AGENTS,
    'Web client WebView user agents',
  );

  const iosBundleIdentifier = extractFirst(
    mobileAppConfig,
    /"bundleIdentifier": "([^"]+)"/u,
    'mobile iOS bundle identifier',
    mobileAppConfigPath,
  );
  const androidPackage = extractFirst(
    mobileAppConfig,
    /"package": "([^"]+)"/u,
    'mobile Android package',
    mobileAppConfigPath,
  );

  assertEqual(iosBundleIdentifier, CURRENT_IOS_BUNDLE_ID, 'Mobile iOS bundle identifier');
  assertEqual(androidPackage, CURRENT_ANDROID_PACKAGE, 'Mobile Android package');

  const webGooglePlayLink = extractFirst(
    webDownload,
    /(https:\/\/play\.google\.com\/store\/apps\/details\?id=[A-Za-z0-9._-]+)/u,
    'web Google Play link',
    webDownloadPath,
  );
  const webAppStoreLink = extractFirst(
    webDownload,
    /(https:\/\/apps\.apple\.com\/[A-Za-z-]+\/app(?:\/[^\s'"`]+)?\/id\d+)/u,
    'web App Store link',
    webDownloadPath,
  );
  const landingGooglePlayLink = extractFirst(
    landingDownload,
    /(https:\/\/play\.google\.com\/store\/apps\/details\?id=[A-Za-z0-9._-]+)/u,
    'landing Google Play link',
    landingDownloadPath,
  );
  const landingAppStoreLink = extractFirst(
    landingDownload,
    /(https:\/\/apps\.apple\.com\/[A-Za-z-]+\/app(?:\/[^\s'"`]+)?\/id\d+)/u,
    'landing App Store link',
    landingDownloadPath,
  );

  assertEqual(webGooglePlayLink, CURRENT_GOOGLE_PLAY_URL, 'Web Google Play link');
  assertEqual(landingGooglePlayLink, CURRENT_GOOGLE_PLAY_URL, 'Landing Google Play link');
  assertEqual(webAppStoreLink, CURRENT_APP_STORE_URL, 'Web App Store link');
  assertEqual(landingAppStoreLink, CURRENT_APP_STORE_URL, 'Landing App Store link');

  const { googlePlayIds, appStoreIds } = collectStoreIds('apps/web/src');
  const landingStoreIds = collectStoreIds('apps/landing/src');

  assertSameMembers(
    [...googlePlayIds, ...landingStoreIds.googlePlayIds],
    [CURRENT_ANDROID_PACKAGE],
    'Public Google Play app ids',
  );
  assertSameMembers(
    [...appStoreIds, ...landingStoreIds.appStoreIds],
    [CURRENT_APP_STORE_ID],
    'Public App Store app ids',
  );

  console.log('Public contracts verified.');
  console.log(`- service URL: ${CURRENT_SERVICE_URL}`);
  console.log(`- GraphQL endpoint: ${CURRENT_GRAPHQL_ENDPOINT}`);
  console.log(`- WebView user agents: ${CURRENT_WEBVIEW_USER_AGENTS.join(', ')}`);
  console.log(`- Android package / store id: ${CURRENT_ANDROID_PACKAGE}`);
  console.log(`- iOS bundle / App Store id: ${CURRENT_IOS_BUNDLE_ID} / ${CURRENT_APP_STORE_ID}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
