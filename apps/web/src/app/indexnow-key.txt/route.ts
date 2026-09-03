import { NextResponse } from 'next/server';

import { IS_INDEXABLE_DEPLOYMENT } from '@/shared/config/env';
import { INDEXNOW_KEY } from '@/shared/config/indexnow';

// 왜 `/<key>.txt` 가 아니라 고정 경로인가: 키를 바꿀 때 라우트 디렉토리명까지 고쳐야 하는
// 구조를 피했다. IndexNow 는 `keyLocation` 파라미터로 임의 URL 을 허용한다(crawling-server 가
// 이 URL 을 함께 보낸다). 루트에 있으므로 호스트 전체 URL 을 제출할 수 있다.
export function GET() {
  // dev 배포가 같은 키를 서빙하면 dev URL 제출이 통과해버린다. 운영에서만 응답.
  if (!IS_INDEXABLE_DEPLOYMENT) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
