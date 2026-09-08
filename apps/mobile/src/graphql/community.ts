import {graphql} from '../shared/api/gql';

/**
 * 커뮤니티 오퍼레이션. web `apps/web/src/graphql/community.ts` 와 필드를 맞춘다 —
 * 어긋나면 같은 글이 웹/앱에서 다르게 보인다.
 *
 * ★커뮤니티 글은 별 테이블이 아니라 **댓글(comment) 테이블의 루트 행**이다.
 * 그래서 목록은 `comments(isRoot: true)`, 상세는 `comment(id:)`,
 * 그 글에 달린 댓글은 `comments(parentId:)` 로 같은 필드를 다르게 물어본다.
 *
 * 여기 없는 것(의도적):
 *  - 글 작성·수정(`addComment(title:)`) — 글쓰기는 web 웹뷰가 담당한다
 *    (이미지 피커 미설치 + 본문 마커 바이트 호환. CommunityWriteScreen 주석 참조).
 *  - 글 삭제·댓글 수정/삭제 — `@/graphql/comment` 의 RemoveComment ·
 *    UpdateComment 가 이미 같은 뮤테이션이다. 이름만 다른 문서를 또 만들면
 *    codegen 에 중복 오퍼레이션이 생긴다.
 *  - 좋아요 — `@/graphql/product` 의 AddUserLikeOrDislike 를 target 으로 구분해 쓴다.
 */
export const QueryCommunityPosts = graphql(`
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
      isRoot: true
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
      replyCount
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
`);

/** 글 상세. web QueryCommunityPost 와 같은 필드 집합. */
export const QueryCommunityPost = graphql(`
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
`);

/**
 * 글에 달린 댓글. 상품 댓글(`@/graphql/comment` 의 Comments)과 **다른 오퍼레이션**이다 —
 * 그쪽은 productId 로, 이쪽은 parentId 로 묶는다.
 */
export const QueryCommunityPostComments = graphql(`
  query CommunityPostComments(
    $parentId: Int!
    $limit: Int!
    $searchAfter: [String!]
    $orderBy: CommentOrder!
    $orderOption: OrderOptionType!
  ) {
    comments(
      parentId: $parentId
      limit: $limit
      searchAfter: $searchAfter
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      content
      createdAt
      searchAfter
      likeCount
      isMyLike
      author {
        id
        nickname
      }
    }
  }
`);

/**
 * 글에 댓글 달기. 상품 댓글과 달리 productId 가 없고 parentId(글 id)만 넘긴다.
 * ⚠️ productId 를 같이 넘기면 상품 댓글로 붙어 커뮤니티 글에서 사라진다.
 */
export const MutationAddCommunityComment = graphql(`
  mutation AddCommunityComment($parentId: Int!, $content: String!) {
    addComment(parentId: $parentId, content: $content)
  }
`);

/**
 * 신고. ⚠️ targetId 가 `Float!` 다(Int 가 아니다 — 스키마 실측).
 * description 은 reason 이 OTHER 일 때만 서버가 요구한다.
 */
export const MutationAddUserReport = graphql(`
  mutation AddUserReport(
    $target: UserReportTarget!
    $targetId: Float!
    $reason: UserReportReason!
    $description: String
  ) {
    addUserReport(
      target: $target
      targetId: $targetId
      reason: $reason
      description: $description
    )
  }
`);
