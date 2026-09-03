import { NextResponse } from 'next/server';

import { IS_INDEXABLE_DEPLOYMENT, METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: 동적 렌더. Next 풀라우트 캐시가 robots.txt를 빌드시 정적 prerender(s-maxage 1년)해
// 배포해도 옛 값이 굳던 문제 방지 — sitemap 경로 바꾸면 즉시 반영. robots는 트래픽 적어 부담 없음.
export const dynamic = 'force-dynamic';

export function GET() {
  // dev 배포는 색인 대상이 아니다. 그래도 **Disallow: / 는 쓰지 않는다** — 크롤을 막으면
  // middleware 가 붙이는 noindex 를 읽지 못해 이미 색인된 URL 이 영구히 남는다.
  // 대신 운영 사이트맵을 광고하지 않는다(dev 호스트에서 운영 URL 을 가리키는 건 잡음).
  const sitemapLines = IS_INDEXABLE_DEPLOYMENT
    ? `
Sitemap: https://cdn.jirum-alarm.com/sitemap/sitemap-index.xml
Sitemap: https://cdn.jirum-alarm.com/sitemap/sitemap-recent-index.xml`
    : '';

  const robotsTxt = `User-agent: *
Disallow: /admin/
Disallow: /mypage
Disallow: /like
Disallow: /alarm
Disallow: /login
Disallow: /signup
Disallow: /monitoring
Allow: /
${sitemapLines}
Host: ${METADATA_SERVICE_URL}

#DaumWebMasterTool:23923d97dcee44c14f5c6b379f1bb5affe2d9cb6fcd4560b5e3c648b9e856318:jEv4QRLqgJxV7IQJ1W7Mww==`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// `/monitoring` = Sentry 터널(next.config.js `tunnelRoute`). 페이지가 아닌데 크롤러가 계속
// 친다 — 2026-09-03 게이트웨이 로그 75분 표본에서 봇 요청 425건이 전부 429(레이트리밋)였고,
// 봇 에러의 최다 항목이었다. 하루로 환산하면 8천 건. 브라우저의 Sentry 전송은 robots.txt 와
// 무관하므로(크롤러 전용 규약) 에러 리포팅에는 영향이 없다.
//
// ⚠️ `/api/` 는 **막지 않는다.** Applebot·Yeti·Googlebot 은 JS 를 실행하는 렌더링 크롤러라
// 같은 표본에서 `/api/graphql` 을 1,875건 정상(200) 호출했다. 이걸 막으면 클라이언트에서
// 그려지는 내용(커뮤니티 반응 등)을 크롤러가 못 본다.
