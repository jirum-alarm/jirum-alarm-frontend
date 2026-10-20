// 화면 하네스 설정. 사용법은 screens/README.md.
//   SCREENS_SERVER=dev(기본) — next dev 를 띄운다(빠른 반복). start — 미리 만든 운영 빌드(next start, CI).
//   SCREENS_MODE=record — 운영 API 로 넘겨 fixtures 를 새로 녹화한다.
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const HERE = __dirname;
const WEB_PORT = Number(process.env.SCREENS_WEB_PORT ?? 3010);
const FIXTURE_PORT = Number(process.env.SCREENS_FIXTURE_PORT ?? 9090);
const BASE_URL = `http://localhost:${WEB_PORT}`;
const FIXTURE_GRAPHQL = `http://localhost:${FIXTURE_PORT}/graphql`;
const SERVER = process.env.SCREENS_SERVER === 'start' ? 'start' : 'dev';

const mobile = {
  ...devices['iPhone 14'],
  browserName: 'chromium' as const,
  defaultBrowserType: 'chromium' as const,
};
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } };

export default defineConfig({
  testDir: HERE,
  testMatch: 'screens.spec.ts',
  globalSetup: join(HERE, 'global-setup.ts'),
  globalTeardown: join(HERE, 'global-teardown.ts'),
  // next dev 는 첫 컴파일·HMR 로 페이지를 다시 부를 때가 있다 — 한 번 더. 운영 빌드(start)는 재시도 없이.
  retries: SERVER === 'dev' ? 1 : 0,
  fullyParallel: false,
  workers: 1, // 고정 데이터 서버의 시나리오가 전역 하나라 한 번에 한 화면.
  timeout: 90_000,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  outputDir: join(HERE, '.out', 'test-results'),
  use: {
    baseURL: BASE_URL,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'mobile-light', use: { ...mobile, colorScheme: 'light' } },
    { name: 'mobile-dark', use: { ...mobile, colorScheme: 'dark' } },
    { name: 'desktop-light', use: { ...desktop, colorScheme: 'light' } },
    { name: 'desktop-dark', use: { ...desktop, colorScheme: 'dark' } },
  ],
  webServer: [
    {
      command:
        'node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON screens/fixture-server.mts',
      cwd: join(HERE, '..'),
      url: `http://localhost:${FIXTURE_PORT}/__missing`,
      reuseExistingServer: false,
      env: {
        SCREENS_FIXTURE_PORT: String(FIXTURE_PORT),
        SCREENS_MODE: process.env.SCREENS_MODE ?? 'replay',
      },
    },
    {
      command:
        SERVER === 'start'
          ? `pnpm exec next start -p ${WEB_PORT}`
          : `pnpm exec next dev -p ${WEB_PORT}`,
      cwd: join(HERE, '..'),
      url: `${BASE_URL}/robots.txt`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: {
        // 운영 파드처럼 서버는 UTC, 브라우저는 KST(use.timezoneId) — 시간대로 갈리는 하이드레이션 오류(#418)를 로컬에서도 잡는다.
        TZ: 'UTC',
        // dev: 서버는 GRAPHQL_ENDPOINT, 브라우저는 /api/graphql 프록시 → 둘 다 고정 데이터 서버.
        GRAPHQL_ENDPOINT: FIXTURE_GRAPHQL,
        // start(운영 빌드): 서버는 ${API_URL}/graphql. 브라우저 주소는 빌드 때 NEXT_PUBLIC_SERVICE_URL=BASE_URL 로 박는다.
        API_URL: `http://localhost:${FIXTURE_PORT}`,
        SUBSCRIPTIONS_GRAPHQL_ENDPOINT: `ws://localhost:${FIXTURE_PORT}/graphql`,
        NEXT_PUBLIC_SERVICE_URL: BASE_URL,
      },
    },
  ],
});
