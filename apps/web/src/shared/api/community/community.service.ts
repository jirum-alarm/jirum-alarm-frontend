import { execute } from '@/shared/lib/http-client';

import {
  CommunityPostDocument,
  CommunityPostsDocument,
  LikeCommunityPostDocument,
  RemoveCommentDocument,
  RemoveCommunityPostDocument,
  ReportCommunityPostDocument,
  TypedDocumentString,
  UpdateCommentDocument,
} from '../gql/graphql';

const AddCommunityCommentDocument = new TypedDocumentString<
  { addComment: number },
  { parentId: number; content: string }
>(`
  mutation AddCommunityComment($parentId: Int!, $content: String!) {
    addComment(parentId: $parentId, content: $content)
  }
`);

const GetCommunityCommentsDocument = new TypedDocumentString<
  {
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      searchAfter?: string[] | null;
      likeCount: number;
      isMyLike?: boolean | null;
      author?: { id: string; nickname: string } | null;
    }>;
  },
  {
    parentId: number;
    limit: number;
    orderBy: string;
    orderOption: string;
    searchAfter?: string[] | null;
  }
>(`
  query GetCommunityComments(
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

// 공지 등록은 어드민(서버 adminUserIds)만 서버가 허용 — 프론트는 옵션만 넘긴다.
const AddCommunityPostWithNoticeDocument = new TypedDocumentString<
  { addComment: boolean },
  { content: string; title?: string; productId?: number; isNotice?: boolean }
>(`
  mutation AddCommunityPostWithNotice(
    $content: String!
    $title: String
    $productId: Int
    $isNotice: Boolean
  ) {
    addComment(content: $content, title: $title, productId: $productId, isNotice: $isNotice)
  }
`);

const UpdateCommunityPostWithTitleDocument = new TypedDocumentString<
  { updateComment: boolean },
  { id: number; content: string; title?: string }
>(`
  mutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {
    updateComment(id: $id, content: $content, title: $title)
  }
`);

export type { CommunityPostQuery, CommunityPostsQuery } from '../gql/graphql';

export class CommunityService {
  static async getCommunityPosts(variables: {
    limit: number;
    searchAfter?: string[] | null;
    isNotice?: boolean | null;
    isTrending?: boolean | null;
    orderBy: 'ID';
    orderOption: 'DESC' | 'ASC';
  }) {
    return execute(CommunityPostsDocument, variables as any).then((res) => res.data);
  }

  static async getCommunityPost(id: number) {
    return execute(CommunityPostDocument, { id }).then((res) => res.data);
  }

  static async addPost(variables: {
    content: string;
    title?: string;
    productId?: number;
    isNotice?: boolean;
  }) {
    return execute(AddCommunityPostWithNoticeDocument, variables).then((res) => res.data);
  }

  static async updatePost(variables: { id: number; content: string; title?: string }) {
    return execute(UpdateCommunityPostWithTitleDocument, variables).then((res) => res.data);
  }

  static async removePost(id: number) {
    return execute(RemoveCommunityPostDocument, { id }).then((res) => res.data);
  }

  static async likePost(targetId: number, isLike?: boolean) {
    return execute(LikeCommunityPostDocument, { targetId, isLike }).then((res) => res.data);
  }

  static async likeComment(targetId: number, isLike?: boolean) {
    return execute(LikeCommunityPostDocument, { targetId, isLike }).then((res) => res.data);
  }

  static async addComment(variables: { parentId: number; content: string }) {
    return execute(AddCommunityCommentDocument, variables).then((res) => res.data);
  }

  static async updateComment(variables: { id: number; content: string }) {
    return execute(UpdateCommentDocument, variables).then((res) => res.data);
  }

  static async removeComment(id: number) {
    return execute(RemoveCommentDocument, { id }).then((res) => res.data);
  }

  static async getCommunityComments(variables: {
    parentId: number;
    limit: number;
    orderBy: string;
    orderOption: string;
    searchAfter?: string[] | null;
  }) {
    return execute(GetCommunityCommentsDocument, variables as any).then((res) => res.data);
  }

  static async reportPost(variables: {
    targetId: number;
    target: 'COMMENT' | 'COMMENT_REPLY';
    reason: 'ABUSE' | 'INAPPROPRIATE' | 'OTHER' | 'PRIVACY' | 'SPAM';
    description?: string;
  }) {
    return execute(ReportCommunityPostDocument, variables as any).then((res) => res.data);
  }
}
