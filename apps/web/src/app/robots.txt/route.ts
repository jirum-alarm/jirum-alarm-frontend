import { NextResponse } from 'next/server';

import { IS_INDEXABLE_DEPLOYMENT, METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: 동적 렌더. Next 풀라우트 캐시가 robots.txt를 빌드시 정적 prerender(s-maxage 1년)해
// 배포해도 옛 값이 굳던 문제 방지 — sitemap 경로 바꾸면 즉시 반영. robots는 트래픽 적어 부담 없음.
export const dynamic = 'force-dynamic';

export function GET() {
  // dev 배포는 색인 대상이 아니다. 그래도 **Disallow: / 는 쓰지 않는다** — 크롤을 막으면
  // middleware 가 붙이는 noindex 를 읽지 못해 이미 색인된 URL 이 영구히 남는다.
  // 대신 운영 사이트맵을 광고하지 않는다(dev 호스트에서 운영 URL 을 가리키는 건 잡음).
  // 사이트맵은 CDN 이 아니라 같은 호스트 프록시(/sitemap/*)로 광고한다 — 네이버 서치어드바이저는
  // 등록 도메인 아래 경로로만 사이트맵을 받는다. CDN 호스트는 교차 호스트라 네이버가 무시할 수 있다.
  const sitemapLines = IS_INDEXABLE_DEPLOYMENT
    ? `
Sitemap: ${METADATA_SERVICE_URL}/sitemap/sitemap-index.xml
Sitemap: ${METADATA_SERVICE_URL}/sitemap/sitemap-recent-index.xml
Sitemap: ${METADATA_SERVICE_URL}/keywords/sitemap.xml`
    : '';

  // SEO 분석 툴 크롤러는 통째로 막는다. 검색 노출과 무관하고(우리가 이 툴들을 쓰지 않는다)
  // 2026-10-13 게이트웨이 로그 기준 하루 ~3.6만 요청(Ahrefs 2.3만·Semrush 7.7천·MJ12 3.5천·DotBot 1.7천)이
  // 대부분 상품 SSR 이었다. 이름을 지정한 그룹은 `*` 그룹 대신 적용되므로 `*` 규칙과 섞이지 않는다.
  // dev 호스트도 같이 막는다 — 위 noindex 논리는 검색엔진 얘기이고 이 툴들은 색인과 상관없다.
  //
  // ★순서·모양(2026-10-19): 10/12 까지의 파일(`*` 그룹이 맨 앞)을 한 글자도 안 바꾸고, 막는 봇은 **맨 뒤에
  // 한 봇 = 한 그룹**으로 붙인다. 10/13 에 여러 User-agent 줄을 한 그룹으로 묶어 파일 맨 앞에 `Disallow: /` 를
  // 둔 뒤, Yeti 가 그 robots 를 받아 간 10/13 22:19 KST 로부터 6시간 뒤(10/14 04시)부터 네이버가 새 URL 을
  // 하나도 안 긁는다(옛 URL 재수집은 그대로, bingbot·Googlebot 은 이 변화와 무관). RFC 9309 로는 같은 뜻이지만
  // 네이버 쪽 파서가 묶음 그룹을 잘못 읽을 여지를 없앤다. 판독: crawling-server 실험 등록부 obs_seo_naver_new_url_freeze.
  const blockedSeoTools = [
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'DataForSeoBot',
    'BLEXBot',
  ];
  const seoToolGroups = blockedSeoTools
    .map((bot) => `User-agent: ${bot}\nDisallow: /`)
    .join('\n\n');

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

#DaumWebMasterTool:23923d97dcee44c14f5c6b379f1bb5affe2d9cb6fcd4560b5e3c648b9e856318:jEv4QRLqgJxV7IQJ1W7Mww==

${seoToolGroups}`;

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
