import { NextResponse } from 'next/server';

import { ModelPageService } from '@/shared/api/model-page';

import { toListItem } from '@/features/deals/lib/deals-list-item';

/**
 * /deals 의 「N개 더 보기」를 열 때 그 항목들의 카드 데이터. 페이지와 같은 publishedModelPages(ISR 10분 캐시)에서
 * 꺼내므로 API 를 더 부르지 않는다. 접힌 1,000여 개를 처음 HTML 에 다 실으면 /deals 가 3.2MB 였다(2026-10-13).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { slugs?: unknown } | null;
  const slugs = Array.isArray(body?.slugs)
    ? body.slugs.filter((s): s is string => typeof s === 'string').slice(0, 2000)
    : [];
  if (slugs.length === 0) return NextResponse.json({ items: [] });
  const pages = await ModelPageService.getPublishedModelPages();
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const items = slugs.flatMap((s) => {
    const p = bySlug.get(s);
    return p ? [toListItem(p)] : [];
  });
  return NextResponse.json({ items });
}
