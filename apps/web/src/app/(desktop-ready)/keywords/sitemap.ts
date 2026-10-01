import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { KEYWORD_HUBS, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import type { MetadataRoute } from 'next';

// 키워드 허브는 프론트 코드의 화이트리스트라 사이트맵도 여기서 낸다(crawling-server 사이트맵과 별도).
// 같은 이유로 프론트에만 있는 정적 안내 페이지(/guide/*)도 여기에 둔다.
// robots.txt 가 이 주소를 광고한다. lastmod 는 넣지 않는다 — 허브 내용 시각을 여기선 모르고,
// 거짓 lastmod 는 무시당한다(2026-10-01 모델 페이지 751개가 전부 "오늘"이던 문제).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${METADATA_SERVICE_URL}/keywords`, changeFrequency: 'weekly', priority: 0.6 },
    {
      url: `${METADATA_SERVICE_URL}/guide/hotdeal-alarm`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...KEYWORD_HUBS.map((h) => ({
      url: `${METADATA_SERVICE_URL}${keywordHubPath(h)}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
