import type {QueryClient} from '@tanstack/react-query';

import {ProductService} from '@/shared/api/product/product.service';

import {ProductQueries} from './product.queries';

type Stats = NonNullable<
  Awaited<ReturnType<typeof ProductService.getProductStats>>
>;

/**
 * 찜·추천을 누르면 **서버 응답 전에** stats 캐시를 바꾼다(낙관적 업데이트).
 * 예전엔 뮤테이션 → 무효화 → 재조회(왕복 2번)가 끝나야 하트가 바뀌고, 그 사이엔 버튼이
 * 막혀 있어 "눌렀는데 반응이 없다" 로 느껴졌다. 실패하면 돌려준 rollback 으로 되돌린다.
 */
export async function patchProductStats(
  queryClient: QueryClient,
  productId: number,
  patch: (old: Stats) => Stats,
): Promise<() => void> {
  const {queryKey} = ProductQueries.stats({id: productId});
  await queryClient.cancelQueries({queryKey});
  const previous = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, old => (old ? patch(old) : old));
  return () => queryClient.setQueryData(queryKey, previous);
}
