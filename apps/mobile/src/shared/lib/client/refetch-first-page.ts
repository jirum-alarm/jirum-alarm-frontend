import type {InfiniteData, QueryClient, QueryKey} from '@tanstack/react-query';

/**
 * 무한 스크롤 목록을 **첫 페이지부터** 다시 받는다(당겨서 새로고침).
 *
 * 그냥 refetch() 하면 react-query 는 그동안 내린 페이지를 전부, 커서(searchAfter)를 앞 페이지에서
 * 받아야 하니 **차례로** 다시 받는다 — 10페이지 내렸으면 왕복 10번을 기다리는 동안 스피너가 돈다.
 * 당기는 사람은 맨 위에 있으니 첫 페이지만 남기고 받으면 된다. 아래는 스크롤하면 다시 붙는다.
 */
export async function refetchFirstPage(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<void> {
  queryClient.setQueryData<InfiniteData<unknown>>(queryKey, data =>
    data && data.pages.length > 1
      ? {pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1)}
      : data,
  );
  await queryClient.refetchQueries({queryKey, exact: true});
}
