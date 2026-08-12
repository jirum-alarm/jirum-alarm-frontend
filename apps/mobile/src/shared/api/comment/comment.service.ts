import {
  MutationAddComment,
  MutationRemoveComment,
  MutationUpdateComment,
  QueryComments,
} from '@/graphql/comment';
import {HttpClient} from '@/shared/lib/client';
import type {
  AddCommentMutationVariables,
  CommentsQuery,
  CommentsQueryVariables,
  RemoveCommentMutationVariables,
  UpdateCommentMutationVariables,
} from '@/shared/api/gql/graphql.ts';

export type TComment = CommentsQuery['comments'][number];

export class CommentService {
  static async getComments(variables: CommentsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryComments,
      variables,
    );
    return res.data?.comments ?? [];
  }

  static async addComment(variables: AddCommentMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddComment,
      variables,
    );
    return res.data?.addComment ?? null;
  }

  static async updateComment(variables: UpdateCommentMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationUpdateComment,
      variables,
    );
    return res.data?.updateComment ?? null;
  }

  static async removeComment(variables: RemoveCommentMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationRemoveComment,
      variables,
    );
    return res.data?.removeComment ?? null;
  }
}
