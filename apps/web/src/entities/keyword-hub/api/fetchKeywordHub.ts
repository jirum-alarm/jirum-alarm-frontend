import * as Sentry from '@sentry/nextjs';
import { cache } from 'react';

import { KeywordHubService } from '@/shared/api/keyword-hub';

/**
 * 허브 하나(서버가 30일 딜·통계·관련 모델 페이지까지 묶어 준다). 목록 밖 slug 는 null → 404.
 * 실패는 던진다 — ISR 이 직전 페이지를 계속 내준다(빈 허브로 noindex 를 찍는 것보다 낫다).
 * generateMetadata 와 페이지가 같은 요청에서 두 번 부르므로 cache 로 묶는다.
 */
export const fetchKeywordHub = cache((slug: string) => KeywordHubService.getHub(slug));

/**
 * 공개 허브 목록. 목록·사이트맵·상세/모델 페이지 링크가 쓴다. 링크는 부가 요소라 실패하면 빈 목록 —
 * 상세 페이지가 허브 목록 때문에 깨지면 안 된다. 다만 조용히 삼키면 다음 문제를 못 보니 Sentry 로 남긴다.
 */
export const fetchKeywordHubs = cache(async () => {
  try {
    return await KeywordHubService.getHubs();
  } catch (error) {
    Sentry.captureException(error, { tags: { query: 'keywordHubs' } });
    return [];
  }
});
