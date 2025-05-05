import { gql } from '@apollo/client';

export const QueryComments = gql`
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
`;

export const MutationAddComment = gql`
  mutation addComment($productId: Int!, $content: String!, $parentId: Int) {
    addComment(productId: $productId, content: $content, parentId: $parentId)
  }
`;

export const MutationUpdateComment = gql`
  mutation updateComment($id: Int!, $content: String!) {
    updateComment(id: $id, content: $content)
  }
`;

export const MutationRemoveComment = gql`
  mutation removeComment($id: Int!) {
    removeComment(id: $id)
  }
`;
