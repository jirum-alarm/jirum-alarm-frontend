import { gql } from '@apollo/client';

export const QueryCommunityPosts = gql`
  query CommunityPosts(
    $limit: Int!
    $searchAfter: [String!]
    $isNotice: Boolean
    $isTrending: Boolean
    $orderBy: CommentOrder!
    $orderOption: OrderOptionType!
  ) {
    comments(
      limit: $limit
      searchAfter: $searchAfter
      isNotice: $isNotice
      isTrending: $isTrending
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      productId
      parentId
      title
      content
      createdAt
      searchAfter
      isNotice
      likeCount
      viewCount
      isMyLike
      isMyReported
      author {
        id
        nickname
      }
      taggedProduct {
        id
        title
        thumbnail
        price
        postedAt
        url
      }
    }
  }
`;

export const QueryCommunityPost = gql`
  query CommunityPost($id: Int!) {
    comment(id: $id) {
      id
      title
      content
      createdAt
      likeCount
      viewCount
      isMyLike
      isNotice
      isMyReported
      productId
      author {
        id
        nickname
      }
      taggedProduct {
        id
        title
        thumbnail
        price
        postedAt
        url
      }
    }
  }
`;

export const MutationAddCommunityPost = gql`
  mutation AddCommunityPost($content: String!, $title: String, $productId: Int) {
    addComment(content: $content, title: $title, productId: $productId)
  }
`;

export const MutationUpdateCommunityPost = gql`
  mutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {
    updateComment(id: $id, content: $content, title: $title)
  }
`;

export const MutationRemoveCommunityPost = gql`
  mutation RemoveCommunityPost($id: Int!) {
    removeComment(id: $id)
  }
`;

export const MutationReportCommunityPost = gql`
  mutation ReportCommunityPost(
    $targetId: Float!
    $target: UserReportTarget!
    $reason: UserReportReason!
    $description: String
  ) {
    addUserReport(target: $target, targetId: $targetId, reason: $reason, description: $description)
  }
`;

export const MutationLikeCommunityPost = gql`
  mutation LikeCommunityPost($targetId: Int!, $isLike: Boolean) {
    addUserLikeOrDislike(target: COMMENT, targetId: $targetId, isLike: $isLike)
  }
`;
