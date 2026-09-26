import { readdirSync, readFileSync, statSync } from 'node:fs';
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

// "라벨 경로" 목록. 경로는 그 앱의 PAGE enum 에서 실제 값으로 풀어 비교한다(키 이름만 같고 값이 다르면 잡도록).
function readNavLinks(navPath, keyName, pagePath) {
  const routes = Object.fromEntries(
    [...readRepoFile(pagePath).matchAll(/^\s*([A-Z_]+) = '([^']*)'/gmu)].map((m) => [m[1], m[2]]),
  );
  const links = [
    ...readRepoFile(navPath).matchAll(
      new RegExp(`${keyName}: PAGE\\.([A-Z_]+),\\s*label: '([^']+)'`, 'gu'),
    ),
  ].map((m) => `${m[2]}(${routes[m[1]]})`);

  if (links.length === 0) {
    throw new Error(`Could not find nav links in ${navPath}`);
  }

  return links.join(' · ');
}

function main() {
  const mobileEnvPath = 'apps/mobile/src/constants/env.ts';
  const mobileEndpointPath = 'apps/mobile/src/shared/constant/endpoint.ts';
  const mobileAppConfigPath = 'apps/mobile/app.json';
  const webEnvPath = 'apps/web/src/shared/config/env.ts';
  const webDockerfilePath = 'apps/web/deploy/production/Dockerfile';
  const webAgentPath = 'apps/web/src/app/actions/agent.ts';
  const webDevicePath = 'apps/web/src/shared/model/device.ts';
  // 스토어 링크 정본은 config/appStore.ts 다. useAppDownloadLink 는 이걸 import 해 쓰므로
  // 링크 문자열이 없다(2026-08-06 QR 작업에서 상수 추출). 정본 파일을 직접 본다.
  const webDownloadPath = 'apps/web/src/shared/config/appStore.ts';
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

  // 소개 페이지 헤더는 web GNB 의 손 복제본이다(앱이 달라 코드 공유 불가).
  // 2026-09 까지 web 에서 빠진 "추천" 이 소개 페이지에만 남아 있었다 — 이름·순서·경로가 어긋나면 막는다.
  const webNav = readNavLinks(
    'apps/web/src/widgets/layout/ui/desktop/DesktopGNB.tsx',
    'href',
    'apps/web/src/shared/config/page.ts',
  );
  const landingNav = readNavLinks(
    'apps/landing/src/app/components/header/Header.tsx',
    'path',
    'apps/landing/src/shared/constants/page.ts',
  );

  assertEqual(landingNav, webNav, 'Landing header nav (web DesktopGNB NAV_LINKS)');

  // 2026-08-18 prebuild 산출물 커밋이 app.json 에 icon 이 없다고 흰 1024 PNG(5.8KB)를 넣어,
  // iOS 빌드 27~31 의 앱 아이콘이 전부 흰색이었다(IPA 실물로 확인). 참조된 아이콘이 비었으면 막는다.
  // ponytail: 파일 크기로만 본다(흰 단색 PNG 는 수 KB, 실제 아이콘은 수백 KB). 작은 단색 디자인을 쓰게 되면 픽셀 검사로 바꾼다.
  const iconSetDir = 'apps/mobile/ios/jirumAlarmMobile/Images.xcassets/AppIcon.appiconset';
  const iconFiles = JSON.parse(readRepoFile(`${iconSetDir}/Contents.json`))
    .images.map((image) => image.filename)
    .filter(Boolean);

  if (iconFiles.length === 0) {
    throw new Error(`No iOS app icon referenced in ${iconSetDir}/Contents.json`);
  }

  for (const file of iconFiles) {
    const size = statSync(path.join(repoRoot, iconSetDir, file)).size;

    if (size < 50_000) {
      throw new Error(`iOS app icon ${file} is ${size} bytes — looks blank (expected hundreds of KB)`);
    }
  }

  console.log('Public contracts verified.');
  console.log(`- web/landing nav: ${webNav}`);
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
