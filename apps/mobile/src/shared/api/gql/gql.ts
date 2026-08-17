/* eslint-disable */
import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query ActiveAds($slotLocation: AdvertiseSlotLocation!) {\n    activeAds(slotLocation: $slotLocation) {\n      id\n      internalId\n      slotType\n      slotLocation\n      slotPriority\n      graphic\n      displayTitle\n      targetUrl\n      isActive\n    }\n  }\n': typeof types.ActiveAdsDocument;
  '\n  mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n    recordAdImpressions(events: $events)\n  }\n': typeof types.RecordAdImpressionsDocument;
  '\n  mutation RecordAdClick(\n    $creativeId: Int!\n    $slotLocation: AdvertiseSlotLocation!\n  ) {\n    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n  }\n': typeof types.RecordAdClickDocument;
  '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ': typeof types.MutationLoginDocument;
  '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n': typeof types.MutationLoginByRefreshTokenDocument;
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n': typeof types.MutationSocialLoginDocument;
  '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n': typeof types.CommentsDocument;
  '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n': typeof types.AddCommentDocument;
  '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n': typeof types.UpdateCommentDocument;
  '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n': typeof types.RemoveCommentDocument;
  '\n  query HotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.HotDealRankingProductsDocument;
  '\n  query GuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n    guestRecommendedHotDeals(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.GuestRecommendedHotDealsDocument;
  '\n  query HomeProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.HomeProductsByKeywordDocument;
  '\n  query HomeProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryIds: [Int!]\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n    $providerIds: [Int!]\n    $mallGroupId: Int\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryIds: $categoryIds\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n      providerIds: $providerIds\n      mallGroupId: $mallGroupId\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      mallName\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.HomeProductsDocument;
  '\n  query ExpiringSoonHotDealProducts(\n    $daysUntilExpiry: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    expiringSoonHotDealProducts(\n      daysUntilExpiry: $daysUntilExpiry\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      title\n      mallId\n      mallName\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n      earliestExpiryDate\n    }\n  }\n': typeof types.ExpiringSoonHotDealProductsDocument;
  '\n  query CommunityProviders {\n    communityProviders {\n      id\n      name\n      nameKr\n    }\n  }\n': typeof types.CommunityProvidersDocument;
  '\n  query MallGroups {\n    mallGroups {\n      id\n      title\n      isActive\n      sort\n    }\n  }\n': typeof types.MallGroupsDocument;
  '\n  query RecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n': typeof types.RecommendedNotificationKeywordsDocument;
  '\n  query TossCategoryLabels {\n    tossCategoryLabels\n  }\n': typeof types.TossCategoryLabelsDocument;
  '\n  query TossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.TossProductsDocument;
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n': typeof types.MutationAddPushTokenDocument;
  '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n': typeof types.ProductInfoDocument;
  '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n': typeof types.ProductStatsDocument;
  '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n': typeof types.ProductGuidesDocument;
  '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n': typeof types.AddUserLikeOrDislikeDocument;
  '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n': typeof types.ProductPriceHistoryDocument;
  '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n      commentSummary {\n        additionalInfo\n        option\n        price\n        productId\n        purchaseMethod\n        satisfaction\n        summary\n      }\n    }\n  }\n': typeof types.ProductAdditionalInfoDocument;
  '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n': typeof types.CategorizedReactionKeywordsDocument;
  '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.TogetherViewedProductsDocument;
  '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n': typeof types.CollectProductDocument;
  '\n  query KeywordProducts(\n    $keyword: String\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      keyword: $keyword\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.KeywordProductsDocument;
  '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.CategoryProductsDocument;
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n': typeof types.AddWishlistDocument;
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n': typeof types.RemoveWishlistDocument;
  '\n  mutation AddNotificationKeyword(\n    $keyword: String!\n    $fromRecommendation: Boolean\n    $priceDropOnly: Boolean\n  ) {\n    addNotificationKeyword(\n      keyword: $keyword\n      fromRecommendation: $fromRecommendation\n      priceDropOnly: $priceDropOnly\n    )\n  }\n': typeof types.AddNotificationKeywordDocument;
  '\n  query MyNotificationKeywords($limit: Int!) {\n    notificationKeywordsByMe(limit: $limit) {\n      id\n      keyword\n    }\n  }\n': typeof types.MyNotificationKeywordsDocument;
  '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n': typeof types.ReportExpiredProductDocument;
  '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n': typeof types.QueryMeDocument;
};
const documents: Documents = {
  '\n  query ActiveAds($slotLocation: AdvertiseSlotLocation!) {\n    activeAds(slotLocation: $slotLocation) {\n      id\n      internalId\n      slotType\n      slotLocation\n      slotPriority\n      graphic\n      displayTitle\n      targetUrl\n      isActive\n    }\n  }\n':
    types.ActiveAdsDocument,
  '\n  mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n    recordAdImpressions(events: $events)\n  }\n':
    types.RecordAdImpressionsDocument,
  '\n  mutation RecordAdClick(\n    $creativeId: Int!\n    $slotLocation: AdvertiseSlotLocation!\n  ) {\n    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n  }\n':
    types.RecordAdClickDocument,
  '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ':
    types.MutationLoginDocument,
  '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationLoginByRefreshTokenDocument,
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n':
    types.MutationSocialLoginDocument,
  '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n':
    types.CommentsDocument,
  '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n':
    types.AddCommentDocument,
  '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n':
    types.UpdateCommentDocument,
  '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n':
    types.RemoveCommentDocument,
  '\n  query HotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.HotDealRankingProductsDocument,
  '\n  query GuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n    guestRecommendedHotDeals(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.GuestRecommendedHotDealsDocument,
  '\n  query HomeProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.HomeProductsByKeywordDocument,
  '\n  query HomeProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryIds: [Int!]\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n    $providerIds: [Int!]\n    $mallGroupId: Int\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryIds: $categoryIds\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n      providerIds: $providerIds\n      mallGroupId: $mallGroupId\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      mallName\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.HomeProductsDocument,
  '\n  query ExpiringSoonHotDealProducts(\n    $daysUntilExpiry: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    expiringSoonHotDealProducts(\n      daysUntilExpiry: $daysUntilExpiry\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      title\n      mallId\n      mallName\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n      earliestExpiryDate\n    }\n  }\n':
    types.ExpiringSoonHotDealProductsDocument,
  '\n  query CommunityProviders {\n    communityProviders {\n      id\n      name\n      nameKr\n    }\n  }\n':
    types.CommunityProvidersDocument,
  '\n  query MallGroups {\n    mallGroups {\n      id\n      title\n      isActive\n      sort\n    }\n  }\n':
    types.MallGroupsDocument,
  '\n  query RecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n':
    types.RecommendedNotificationKeywordsDocument,
  '\n  query TossCategoryLabels {\n    tossCategoryLabels\n  }\n':
    types.TossCategoryLabelsDocument,
  '\n  query TossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.TossProductsDocument,
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n':
    types.MutationAddPushTokenDocument,
  '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n':
    types.ProductInfoDocument,
  '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n':
    types.ProductStatsDocument,
  '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n':
    types.ProductGuidesDocument,
  '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n':
    types.AddUserLikeOrDislikeDocument,
  '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n':
    types.ProductPriceHistoryDocument,
  '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n      commentSummary {\n        additionalInfo\n        option\n        price\n        productId\n        purchaseMethod\n        satisfaction\n        summary\n      }\n    }\n  }\n':
    types.ProductAdditionalInfoDocument,
  '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n':
    types.CategorizedReactionKeywordsDocument,
  '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.TogetherViewedProductsDocument,
  '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n':
    types.CollectProductDocument,
  '\n  query KeywordProducts(\n    $keyword: String\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      keyword: $keyword\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.KeywordProductsDocument,
  '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.CategoryProductsDocument,
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n':
    types.AddWishlistDocument,
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n':
    types.RemoveWishlistDocument,
  '\n  mutation AddNotificationKeyword(\n    $keyword: String!\n    $fromRecommendation: Boolean\n    $priceDropOnly: Boolean\n  ) {\n    addNotificationKeyword(\n      keyword: $keyword\n      fromRecommendation: $fromRecommendation\n      priceDropOnly: $priceDropOnly\n    )\n  }\n':
    types.AddNotificationKeywordDocument,
  '\n  query MyNotificationKeywords($limit: Int!) {\n    notificationKeywordsByMe(limit: $limit) {\n      id\n      keyword\n    }\n  }\n':
    types.MyNotificationKeywordsDocument,
  '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n':
    types.ReportExpiredProductDocument,
  '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n':
    types.QueryMeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ActiveAds($slotLocation: AdvertiseSlotLocation!) {\n    activeAds(slotLocation: $slotLocation) {\n      id\n      internalId\n      slotType\n      slotLocation\n      slotPriority\n      graphic\n      displayTitle\n      targetUrl\n      isActive\n    }\n  }\n',
): typeof import('./graphql').ActiveAdsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n    recordAdImpressions(events: $events)\n  }\n',
): typeof import('./graphql').RecordAdImpressionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RecordAdClick(\n    $creativeId: Int!\n    $slotLocation: AdvertiseSlotLocation!\n  ) {\n    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n  }\n',
): typeof import('./graphql').RecordAdClickDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ',
): typeof import('./graphql').MutationLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').MutationLoginByRefreshTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n',
): typeof import('./graphql').MutationSocialLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n',
): typeof import('./graphql').CommentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n',
): typeof import('./graphql').AddCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n',
): typeof import('./graphql').UpdateCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n',
): typeof import('./graphql').RemoveCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query HotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').HotDealRankingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n    guestRecommendedHotDeals(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').GuestRecommendedHotDealsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query HomeProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').HomeProductsByKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query HomeProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryIds: [Int!]\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n    $providerIds: [Int!]\n    $mallGroupId: Int\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryIds: $categoryIds\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n      providerIds: $providerIds\n      mallGroupId: $mallGroupId\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      mallName\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').HomeProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ExpiringSoonHotDealProducts(\n    $daysUntilExpiry: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    expiringSoonHotDealProducts(\n      daysUntilExpiry: $daysUntilExpiry\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      title\n      mallId\n      mallName\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n      earliestExpiryDate\n    }\n  }\n',
): typeof import('./graphql').ExpiringSoonHotDealProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CommunityProviders {\n    communityProviders {\n      id\n      name\n      nameKr\n    }\n  }\n',
): typeof import('./graphql').CommunityProvidersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query MallGroups {\n    mallGroups {\n      id\n      title\n      isActive\n      sort\n    }\n  }\n',
): typeof import('./graphql').MallGroupsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query RecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n',
): typeof import('./graphql').RecommendedNotificationKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TossCategoryLabels {\n    tossCategoryLabels\n  }\n',
): typeof import('./graphql').TossCategoryLabelsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').TossProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n',
): typeof import('./graphql').MutationAddPushTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n',
): typeof import('./graphql').ProductInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n',
): typeof import('./graphql').ProductStatsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n',
): typeof import('./graphql').ProductGuidesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n',
): typeof import('./graphql').AddUserLikeOrDislikeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n',
): typeof import('./graphql').ProductPriceHistoryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n      commentSummary {\n        additionalInfo\n        option\n        price\n        productId\n        purchaseMethod\n        satisfaction\n        summary\n      }\n    }\n  }\n',
): typeof import('./graphql').ProductAdditionalInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n',
): typeof import('./graphql').CategorizedReactionKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').TogetherViewedProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n',
): typeof import('./graphql').CollectProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query KeywordProducts(\n    $keyword: String\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      keyword: $keyword\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').KeywordProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').CategoryProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n',
): typeof import('./graphql').AddWishlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n',
): typeof import('./graphql').RemoveWishlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddNotificationKeyword(\n    $keyword: String!\n    $fromRecommendation: Boolean\n    $priceDropOnly: Boolean\n  ) {\n    addNotificationKeyword(\n      keyword: $keyword\n      fromRecommendation: $fromRecommendation\n      priceDropOnly: $priceDropOnly\n    )\n  }\n',
): typeof import('./graphql').AddNotificationKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query MyNotificationKeywords($limit: Int!) {\n    notificationKeywordsByMe(limit: $limit) {\n      id\n      keyword\n    }\n  }\n',
): typeof import('./graphql').MyNotificationKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n',
): typeof import('./graphql').ReportExpiredProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n',
): typeof import('./graphql').QueryMeDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
