import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import { keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import type { MetadataRoute } from 'next';

// 키워드 허브 목록은 서버(keyword_hub)가 주인이지만, 허브 페이지가 프론트에만 있어 사이트맵도 여기서 낸다
// (crawling-server 사이트맵과 별도).
// 같은 이유로 프론트에만 있는 정적 안내 페이지(/guide/*)도 여기에 둔다.
// robots.txt 가 이 주소를 광고한다. 허브 lastmod 는 서버가 센 마지막 딜 시각(허브 내용이 실제로 바뀐 때)이다.
// 생성 시각을 넣으면 거짓 lastmod 라 무시당한다(2026-10-01 모델 페이지 751개가 전부 "오늘"이던 문제).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hubs = await fetchKeywordHubs();
  return [
    { url: `${METADATA_SERVICE_URL}/keywords`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${METADATA_SERVICE_URL}/help`, changeFrequency: 'monthly', priority: 0.5 },
    {
      url: `${METADATA_SERVICE_URL}/guide/hotdeal-alarm`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...hubs.map((h) => ({
      url: `${METADATA_SERVICE_URL}${keywordHubPath(h)}`,
      ...(h.lastDealAt ? { lastModified: new Date(h.lastDealAt) } : {}),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
