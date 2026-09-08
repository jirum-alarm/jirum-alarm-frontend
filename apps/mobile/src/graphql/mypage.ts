import {graphql} from '../shared/api/gql';

/**
 * 내정보 탭(web `/mypage/**` · `/like` · `/themes`) 오퍼레이션.
 *
 * web 은 이 문서들이 세 곳(`shared/api/auth` · `shared/api/keyword` ·
 * `shared/api/wishlist` · `shared/api/notification/theme.service`)에 흩어져 있고
 * 그중 절반은 `TypedDocumentString` 수기 선언이다 — dev 엔드포인트가 죽어
 * codegen 이 막혔기 때문. **앱은 커밋된 `schema.graphql` 로 돌리므로 전부
 * `graphql()` 로 쓴다**(수기 문서를 흉내내면 타입 안전만 잃는다).
 */

/** 내 프로필. web QueryMe 와 같은 필드 셋. */
export const QueryMyProfile = graphql(`
  query QueryMyProfile {
    me {
      id
      email
      nickname
      birthYear
      gender
      favoriteCategories
    }
  }
`);

/** 닉네임·출생년도·성별·관심 카테고리 저장(부분 갱신). */
export const MutationUpdateMyProfile = graphql(`
  mutation MutationUpdateMyProfile(
    $nickname: String
    $birthYear: Float
    $gender: Gender
    $favoriteCategories: [Int!]
  ) {
    updateUserProfile(
      nickname: $nickname
      birthYear: $birthYear
      gender: $gender
      favoriteCategories: $favoriteCategories
    )
  }
`);

export const MutationUpdateMyPassword = graphql(`
  mutation MutationUpdateMyPassword($password: String!) {
    updatePassword(password: $password)
  }
`);

/** 회원탈퇴. 성공 뒤 처리는 로그아웃과 같다(useLogout 주석 참조). */
export const MutationWithdraw = graphql(`
  mutation MutationWithdraw {
    withdraw
  }
`);

/**
 * 내 키워드 목록. web 은 20개 상한이라 페이지네이션을 안 쓴다(searchAfter 미사용).
 * ★`priceDropOnly` 는 web 이 수기 문서로 겨우 끼워 넣은 필드다 — 스키마에 있다.
 */
export const QueryMyNotificationKeywords = graphql(`
  query QueryMyNotificationKeywords($limit: Int!) {
    notificationKeywordsByMe(limit: $limit) {
      id
      keyword
      priceDropOnly
    }
  }
`);

export const MutationAddMyNotificationKeyword = graphql(`
  mutation MutationAddMyNotificationKeyword(
    $keyword: String!
    $fromRecommendation: Boolean
    $priceDropOnly: Boolean
  ) {
    addNotificationKeyword(
      keyword: $keyword
      fromRecommendation: $fromRecommendation
      priceDropOnly: $priceDropOnly
    )
  }
`);

/** ⚠️ id 가 `Float!` 이다(다른 뮤테이션은 Int). 스키마 그대로 맞춘다. */
export const MutationRemoveMyNotificationKeyword = graphql(`
  mutation MutationRemoveMyNotificationKeyword($id: Float!) {
    removeNotificationKeyword(id: $id)
  }
`);

/** 키워드별 "가격 내려갔을 때만" 토글. 유저 전역이 아니라 키워드 단위다. */
export const MutationUpdateKeywordPriceDropOnly = graphql(`
  mutation MutationUpdateKeywordPriceDropOnly(
    $id: Int!
    $priceDropOnly: Boolean!
  ) {
    updateNotificationKeywordPriceDropOnly(
      id: $id
      priceDropOnly: $priceDropOnly
    )
  }
`);

// ── 찜 목록 (web /like) ──

export const QueryMyWishlists = graphql(`
  query QueryMyWishlists(
    $orderBy: WishlistOrderType!
    $orderOption: OrderOptionType!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    wishlists(
      orderBy: $orderBy
      orderOption: $orderOption
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      productId
      searchAfter
      product {
        id
        title
        price
        isHot
        isEnd
        isPrivate
        postedAt
        hotDealType
        thumbnail
        isMyWishlist
        categoryId
        mallName
        provider {
          nameKr
        }
      }
    }
  }
`);

export const QueryMyWishlistCount = graphql(`
  query QueryMyWishlistCount {
    wishlistCount
  }
`);

export const MutationAddMyWishlist = graphql(`
  mutation MutationAddMyWishlist($productId: Int!) {
    addWishlist(productId: $productId)
  }
`);

export const MutationRemoveMyWishlist = graphql(`
  mutation MutationRemoveMyWishlist($productId: Int!) {
    removeWishlist(productId: $productId)
  }
`);

// ── 알림 묶음(테마) (web /themes · /themes/[id]) ──

export const QueryNotificationThemes = graphql(`
  query QueryNotificationThemes {
    notificationThemes {
      id
      name
      description
      emoji
      representativeKeywords
    }
  }
`);

export const QueryMySubscribedThemeIds = graphql(`
  query QueryMySubscribedThemeIds {
    mySubscribedThemeIds
  }
`);

export const QueryNotificationThemeLiveDeals = graphql(`
  query QueryNotificationThemeLiveDeals($themeId: Int!) {
    notificationThemeLiveDeals(themeId: $themeId) {
      id
      title
      thumbnail
      price
      postedAt
      categoryId
      isEnd
      isHot
      hotDealType
      mallName
      provider {
        nameKr
      }
    }
  }
`);

export const MutationSubscribeNotificationTheme = graphql(`
  mutation MutationSubscribeNotificationTheme($themeId: Int!) {
    subscribeNotificationTheme(themeId: $themeId)
  }
`);

export const MutationUnsubscribeNotificationTheme = graphql(`
  mutation MutationUnsubscribeNotificationTheme($themeId: Int!) {
    unsubscribeNotificationTheme(themeId: $themeId)
  }
`);
