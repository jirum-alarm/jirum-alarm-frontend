import {graphql} from '../shared/api/gql';

/**
 * 댓글 목록 — 커서 페이지네이션.
 *
 * 커서는 마지막 행의 searchAfter(문자열 배열)를 그대로 다음 요청에 넣는다.
 * web 과 동일한 규약이라 정렬 옵션도 같이 맞춰야 목록이 어긋나지 않는다.
 */
export const QueryComments = graphql(`
  query Comments(
    $productId: Int!
    $limit: Int!
    $searchAfter: [String!]
    $orderBy: CommentOrder!
    $orderOption: OrderOptionType!
  ) {
    comments(
      productId: $productId
      limit: $limit
      searchAfter: $searchAfter
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      productId
      parentId
      content
      createdAt
      searchAfter
      likeCount
      isMyLike
      replyCount
      author {
        id
        nickname
      }
    }
  }
`);

export const MutationAddComment = graphql(`
  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {
    addComment(productId: $productId, content: $content, parentId: $parentId)
  }
`);

export const MutationUpdateComment = graphql(`
  mutation UpdateComment($id: Int!, $content: String) {
    updateComment(id: $id, content: $content)
  }
`);

export const MutationRemoveComment = graphql(`
  mutation RemoveComment($id: Int!) {
    removeComment(id: $id)
  }
`);
