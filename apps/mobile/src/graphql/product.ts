import {graphql} from '../shared/api/gql';

/**
 * 상세 상단 블록(이미지·가격·CTA)이 쓰는 단일 쿼리.
 *
 * web 의 ProductInfo fragment(apps/web/src/graphql/product.ts)와 필드를 맞췄다.
 * 같은 상품이 웹/앱에서 다르게 보이면 유저는 버그로 읽으므로 임의로 덜어내지 않는다.
 *
 * data(JSONObject) 는 토스·오늘의집·네이버 블록의 원천이라 반드시 포함해야 한다.
 */
export const QueryProductInfo = graphql(`
  query ProductInfo($id: Int!) {
    product(id: $id) {
      id
      categoryId
      categoryName
      title
      url
      detailUrl
      isProfitUrl
      profitLinkProvider
      isHot
      isEnd
      price
      postedAt
      thumbnail
      uploaderType
      content
      author {
        id
        nickname
      }
      provider {
        id
        name
        nameKr
        host
      }
      hotDealType
      viewCount
      mallName
      data
    }
  }
`);

/**
 * 좋아요·신고 등 상호작용 상태. ProductInfo 와 분리된 이유는 web 과 동일 —
 * 로그인 여부에 따라 값이 바뀌므로 캐시 수명이 다르다.
 */
export const QueryProductStats = graphql(`
  query ProductStats($id: Int!) {
    product(id: $id) {
      id
      isHot
      isEnd
      wishlistCount
      isMyLike
      isMyReported
      likeCount
      isMyWishlist
    }
  }
`);

/** 상단 메타행(ProductGuideMetaRows)이 쓰는 핫딜 요약. */
export const QueryProductGuides = graphql(`
  query ProductGuides($productId: Int!) {
    productGuides(productId: $productId) {
      id
      title
      content
    }
  }
`);

/**
 * 좋아요 토글. 댓글 좋아요와 같은 뮤테이션을 target 으로 구분해 쓴다.
 *
 * ⚠️ web 은 오퍼레이션명을 대문자 AddUserLikeOrDislike 로 쓰지만 스키마 필드는
 * 소문자 addUserLikeOrDislike 다. 별칭일 뿐 다른 게 아니다.
 */
export const MutationAddUserLikeOrDislike = graphql(`
  mutation AddUserLikeOrDislike(
    $target: UserLikeTarget!
    $targetId: Int!
    $isLike: Boolean
  ) {
    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
  }
`);
