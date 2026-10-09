import '@/shared/style/globals.css';

import { cookies, headers } from 'next/headers';
import { PublicEnvScript } from 'next-runtime-env';

import { AppProvider } from '@/app/(app)/providers';

import { COLOR_SCHEME_COOKIE, isDarkCookie, THEME_COLOR } from '@/shared/config/color-scheme';
import { IS_PRD } from '@/shared/config/env';
import { defaultMetadata, jsonLd, organizationLd } from '@/shared/config/metadata';
import { isTabRootPath } from '@/shared/config/tab-root';
import { CHUNK_RELOAD_SCRIPT } from '@/shared/lib/chunk-reload';
import { cn } from '@/shared/lib/cn';
import { pretendard } from '@/shared/lib/fonts';

import { PATHNAME_HEADER } from '../proxy';

import { checkDevice } from './actions/agent';
import { getAccessToken, getIsGuest } from './actions/token';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = defaultMetadata;

const isDarkScheme = async () => isDarkCookie((await cookies()).get(COLOR_SCHEME_COOKIE)?.value);

export async function generateViewport(): Promise<Viewport> {
  const [isDark, { isApple, isJirumAlarmApp }] = await Promise.all([isDarkScheme(), checkDevice()]);
  return {
    initialScale: 1,
    // 손가락 확대는 막지 않는다(상품 사진·작은 글씨). iOS 만 maximumScale 1 을 둔다 — 16px 미만 입력칸(검색 등)을
    // 누를 때 화면이 확대된 채 남는 것을 막고, iOS 는 이 값이 있어도 두 손가락 확대는 허용한다.
    // 안드로이드 크롬은 maximumScale 1 이면 확대 자체가 막히므로 주지 않는다.
    // 앱 웹뷰(글쓰기·약관)는 네이티브 화면처럼 확대를 막아 둔다.
    ...((isApple || isJirumAlarmApp) && { maximumScale: 1 }),
    ...(isJirumAlarmApp && { userScalable: false }),
    width: 'device-width',
    themeColor: isDark ? THEME_COLOR.dark : THEME_COLOR.light,
    viewportFit: 'cover',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [device, accessToken, isGuest, headersList, isDark] = await Promise.all([
    checkDevice(),
    getAccessToken(),
    getIsGuest(),
    headers(),
    isDarkScheme(),
  ]);

  // 웹 바텀네비는 앱이 아니면서 탭 루트 경로일 때만 뜬다. 그 조건을 서버에서
  // 확정해 <html> 에 심어야 첫 페인트부터 하단 여백이 잡힌다 — 예전엔
  // BottomNav 의 useLayoutEffect 가 하이드레이션 후에 붙여 56px 이 밀렸다.
  const pathname = headersList.get(PATHNAME_HEADER) ?? '';
  // PC 는 바텀네비 대신 GNB 라 여백도 없다(DesktopReadyLayout 이 isMobile 일 때만 BottomNav 를 그린다).
  const hasWebBottomNav = device.isMobile && !device.isJirumAlarmApp && isTabRootPath(pathname);

  return (
    <html
      lang="ko"
      className={cn(pretendard.className, 'antialiased', isDark && 'dark')}
      data-bottom-nav={hasWebBottomNav ? 'true' : undefined}
    >
      <head>
        <PublicEnvScript />
        {/* 다른 스크립트보다 먼저 — 배포 중 조각 404 를 새로고침으로 복구(chunk-reload.ts). */}
        <script dangerouslySetInnerHTML={{ __html: CHUNK_RELOAD_SCRIPT }} />
        <link rel="preconnect" href="https://cdn.jirum-alarm.com" crossOrigin="" />
        {/* GTM 컨테이너(GTM_ID)는 load 이후 lazyOnload 로 붙는다(AppProvider). dataLayer 는 그보다 먼저
            있어야 그 사이의 push(identify·view_item…)가 큐에 남는다. 표준 스니펫의 gtm.start 도 여기서. */}
        {IS_PRD && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});`,
            }}
          />
        )}
        <link
          rel="search"
          href="/opensearch.xml"
          title="지름알림"
          type="application/opensearchdescription+xml"
        />
        {/* ponytail: JSX 로 직접. metadata.alternates 로 두면 라우트가 alternates 를 덮을 때
            (canonical 만 지정해도) types 가 통째로 날아가 RSS 링크가 사라진다 — Next 메타데이터는
            top-level key 단위 shallow merge. rel=search 와 같은 방식. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="지름알림 - 실시간 핫딜"
          href="/rss.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <meta name="application-name" content="지름알림" />
        <meta name="author" content="지름알림" />
      </head>
      <body>
        <AppProvider device={device} isLoggedIn={!!accessToken} isGuest={!accessToken && isGuest}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
