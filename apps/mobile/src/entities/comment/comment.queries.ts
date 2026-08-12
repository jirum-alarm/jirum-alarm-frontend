import {infiniteQueryOptions} from '@tanstack/react-query';

import {CommentOrder, OrderOptionType} from '@/shared/api/gql/graphql';
import {CommentService} from '@/shared/api/comment/comment.service';

/** web 과 같은 기본 정렬. 어긋나면 같은 상품의 댓글 순서가 웹/앱에서 달라진다. */
export const defaultCommentsVariables = {
  limit: 10,
  orderBy: CommentOrder.Id,
  orderOption: OrderOptionType.Desc,
} as const;

export class CommentQueries {
  static readonly keys = {
    all: ['comment'] as const,
    list: (productId: number) => [...this.keys.all, 'list', productId] as const,
  };

  /**
   * 커서 페이지네이션. 커서는 마지막 행의 searchAfter(문자열 배열)를 그대로 쓴다.
   */
  static infiniteComments(productId: number) {
    return infiniteQueryOptions({
      queryKey: this.keys.list(productId),
      queryFn: ({pageParam}) =>
        CommentService.getComments({
          productId,
          ...defaultCommentsVariables,
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string[],
      getNextPageParam: lastPage => {
        const last = lastPage.at(-1);
        // 마지막 페이지가 limit 보다 짧으면 더 없음. searchAfter 만 보면
        // 빈 페이지를 무한히 요청한다.
        if (!last || lastPage.length < defaultCommentsVariables.limit) {
          return null;
        }
        return last.searchAfter ?? null;
      },
      retry: 2,
    });
  }
}
