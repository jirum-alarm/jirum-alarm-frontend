import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import { KEYWORD_HUB_MIN_DEALS, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import type { MetadataRoute } from 'next';

// 키워드 허브 목록은 서버(keyword_hub)가 주인이지만, 허브 페이지가 프론트에만 있어 사이트맵도 여기서 낸다
// (crawling-server 사이트맵과 별도).
// 같은 이유로 프론트에만 있는 정적 안내 페이지(/guide/*)도 여기에 둔다.
// robots.txt 가 이 주소를 광고한다. 허브 lastmod 는 서버가 센 마지막 딜 시각(허브 내용이 실제로 바뀐 때)이다.
// 생성 시각을 넣으면 거짓 lastmod 라 무시당한다(2026-10-01 모델 페이지 751개가 전부 "오늘"이던 문제).
// 빌드 때 정적 생성하지 않는다 — 빌드 API(dev)가 keywordHubs 를 모르면 400 인데, 정적 생성 중 데이터 캐시 붙은 요청이
// 400 을 받으면 응답 본문 읽기가 안 끝나 60초×3 으로 빌드가 죽었다(2026-10-14 deploy-web-staging 실측·로컬 재현).
// 요청 시 렌더해도 데이터 캐시(fetch revalidate)는 그대로라 API 부하는 같다.
export const dynamic = 'force-dynamic';

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
    {
      url: `${METADATA_SERVICE_URL}/guide/hotdeal-sites`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // 얇은 허브(최근 딜 KEYWORD_HUB_MIN_DEALS 미만)는 페이지가 noindex 라 싣지 않는다 — 사이트맵의 noindex URL 은
    // 크롤 예산만 쓰고 «제출됐지만 noindex» 로 남는다(2026-10-22: 80개 중 3개). 기준은 buildKeywordHubSeo.indexable 과 같다.
    ...hubs
      .filter((h) => h.recentDealCount >= KEYWORD_HUB_MIN_DEALS)
      .map((h) => ({
        url: `${METADATA_SERVICE_URL}${keywordHubPath(h)}`,
        ...(h.lastDealAt ? { lastModified: new Date(h.lastDealAt) } : {}),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
  ];
}
