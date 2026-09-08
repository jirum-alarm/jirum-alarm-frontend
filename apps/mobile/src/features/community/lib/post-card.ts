// 배럴(`@/entities/community`)이 아니라 모듈을 직접 가져온다 —
// 배럴은 쿼리·서비스까지 끌고 와서 이 순수 함수를 테스트에서 실행할 때
// 네이티브 모듈 체인이 따라온다.
import {parsePostContent} from '@/entities/community/post-content';

/**
 * 목록 카드가 그리는 값. web `CommunityPostCard` 의 렌더 전 계산부를 그대로 떼어냈다.
 *
 * 순수 함수로 둔 이유: 이 규칙(어떤 게 "댓글" 뱃지인가 · 어떤 이미지를
 * 미리보기로 쓰나 · 태그 상품이 있다고 볼 조건)이 화면 코드에 섞여 있으면
 * 런타임 테스트로 못박을 수 없고, web 과 어긋나도 아무도 모른다.
 */
export type PostCardSource = {
  title?: string | null;
  content: string;
  productId?: number | null;
  author?: {nickname?: string | null} | null;
  taggedProduct?: {
    id: string;
    title: string;
    thumbnail?: string | null;
  } | null;
};

export type PostCardView = {
  /** 상품 상세에 달린 댓글이 커뮤니티 피드로 올라온 경우 '댓글', 아니면 '게시글'. */
  badgeLabel: '댓글' | '게시글';
  authorName: string;
  /** 이미지 마커를 뺀 본문. */
  displayContent: string;
  /** 오른쪽 썸네일. 태그 상품이 있으면 그 상품 썸네일이 우선. */
  previewImage: string | null;
  /** 첨부가 2장 이상일 때 "+N" 뱃지 숫자. 0 이면 안 그린다. */
  extraImageCount: number;
  hasTaggedProduct: boolean;
  /** 썸네일 아래 상품명을 붙일지. */
  showProductTitle: boolean;
};

export function getPostCardView(post: PostCardSource): PostCardView {
  // web: `!post.title && !!post.productId` — 제목이 없고 상품에 매달린 글은
  // 사람이 쓴 "게시글"이 아니라 상품 댓글이다.
  const isProductComment = !post.title && !!post.productId;
  // web: 태그 없는 글도 서버가 taggedProduct.id = '0' 으로 채워 보낸다.
  // `!!taggedProduct` 만 보면 모든 글에 빈 상품 카드가 붙는다.
  const hasTaggedProduct =
    !!post.taggedProduct?.id && post.taggedProduct.id !== '0';
  const {content: displayContent, images} = parsePostContent(post.content);
  const previewImage =
    (hasTaggedProduct ? post.taggedProduct?.thumbnail : images[0]) ?? null;

  return {
    badgeLabel: isProductComment ? '댓글' : '게시글',
    authorName: post.author?.nickname ?? '알 수 없음',
    displayContent,
    previewImage,
    extraImageCount:
      !hasTaggedProduct && images.length > 1 ? images.length - 1 : 0,
    hasTaggedProduct,
    showProductTitle: hasTaggedProduct && !!post.taggedProduct?.title,
  };
}
