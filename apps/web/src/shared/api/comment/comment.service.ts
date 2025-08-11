import { httpClient } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import {
  AddCommentMutationVariables,
  CommentsQueryVariables,
  RemoveCommentMutationVariables,
  UpdateCommentMutationVariables,
} from '../gql/graphql';

export class CommentService {
  static async getComments(variables: CommentsQueryVariables) {
    return httpClient.execute(QueryComments, variables).then((res) => res.data);
  }

  static async addComment(variables: AddCommentMutationVariables) {
    return httpClient.execute(MutationAddComment, variables).then((res) => res.data);
  }

  static async updateComment(variables: UpdateCommentMutationVariables) {
    return httpClient.execute(MutationUpdateComment, variables).then((res) => res.data);
  }

  static async removeComment(variables: RemoveCommentMutationVariables) {
    return httpClient.execute(MutationRemoveComment, variables).then((res) => res.data);
  }
}

const QueryComments = graphql(`
  query comments(
    $limit: Int!
    $searchAfter: [String!]
    $productId: Int!
    $orderBy: CommentOrder!
    $orderOption: OrderOptionType!
  ) {
    comments(
      limit: $limit
      searchAfter: $searchAfter
      productId: $productId
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      productId
      parentId
      content
      createdAt
      searchAfter
      author {
        id
        nickname
      }
      likeCount
      isMyLike
    }
  }
`);

const MutationAddComment = graphql(`
  mutation addComment($productId: Int!, $content: String!, $parentId: Int) {
    addComment(productId: $productId, content: $content, parentId: $parentId)
  }
`);

const MutationUpdateComment = graphql(`
  mutation updateComment($id: Int!, $content: String!) {
    updateComment(id: $id, content: $content)
  }
`);

const MutationRemoveComment = graphql(`
  mutation removeComment($id: Int!) {
    removeComment(id: $id)
  }
`);
