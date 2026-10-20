import { tossSectionKeyword, toTossDeal } from '@jirum/domain/toss';

import { QueryTossCategoryLabels, QueryTossProducts } from '@/shared/api/toss/toss.service';
import { execute } from '@/shared/lib/http-client';

import { type TossDeal } from '../model/mock';

// 섹션 키워드·홈 탭·상품 → 카드 변환은 정본 @jirum/domain/toss(앱과 같은 코드).
export { TOSS_HOME_SECTION_IDS, TOSS_SECTION_KEYWORD } from '@jirum/domain/toss';

// 카테고리 인기 하위 탭(실제 존재하는 categoryLabel).
export async function fetchTossCategoryLabels(): Promise<string[]> {
  const res = await execute(QueryTossCategoryLabels, undefined);
  return res.data?.tossCategoryLabels ?? [];
}

export async function fetchTossDeals(opts: {
  section?: string;
  categoryLabel?: string;
  limit?: number;
  // 서버 SSR 진입점에서 넘긴다. public=true 면 cookies() 스킵 → 라우트 ISR 캐시 허용(/deals 동일 패턴).
  public?: boolean;
  revalidate?: number;
}): Promise<TossDeal[]> {
  const keyword = tossSectionKeyword(opts.section);
  const res = await execute(
    QueryTossProducts,
    {
      keyword,
      limit: opts.limit ?? 20,
      orderBy: 'POSTED_AT' as never,
      orderOption: 'DESC' as never,
      tossCategoryLabel: opts.categoryLabel ?? null,
    },
    opts.public ? { public: true, revalidate: opts.revalidate ?? 600 } : undefined,
  );
  return (res.data?.productsByKeyword ?? []).map(toTossDeal);
}
