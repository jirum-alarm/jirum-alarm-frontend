'use client';

import { env } from 'next-runtime-env';

import { AdSenseUnit } from '@/shared/ui/adsense/AdSenseUnit';

/**
 * 검색 결과 그리드 사이에 끼우는 인피드(가로형) 광고.
 * 검색 키워드가 바뀌면 결과가 갈리므로 dedupeKey로 remount해 새 광고를 요청한다.
 */
export function SearchInFeedAd({ dedupeKey }: { dedupeKey: string }) {
  const slot = env('NEXT_PUBLIC_ADSENSE_SLOT_SEARCH_INFEED') ?? '';

  return (
    <div className="pc:px-0 px-5 py-2">
      <AdSenseUnit key={dedupeKey} slot={slot} format="auto" minHeight={120} />
    </div>
  );
}
