import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {CommunityQueries} from '@/entities/community';
import {CommunityService} from '@/shared/api/community';
import type {CommunityComment} from '@/shared/api/community';
import {CommentService} from '@/shared/api/comment/comment.service';
import {ProductService} from '@/shared/api/product/product.service';
import {UserLikeTarget} from '@/shared/api/gql/graphql';
import {showToast} from '@/shared/lib/feedback';

import {applyCommentLike, removeCommentById} from './optimistic';

type Page = CommunityComment[];
type InfiniteData = {pages: Page[]; pageParams: unknown[]};

/**
 * 글에 달린 댓글 목록 + 쓰기 4종(작성·수정·삭제·좋아요).
 * web `features/community/ui/CommunityCommentSection` 안에 흩어져 있던
 * 뮤테이션을 한 곳으로 모았다.
 *
 * ★좋아요만 낙관적 업데이트다(web 과 같다) — 누르는 즉시 숫자가 바뀌어야
 * 하는 동작이고, 나머지는 서버 응답 후 무효화가 자연스럽다.
 * 삭제는 web 이 무효화만 하지만 여기서는 낙관적으로 먼저 지운다:
 * 목록이 길면 무효화 왕복 동안 지운 댓글이 남아 있어 두 번 누르게 된다.
 */
export function useCommunityCommentsViewModel(postId: number) {
  const queryClient = useQueryClient();
  const queryKey = CommunityQueries.keys.comments(postId);

  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(CommunityQueries.comments(postId));

  const comments = data?.pages.flat() ?? [];

  const invalidate = () => queryClient.invalidateQueries({queryKey});

  /** 페이지 배열을 통째로 갈아끼우고 롤백 스냅샷을 남긴다. */
  const optimistic = async (update: (page: Page) => Page) => {
    await queryClient.cancelQueries({queryKey});
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old: InfiniteData | undefined) =>
      old ? {...old, pages: old.pages.map(update)} : old,
    );
    return {previous};
  };

  const rollback = (context: {previous: unknown} | undefined) => {
    if (context?.previous !== undefined) {
      queryClient.setQueryData(queryKey, context.previous);
    }
  };

  const {mutate: addComment, isPending: isAdding} = useMutation({
    mutationFn: (content: string) =>
      CommunityService.addComment({parentId: postId, content}),
    onSuccess: () => {
      // 댓글 수(replyCount)는 목록·상세가 따로 들고 있어 같이 무효화한다.
      // 안 하면 새 댓글을 달아도 카드의 댓글 수가 그대로다.
      queryClient.invalidateQueries({queryKey: CommunityQueries.keys.all});
    },
    onError: () => showToast.info('댓글 등록에 실패했어요.'),
  });

  const {mutate: updateComment, isPending: isUpdating} = useMutation({
    mutationFn: ({id, content}: {id: number; content: string}) =>
      CommentService.updateComment({id, content}),
    onSuccess: invalidate,
    onError: () => showToast.info('수정에 실패했어요.'),
  });

  const {mutate: removeComment} = useMutation({
    mutationFn: (id: number) => CommentService.removeComment({id}),
    onMutate: (id: number) => optimistic(page => removeCommentById(page, id)),
    onSuccess: () => {
      showToast.info('댓글이 삭제되었어요.');
      queryClient.invalidateQueries({queryKey: CommunityQueries.keys.all});
    },
    onError: (_err, _id, context) => {
      rollback(context);
      showToast.info('삭제에 실패했어요.');
    },
  });

  const {mutate: likeComment} = useMutation({
    // web 과 같은 인자 규약 — 취소는 isLike 를 아예 보내지 않는다.
    mutationFn: ({id, isMyLike}: {id: number; isMyLike: boolean}) =>
      ProductService.addUserLikeOrDislike({
        target: UserLikeTarget.Comment,
        targetId: id,
        isLike: isMyLike ? undefined : true,
      }),
    onMutate: ({id, isMyLike}) =>
      optimistic(page => applyCommentLike(page, id, isMyLike)),
    onError: (_err, _vars, context) => {
      rollback(context);
      showToast.info('좋아요 처리에 실패했어요.');
    },
  });

  return {
    comments,
    isPending,
    isError,
    refetch,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    addComment,
    isAdding,
    updateComment,
    isUpdating,
    removeComment,
    likeComment,
  };
}
