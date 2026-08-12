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

/**
 * 가격 추이 차트.
 *
 * ⚠️ priceHistory 는 루트 쿼리가 아니라 ProductOutput 의 필드다.
 * (계획서에 루트로 잘못 적었다가 스키마 실측에서 잡혔다)
 */
export const QueryProductPriceHistory = graphql(`
  query ProductPriceHistory($id: Int!, $days: Int) {
    product(id: $id) {
      id
      priceHistory(days: $days) {
        basis
        confidence
        currency
        disclaimer
        pointCount
        rangeDays
        sampleCount
        priceAxis
        unitLabel
        points {
          date
          price
          deal {
            id
            title
            displayTitle
            parsedPrice
            price
            priceCurrency
            postedAt
            providerId
            providerName
            thumbnail
            url
            isSeed
            categoryId
          }
        }
      }
    }
  }
`);

/** 커뮤니티 반응 하단의 원문 링크(출처 커뮤니티)용. */
export const QueryProductAdditionalInfo = graphql(`
  query ProductAdditionalInfo($id: Int!) {
    product(id: $id) {
      id
      url
      provider {
        id
        nameKr
      }
    }
  }
`);

/** 커뮤니티 반응 — 긍정/부정 키워드 칩. */
export const QueryCategorizedReactionKeywords = graphql(`
  query CategorizedReactionKeywords($id: Int!) {
    categorizedReactionKeywords(id: $id) {
      items {
        name
        count
        type
        role
        tag
      }
      lastUpdatedAt
    }
  }
`);

/** 함께 본 상품 캐러셀. */
export const QueryTogetherViewedProducts = graphql(`
  query TogetherViewedProducts($productId: Int!, $limit: Int!) {
    togetherViewedProducts(productId: $productId, limit: $limit) {
      id
      title
      price
      thumbnail
      isEnd
      hotDealType
      categoryId
      mallName
      postedAt
      earliestExpiryDate
      provider {
        id
        nameKr
      }
    }
  }
`);

/**
 * 상세 조회 수집. 랭킹이 조회수를 먹으므로 네이티브가 대신 쏘지 않으면
 * 조용히 랭킹이 왜곡된다.
 */
export const MutationCollectProduct = graphql(`
  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {
    collectProduct(productId: $productId, source: $source, position: $position)
  }
`);

/** 카테고리 인기 상품. 스키마 인자는 categoryIds(배열)다. */
export const QueryCategoryProducts = graphql(`
  query CategoryProducts(
    $categoryIds: [Int!]
    $limit: Int!
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
  ) {
    products(
      categoryIds: $categoryIds
      limit: $limit
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      title
      price
      thumbnail
      isEnd
      hotDealType
      categoryId
      mallName
      postedAt
      earliestExpiryDate
      provider {
        id
        nameKr
      }
    }
  }
`);

/** 찜하기(위시리스트). 좋아요(addUserLikeOrDislike)와는 별개 뮤테이션이다. */
export const MutationAddWishlist = graphql(`
  mutation AddWishlist($productId: Int!) {
    addWishlist(productId: $productId)
  }
`);

export const MutationRemoveWishlist = graphql(`
  mutation RemoveWishlist($productId: Int!) {
    removeWishlist(productId: $productId)
  }
`);

/** 만료 상품 신고. */
export const MutationReportExpiredProduct = graphql(`
  mutation ReportExpiredProduct($productId: Int!) {
    reportExpiredProduct(productId: $productId)
  }
`);
