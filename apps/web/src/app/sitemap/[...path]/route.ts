import { NextRequest, NextResponse } from 'next/server';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

const CDN_BASE_URL = 'https://cdn.jirum-alarm.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // 경로 조합: /sitemap/title-index.xml -> title-index.xml
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const cdnUrl = `${CDN_BASE_URL}/sitemap/${path}`;

    // CDN에서 파일 가져오기
    const response = await fetch(cdnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      // Next.js의 fetch는 기본적으로 캐싱을 하지만,
      // sitemap은 자주 업데이트될 수 있으므로 revalidate 옵션 설정
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'application/xml';
    // 인덱스의 <loc> 가 CDN 호스트를 가리키므로 이 프록시 경로로 바꿔 사이트맵 전체를 같은 호스트로
    // 맞춘다(robots.txt 가 이 프록시를 광고). 상품 URL 은 원래 apex 라 영향 없음.
    const content = (await response.text()).replaceAll(
      `${CDN_BASE_URL}/sitemap/`,
      `${METADATA_SERVICE_URL}/sitemap/`,
    );

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error proxying sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
