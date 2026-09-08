import {
  MutationAddCommunityComment,
  MutationAddUserReport,
  QueryCommunityPost,
  QueryCommunityPostComments,
  QueryCommunityPosts,
} from '@/graphql/community';
import {HttpClient} from '@/shared/lib/client';
import type {
  AddCommunityCommentMutationVariables,
  AddUserReportMutationVariables,
  CommunityPostCommentsQuery,
  CommunityPostCommentsQueryVariables,
  CommunityPostQuery,
  CommunityPostsQuery,
  CommunityPostsQueryVariables,
} from '@/shared/api/gql/graphql.ts';

/** 목록 한 줄. 카드가 그리는 형태의 정본. */
export type CommunityPost = CommunityPostsQuery['comments'][number];
/** 글 상세. 목록보다 필드가 적다(searchAfter·replyCount 없음). */
export type CommunityPostDetail = CommunityPostQuery['comment'];
/** 글에 달린 댓글 한 줄. */
export type CommunityComment = CommunityPostCommentsQuery['comments'][number];

/**
 * 커뮤니티 API.
 *
 * ★좋아요·글 삭제·댓글 수정/삭제는 여기 없다 — 이미 있는 서비스를 그대로 쓴다
 * (`ProductService.addUserLikeOrDislike` · `CommentService.removeComment` ·
 * `CommentService.updateComment`). 같은 뮤테이션을 이름만 바꿔 한 벌 더 만들면
 * 나중에 한쪽만 고쳐서 웹/앱이 어긋난다.
 */
export class CommunityService {
  static async getPosts(variables: CommunityPostsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryCommunityPosts,
      variables,
    );
    return res.data?.comments ?? [];
  }

  static async getPost(id: number) {
    const res = await HttpClient.withAccessToken().execute(QueryCommunityPost, {
      id,
    });
    return res.data?.comment ?? null;
  }

  static async getPostComments(variables: CommunityPostCommentsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryCommunityPostComments,
      variables,
    );
    return res.data?.comments ?? [];
  }

  static async addComment(variables: AddCommunityCommentMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddCommunityComment,
      variables,
    );
    return res.data?.addComment ?? null;
  }

  static async report(variables: AddUserReportMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddUserReport,
      variables,
    );
    return res.data?.addUserReport ?? null;
  }
}
