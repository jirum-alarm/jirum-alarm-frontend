import { NextResponse } from 'next/server';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

/**
 * `/sitemap.xml` 은 404 였다 — 사이트맵 인덱스는 `/sitemap/sitemap-index.xml`(robots.txt 가 광고)에 있다.
 * robots.txt 를 안 읽고 관례 경로부터 두드리는 크롤러(AI 검색·SEO 점검 도구)가 있어 인덱스로 영구 이동시킨다.
 * 사이트맵 인덱스 안에 인덱스를 넣을 수는 없어(규격상 sitemapindex → sitemap 만) 세 갈래 중 전체 인덱스로 보낸다.
 */
// 정적 prerender 되면 빌드 때의 서비스 주소가 굳는다(같은 이미지가 스테이징·운영에 나간다) — robots.txt 와 같은 이유.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.redirect(`${METADATA_SERVICE_URL}/sitemap/sitemap-index.xml`, 301);
}
