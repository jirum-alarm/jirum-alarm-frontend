import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {CommunityQueries} from '@/entities/community';
import type {CommunityPostDetail} from '@/shared/api/community';
import {ProductService} from '@/shared/api/product/product.service';
import {UserLikeTarget} from '@/shared/api/gql/graphql';
import {showToast} from '@/shared/lib/feedback';

import {applyPostLike} from './optimistic';

/**
 * 글 상세 + 추천(좋아요).
 * web `CommunityPostDetail` 의 useSuspenseQuery + likePost 뮤테이션 대응.
 *
 * ★web 은 Suspense 로 로딩을 상위에 위임하지만 RN 엔 서버 프리페치가 없어
 * 화면이 직접 로딩·에러를 그린다(발견·알림 탭 전환과 같은 차이).
 */
export function useCommunityPostViewModel(postId: number) {
  const queryClient = useQueryClient();
  const queryKey = CommunityQueries.keys.post(postId);

  const {
    data: post,
    isPending,
    isError,
    refetch,
  } = useQuery(CommunityQueries.post(postId));

  const {mutate: likePost} = useMutation({
    // web 과 같은 인자 규약 — 추천 취소는 isLike 를 보내지 않는다.
    mutationFn: (isLike?: boolean) =>
      ProductService.addUserLikeOrDislike({
        target: UserLikeTarget.Comment,
        targetId: postId,
        isLike,
      }),
    onMutate: async (isLike?: boolean) => {
      await queryClient.cancelQueries({queryKey});
      const previous = queryClient.getQueryData<CommunityPostDetail>(queryKey);
      queryClient.setQueryData<CommunityPostDetail>(queryKey, old =>
        old ? applyPostLike(old, isLike) : old,
      );
      return {previous};
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showToast.info('좋아요 처리에 실패했어요.');
    },
    onSettled: () => {
      // 목록의 추천 수도 같이 맞춘다 — 상세에서 누르고 뒤로 나갔을 때
      // 카드 숫자가 그대로면 유저는 반영이 안 된 줄 안다.
      queryClient.invalidateQueries({queryKey: CommunityQueries.keys.all});
    },
  });

  return {post, isPending, isError, refetch, likePost};
}
