import { NextRequest, NextResponse } from 'next/server';

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
    const content = await response.text();

    // CDN의 응답을 그대로 반환
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
