import { NextResponse } from 'next/server';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: 동적 렌더. Next 풀라우트 캐시가 robots.txt를 빌드시 정적 prerender(s-maxage 1년)해
// 배포해도 옛 값이 굳던 문제 방지 — sitemap 경로 바꾸면 즉시 반영. robots는 트래픽 적어 부담 없음.
export const dynamic = 'force-dynamic';

export function GET() {
  const robotsTxt = `User-agent: *
Disallow: /admin/
Disallow: /my/
Allow: /

Sitemap: https://cdn.jirum-alarm.com/sitemap/sitemap-index.xml
Host: ${METADATA_SERVICE_URL}

#DaumWebMasterTool:23923d97dcee44c14f5c6b379f1bb5affe2d9cb6fcd4560b5e3c648b9e856318:jEv4QRLqgJxV7IQJ1W7Mww==`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
