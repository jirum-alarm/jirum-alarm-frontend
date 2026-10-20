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
  'query activeAds($slotLocation: AdvertiseSlotLocation!) {\n  activeAds(slotLocation: $slotLocation) {\n    id\n    internalId\n    slotType\n    slotLocation\n    slotPriority\n    graphic\n    displayTitle\n    targetUrl\n    isActive\n  }\n}\n\nmutation recordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n  recordAdImpressions(events: $events)\n}\n\nmutation recordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {\n  recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n}': typeof types.ActiveAdsDocument;
  'mutation MutationLogin($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationSignup($email: String!, $password: String!, $nickname: String!, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  signup(\n    email: $email\n    password: $password\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n    }\n  }\n}\n\nmutation MutationUpdateUserProfile($nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  updateUserProfile(\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  )\n}\n\nquery QueryMe {\n  me {\n    id\n    email\n    nickname\n    birthYear\n    gender\n    favoriteCategories\n  }\n}\n\nquery QueryMyCategories {\n  me {\n    favoriteCategories\n  }\n}\n\nmutation QueryLoginByRefreshToken {\n  loginByRefreshToken {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationUpdatePassword($password: String!) {\n  updatePassword(password: $password)\n}\n\nmutation MutationWithdraw {\n  withdraw\n}\n\nmutation MutationAddUserDevice($deviceId: String!) {\n  addUserDevice(deviceId: $deviceId)\n}\n\nmutation MutationSocialLogin($oauthProvider: OauthProvider!, $socialAccessToken: String!, $email: String, $nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  socialLogin(\n    oauthProvider: $oauthProvider\n    socialAccessToken: $socialAccessToken\n    email: $email\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    type\n  }\n}\n\nquery QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n  socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n}': typeof types.MutationLoginDocument;
  'query QueryCategories {\n  categories {\n    id\n    name\n  }\n}': typeof types.QueryCategoriesDocument;
  'query comments($limit: Int!, $searchAfter: [String!], $productId: Int!, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    productId: $productId\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    content\n    createdAt\n    searchAfter\n    author {\n      id\n      nickname\n    }\n    likeCount\n    isMyLike\n  }\n}\n\nmutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n  addComment(productId: $productId, content: $content, parentId: $parentId)\n}\n\nmutation updateComment($id: Int!, $content: String!) {\n  updateComment(id: $id, content: $content)\n}\n\nmutation removeComment($id: Int!) {\n  removeComment(id: $id)\n}': typeof types.CommentsDocument;
  'query CommunityPosts($limit: Int!, $searchAfter: [String!], $isNotice: Boolean, $isTrending: Boolean, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    isNotice: $isNotice\n    isTrending: $isTrending\n    isRoot: true\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    title\n    content\n    createdAt\n    searchAfter\n    isNotice\n    likeCount\n    replyCount\n    viewCount\n    isMyLike\n    isMyReported\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nquery CommunityPost($id: Int!) {\n  comment(id: $id) {\n    id\n    title\n    content\n    createdAt\n    likeCount\n    viewCount\n    isMyLike\n    isNotice\n    isMyReported\n    productId\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nmutation AddCommunityPost($content: String!, $title: String, $productId: Int) {\n  addComment(content: $content, title: $title, productId: $productId)\n}\n\nmutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {\n  updateComment(id: $id, content: $content, title: $title)\n}\n\nmutation RemoveCommunityPost($id: Int!) {\n  removeComment(id: $id)\n}\n\nmutation ReportCommunityPost($targetId: Float!, $target: UserReportTarget!, $reason: UserReportReason!, $description: String) {\n  addUserReport(\n    target: $target\n    targetId: $targetId\n    reason: $reason\n    description: $description\n  )\n}\n\nmutation LikeCommunityPost($targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: COMMENT, targetId: $targetId, isLike: $isLike)\n}': typeof types.CommunityPostsDocument;
  'mutation MutationAddNotificationKeyword($keyword: String!, $fromRecommendation: Boolean) {\n  addNotificationKeyword(\n    keyword: $keyword\n    fromRecommendation: $fromRecommendation\n  )\n}\n\nmutation MutationRemoveNotificationKeyword($id: Float!) {\n  removeNotificationKeyword(id: $id)\n}\n\nquery QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {\n  notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {\n    id\n    keyword\n    priceDropOnly\n  }\n}': typeof types.MutationAddNotificationKeywordDocument;
  'mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n}': typeof types.AddUserLikeOrDislikeDocument;
  'query QueryNotifications($offset: Int!, $limit: Int!) {\n  notifications(offset: $offset, limit: $limit) {\n    id\n    readAt\n    createdAt\n    message\n    title\n    url\n    keyword\n    product {\n      id\n      thumbnail\n      price\n      isHot\n      isEnd\n      categoryId\n    }\n  }\n}\n\nquery QueryUnreadNotificationsCount {\n  unreadNotificationsCount\n}\n\nmutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n  addPushToken(token: $token, tokenType: $tokenType)\n}\n\nmutation MutationReadNotification($id: Int!) {\n  readNotification(id: $id)\n}\n\nmutation MutationReadAllNotifications {\n  readAllNotifications\n}': typeof types.QueryNotificationsDocument;
  'query product($id: Int!) {\n  product(id: $id) {\n    id\n    providerId\n    category\n    categoryId\n    mallId\n    title\n    url\n    detailUrl\n    isHot\n    isEnd\n    price\n    postedAt\n    thumbnail\n    wishlistCount\n    positiveCommunityReactionCount\n    negativeCommunityReactionCount\n    author {\n      id\n      nickname\n    }\n    provider {\n      id\n      name\n      nameKr\n      host\n    }\n    viewCount\n    mallName\n    prices {\n      id\n      target\n      type\n      price\n      createdAt\n    }\n    hotDealType\n    isYearLowest\n    hotDealIndex {\n      id\n      message\n      highestPrice\n      currentPrice\n      lowestPrice\n      visualConfig {\n        markerPct\n        q1Pct\n        q3Pct\n        medianPct\n        isClustered\n      }\n    }\n    isMyLike\n    isMyReported\n    likeCount\n    dislikeCount\n    isMyWishlist\n    categoryName\n  }\n}\n\nfragment ProductAdditionalInfo on ProductOutput {\n  id\n  url\n  positiveCommunityReactionCount\n  negativeCommunityReactionCount\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  prices {\n    id\n    target\n    type\n    price\n    createdAt\n  }\n  priceContext {\n    dealPrice\n    danawaPrice\n    delta\n    normalPriceMin\n    normalPriceMax\n    normalPriceMedian\n    danawaProductName\n    verificationStatus\n    shippingIncluded\n  }\n  hotDealType\n  isYearLowest\n  hotDealIndex {\n    id\n    message\n    highestPrice\n    currentPrice\n    lowestPrice\n    visualConfig {\n      markerPct\n      q1Pct\n      q3Pct\n      medianPct\n      isClustered\n    }\n  }\n  commentSummary {\n    additionalInfo\n    option\n    price\n    productId\n    purchaseMethod\n    satisfaction\n    summary\n  }\n}\n\nquery ProductAdditionalInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductAdditionalInfo\n  }\n}\n\nfragment ProductInfo on ProductOutput {\n  id\n  categoryId\n  categoryName\n  title\n  url\n  detailUrl\n  isProfitUrl\n  profitLinkProvider\n  isHot\n  isEnd\n  price\n  postedAt\n  thumbnail\n  uploaderType\n  content\n  author {\n    id\n    nickname\n  }\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  hotDealType\n  isYearLowest\n  viewCount\n  mallName\n  data\n}\n\nquery ProductInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductInfo\n  }\n}\n\nfragment ProductStats on ProductOutput {\n  id\n  isHot\n  isEnd\n  wishlistCount\n  isMyLike\n  isMyReported\n  likeCount\n  isMyWishlist\n}\n\nquery ProductStats($id: Int!) {\n  product(id: $id) {\n    ...ProductStats\n  }\n}\n\nquery QueryReportUserNames($productId: Int!) {\n  reportUserNames(productId: $productId)\n}\n\nquery productGuides($productId: Int!) {\n  productGuides(productId: $productId) {\n    id\n    title\n    content\n  }\n}\n\nquery QueryProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $orderOption: OrderOptionType, $categoryId: Int, $keyword: String, $thumbnailType: ThumbnailType, $isEnd: Boolean, $isHot: Boolean) {\n  products(\n    limit: $limit\n    searchAfter: $searchAfter\n    startDate: $startDate\n    orderBy: $orderBy\n    orderOption: $orderOption\n    categoryId: $categoryId\n    keyword: $keyword\n    thumbnailType: $thumbnailType\n    isEnd: $isEnd\n    isHot: $isHot\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n  communityRandomRankingProducts(count: $count, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery togetherViewedProducts($limit: Int!, $productId: Int!) {\n  togetherViewedProducts(limit: $limit, productId: $productId) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryProductKeywords {\n  productKeywords\n}\n\nmutation MutationCollectProduct($productId: Int!) {\n  collectProduct(productId: $productId)\n}\n\nmutation CreateUserProduct($title: String!, $url: String!, $categoryId: Int!, $price: String, $thumbnail: String, $content: String) {\n  createUserProduct(\n    title: $title\n    url: $url\n    categoryId: $categoryId\n    price: $price\n    thumbnail: $thumbnail\n    content: $content\n  )\n}\n\nmutation CreateProductImageUploadUrl($contentType: String!) {\n  createProductImageUploadUrl(contentType: $contentType) {\n    uploadUrl\n    imageUrl\n  }\n}\n\nmutation MutationReportExpiredProduct($productId: Int!) {\n  reportExpiredProduct(productId: $productId)\n}\n\nquery QueryCategorizedReactionKeywords($id: Int!) {\n  categorizedReactionKeywords(id: $id) {\n    lastUpdatedAt\n    items {\n      type\n      name\n      count\n      tag\n      role\n    }\n  }\n}\n\nquery QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n  hotDealRankingProducts(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryGuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n  guestRecommendedHotDeals(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryExpiringSoonHotDealProducts($daysUntilExpiry: Int!, $limit: Int!, $searchAfter: [String!]) {\n  expiringSoonHotDealProducts(\n    daysUntilExpiry: $daysUntilExpiry\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n    earliestExpiryDate\n  }\n}': typeof types.ProductDocument;
  'mutation AddWishlist($productId: Int!) {\n  addWishlist(productId: $productId)\n}\n\nmutation RemoveWishlist($productId: Int!) {\n  removeWishlist(productId: $productId)\n}\n\nquery QueryWishlists($orderBy: WishlistOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {\n  wishlists(\n    orderBy: $orderBy\n    orderOption: $orderOption\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    productId\n    searchAfter\n    product {\n      id\n      title\n      price\n      isHot\n      isEnd\n      isPrivate\n      postedAt\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      thumbnail\n      isMyWishlist\n      categoryId\n    }\n  }\n}\n\nquery QueryWishlistCount {\n  wishlistCount\n}': typeof types.AddWishlistDocument;
  '\n  query QueryMe {\n    me {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n    }\n  }\n': typeof types.QueryMeDocument;
  '\n  mutation QueryLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n': typeof types.QueryLoginByRefreshTokenDocument;
  '\n  mutation MutationUpdateUserProfile(\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    updateUserProfile(\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    )\n  }\n': typeof types.MutationUpdateUserProfileDocument;
  '\n  mutation MutationLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n': typeof types.MutationLoginDocument;
  '\n  mutation MutationSignup(\n    $email: String!\n    $password: String!\n    $nickname: String!\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    signup(\n      email: $email\n      password: $password\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        nickname\n        birthYear\n        gender\n        favoriteCategories\n        linkedSocialProviders\n      }\n    }\n  }\n': typeof types.MutationSignupDocument;
  '\n  mutation MutationUpdatePassword($password: String!) {\n    updatePassword(password: $password)\n  }\n': typeof types.MutationUpdatePasswordDocument;
  '\n  mutation MutationWithdraw {\n    withdraw\n  }\n': typeof types.MutationWithdrawDocument;
  '\n  query QueryRecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n': typeof types.QueryRecommendedNotificationKeywordsDocument;
  '\n  mutation MutationRemoveNotificationKeyword($id: Float!) {\n    removeNotificationKeyword(id: $id)\n  }\n': typeof types.MutationRemoveNotificationKeywordDocument;
  '\n  mutation MutationAddUserDevice($deviceId: String!) {\n    addUserDevice(deviceId: $deviceId)\n  }\n': typeof types.MutationAddUserDeviceDocument;
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n': typeof types.MutationSocialLoginDocument;
  '\n  query QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n    socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n  }\n': typeof types.QuerySocialAccessTokenDocument;
  '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n': typeof types.QueryCategoriesDocument;
  '\n  query QueryMyCategories {\n    me {\n      favoriteCategories\n    }\n  }\n': typeof types.QueryMyCategoriesDocument;
  '\n  query comments(\n    $limit: Int!\n    $searchAfter: [String!]\n    $productId: Int!\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      limit: $limit\n      searchAfter: $searchAfter\n      productId: $productId\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      author {\n        id\n        nickname\n      }\n      likeCount\n      isMyLike\n    }\n  }\n': typeof types.CommentsDocument;
  '\n  mutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n': typeof types.AddCommentDocument;
  '\n  mutation updateComment($id: Int!, $content: String!) {\n    updateComment(id: $id, content: $content)\n  }\n': typeof types.UpdateCommentDocument;
  '\n  mutation removeComment($id: Int!) {\n    removeComment(id: $id)\n  }\n': typeof types.RemoveCommentDocument;
  '\n  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n': typeof types.AddUserLikeOrDislikeDocument;
  '\n  query publishedModelPages {\n    publishedModelPages {\n      slug\n      brand\n      modelName\n      dealCount\n      heroImage\n      heroMinPrice\n      unitLabel\n      unitPrice\n      categoryId\n      categoryName\n      lastDealAt\n      activeDealCount\n      activePrice\n      activePostedAt\n      priceTone\n      savePct\n      buyLine\n      buyLineUnitLabel\n      trendPrices\n    }\n  }\n': typeof types.PublishedModelPagesDocument;
  '\n  query modelPage($slug: String!) {\n    modelPage(slug: $slug) {\n      slug\n      brand\n      modelName\n      dealCount\n      lastDealAt\n      metaDescription\n      payload\n      priceVerdict {\n        tone\n        pendingReason\n        activeDealCount\n        activeProductIds\n        bundleProductIds\n        bestProductId\n        comparePrice\n        activePrice\n        bestPackLabel\n        mallPrice\n        avgPrice\n        savePct\n        buyLine\n        historyPoints\n      }\n      recentDeals {\n        productId\n        title\n        price\n        priceCurrency\n        mallName\n        postedAt\n        thumbnail\n        isEnd\n        isVerified\n      }\n      keywordHub {\n        slug\n        name\n        recentDealCount\n        countCapped\n      }\n    }\n  }\n': typeof types.ModelPageDocument;
  '\n  query product($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      isYearLowest\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n        visualConfig {\n          markerPct\n          q1Pct\n          q3Pct\n          medianPct\n          isClustered\n        }\n      }\n      isMyLike\n      isMyReported\n      likeCount\n      dislikeCount\n      isMyWishlist\n      categoryName\n    }\n  }\n': typeof types.ProductDocument;
  '\n  query QueryReportUserNames($productId: Int!) {\n    reportUserNames(productId: $productId)\n  }\n': typeof types.QueryReportUserNamesDocument;
  '\n  query productGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n': typeof types.ProductGuidesDocument;
  '\n  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n    communityRandomRankingProducts(count: $count, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.QueryCommunityRandomRankingProductsDocument;
  '\n  query QueryProductKeywords {\n    productKeywords\n  }\n': typeof types.QueryProductKeywordsDocument;
  '\n  query QueryProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      # 토스 하루특가 배지(data.toss.todayDeal*·dealStatus·pageViewCount) — 20개에 ~14KB.\n      data\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.QueryProductsByKeywordDocument;
  '\n  query QueryCategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      lastUpdatedAt\n      items {\n        type\n        name\n        count\n        tag\n        role\n      }\n    }\n  }\n': typeof types.QueryCategorizedReactionKeywordsDocument;
  '\n  query QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.QueryHotDealRankingProductsDocument;
  '\n  mutation MutationReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n': typeof types.MutationReportExpiredProductDocument;
  '\n  mutation CreateUserProduct(\n    $title: String!\n    $url: String!\n    $categoryId: Int!\n    $price: String\n    $thumbnail: String\n    $content: String\n  ) {\n    createUserProduct(\n      title: $title\n      url: $url\n      categoryId: $categoryId\n      price: $price\n      thumbnail: $thumbnail\n      content: $content\n    )\n  }\n': typeof types.CreateUserProductDocument;
  '\n  mutation CreateProductImageUploadUrl($contentType: String!) {\n    createProductImageUploadUrl(contentType: $contentType) {\n      uploadUrl\n      imageUrl\n    }\n  }\n': typeof types.CreateProductImageUploadUrlDocument;
  '\n  query QueryTossCategoryLabels {\n    tossCategoryLabels\n  }\n': typeof types.QueryTossCategoryLabelsDocument;
  '\n  query QueryTossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.QueryTossProductsDocument;
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n': typeof types.AddWishlistDocument;
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n': typeof types.RemoveWishlistDocument;
  '\n  query QueryWishlists(\n    $orderBy: WishlistOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    wishlists(\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      productId\n      searchAfter\n      product {\n        id\n        title\n        price\n        isHot\n        isEnd\n        isPrivate\n        postedAt\n        hotDealType\n        isYearLowest\n        priceSaving {\n          basis\n          percent\n        }\n        thumbnail\n        isMyWishlist\n        categoryId\n      }\n    }\n  }\n': typeof types.QueryWishlistsDocument;
  '\n  query QueryWishlistCount {\n    wishlistCount\n  }\n': typeof types.QueryWishlistCountDocument;
};
const documents: Documents = {
  'query activeAds($slotLocation: AdvertiseSlotLocation!) {\n  activeAds(slotLocation: $slotLocation) {\n    id\n    internalId\n    slotType\n    slotLocation\n    slotPriority\n    graphic\n    displayTitle\n    targetUrl\n    isActive\n  }\n}\n\nmutation recordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n  recordAdImpressions(events: $events)\n}\n\nmutation recordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {\n  recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n}':
    types.ActiveAdsDocument,
  'mutation MutationLogin($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationSignup($email: String!, $password: String!, $nickname: String!, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  signup(\n    email: $email\n    password: $password\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n    }\n  }\n}\n\nmutation MutationUpdateUserProfile($nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  updateUserProfile(\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  )\n}\n\nquery QueryMe {\n  me {\n    id\n    email\n    nickname\n    birthYear\n    gender\n    favoriteCategories\n  }\n}\n\nquery QueryMyCategories {\n  me {\n    favoriteCategories\n  }\n}\n\nmutation QueryLoginByRefreshToken {\n  loginByRefreshToken {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationUpdatePassword($password: String!) {\n  updatePassword(password: $password)\n}\n\nmutation MutationWithdraw {\n  withdraw\n}\n\nmutation MutationAddUserDevice($deviceId: String!) {\n  addUserDevice(deviceId: $deviceId)\n}\n\nmutation MutationSocialLogin($oauthProvider: OauthProvider!, $socialAccessToken: String!, $email: String, $nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  socialLogin(\n    oauthProvider: $oauthProvider\n    socialAccessToken: $socialAccessToken\n    email: $email\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    type\n  }\n}\n\nquery QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n  socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n}':
    types.MutationLoginDocument,
  'query QueryCategories {\n  categories {\n    id\n    name\n  }\n}':
    types.QueryCategoriesDocument,
  'query comments($limit: Int!, $searchAfter: [String!], $productId: Int!, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    productId: $productId\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    content\n    createdAt\n    searchAfter\n    author {\n      id\n      nickname\n    }\n    likeCount\n    isMyLike\n  }\n}\n\nmutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n  addComment(productId: $productId, content: $content, parentId: $parentId)\n}\n\nmutation updateComment($id: Int!, $content: String!) {\n  updateComment(id: $id, content: $content)\n}\n\nmutation removeComment($id: Int!) {\n  removeComment(id: $id)\n}':
    types.CommentsDocument,
  'query CommunityPosts($limit: Int!, $searchAfter: [String!], $isNotice: Boolean, $isTrending: Boolean, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    isNotice: $isNotice\n    isTrending: $isTrending\n    isRoot: true\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    title\n    content\n    createdAt\n    searchAfter\n    isNotice\n    likeCount\n    replyCount\n    viewCount\n    isMyLike\n    isMyReported\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nquery CommunityPost($id: Int!) {\n  comment(id: $id) {\n    id\n    title\n    content\n    createdAt\n    likeCount\n    viewCount\n    isMyLike\n    isNotice\n    isMyReported\n    productId\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nmutation AddCommunityPost($content: String!, $title: String, $productId: Int) {\n  addComment(content: $content, title: $title, productId: $productId)\n}\n\nmutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {\n  updateComment(id: $id, content: $content, title: $title)\n}\n\nmutation RemoveCommunityPost($id: Int!) {\n  removeComment(id: $id)\n}\n\nmutation ReportCommunityPost($targetId: Float!, $target: UserReportTarget!, $reason: UserReportReason!, $description: String) {\n  addUserReport(\n    target: $target\n    targetId: $targetId\n    reason: $reason\n    description: $description\n  )\n}\n\nmutation LikeCommunityPost($targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: COMMENT, targetId: $targetId, isLike: $isLike)\n}':
    types.CommunityPostsDocument,
  'mutation MutationAddNotificationKeyword($keyword: String!, $fromRecommendation: Boolean) {\n  addNotificationKeyword(\n    keyword: $keyword\n    fromRecommendation: $fromRecommendation\n  )\n}\n\nmutation MutationRemoveNotificationKeyword($id: Float!) {\n  removeNotificationKeyword(id: $id)\n}\n\nquery QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {\n  notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {\n    id\n    keyword\n    priceDropOnly\n  }\n}':
    types.MutationAddNotificationKeywordDocument,
  'mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n}':
    types.AddUserLikeOrDislikeDocument,
  'query QueryNotifications($offset: Int!, $limit: Int!) {\n  notifications(offset: $offset, limit: $limit) {\n    id\n    readAt\n    createdAt\n    message\n    title\n    url\n    keyword\n    product {\n      id\n      thumbnail\n      price\n      isHot\n      isEnd\n      categoryId\n    }\n  }\n}\n\nquery QueryUnreadNotificationsCount {\n  unreadNotificationsCount\n}\n\nmutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n  addPushToken(token: $token, tokenType: $tokenType)\n}\n\nmutation MutationReadNotification($id: Int!) {\n  readNotification(id: $id)\n}\n\nmutation MutationReadAllNotifications {\n  readAllNotifications\n}':
    types.QueryNotificationsDocument,
  'query product($id: Int!) {\n  product(id: $id) {\n    id\n    providerId\n    category\n    categoryId\n    mallId\n    title\n    url\n    detailUrl\n    isHot\n    isEnd\n    price\n    postedAt\n    thumbnail\n    wishlistCount\n    positiveCommunityReactionCount\n    negativeCommunityReactionCount\n    author {\n      id\n      nickname\n    }\n    provider {\n      id\n      name\n      nameKr\n      host\n    }\n    viewCount\n    mallName\n    prices {\n      id\n      target\n      type\n      price\n      createdAt\n    }\n    hotDealType\n    isYearLowest\n    hotDealIndex {\n      id\n      message\n      highestPrice\n      currentPrice\n      lowestPrice\n      visualConfig {\n        markerPct\n        q1Pct\n        q3Pct\n        medianPct\n        isClustered\n      }\n    }\n    isMyLike\n    isMyReported\n    likeCount\n    dislikeCount\n    isMyWishlist\n    categoryName\n  }\n}\n\nfragment ProductAdditionalInfo on ProductOutput {\n  id\n  url\n  positiveCommunityReactionCount\n  negativeCommunityReactionCount\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  prices {\n    id\n    target\n    type\n    price\n    createdAt\n  }\n  priceContext {\n    dealPrice\n    danawaPrice\n    delta\n    normalPriceMin\n    normalPriceMax\n    normalPriceMedian\n    danawaProductName\n    verificationStatus\n    shippingIncluded\n  }\n  hotDealType\n  isYearLowest\n  hotDealIndex {\n    id\n    message\n    highestPrice\n    currentPrice\n    lowestPrice\n    visualConfig {\n      markerPct\n      q1Pct\n      q3Pct\n      medianPct\n      isClustered\n    }\n  }\n  commentSummary {\n    additionalInfo\n    option\n    price\n    productId\n    purchaseMethod\n    satisfaction\n    summary\n  }\n}\n\nquery ProductAdditionalInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductAdditionalInfo\n  }\n}\n\nfragment ProductInfo on ProductOutput {\n  id\n  categoryId\n  categoryName\n  title\n  url\n  detailUrl\n  isProfitUrl\n  profitLinkProvider\n  isHot\n  isEnd\n  price\n  postedAt\n  thumbnail\n  uploaderType\n  content\n  author {\n    id\n    nickname\n  }\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  hotDealType\n  isYearLowest\n  viewCount\n  mallName\n  data\n}\n\nquery ProductInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductInfo\n  }\n}\n\nfragment ProductStats on ProductOutput {\n  id\n  isHot\n  isEnd\n  wishlistCount\n  isMyLike\n  isMyReported\n  likeCount\n  isMyWishlist\n}\n\nquery ProductStats($id: Int!) {\n  product(id: $id) {\n    ...ProductStats\n  }\n}\n\nquery QueryReportUserNames($productId: Int!) {\n  reportUserNames(productId: $productId)\n}\n\nquery productGuides($productId: Int!) {\n  productGuides(productId: $productId) {\n    id\n    title\n    content\n  }\n}\n\nquery QueryProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $orderOption: OrderOptionType, $categoryId: Int, $keyword: String, $thumbnailType: ThumbnailType, $isEnd: Boolean, $isHot: Boolean) {\n  products(\n    limit: $limit\n    searchAfter: $searchAfter\n    startDate: $startDate\n    orderBy: $orderBy\n    orderOption: $orderOption\n    categoryId: $categoryId\n    keyword: $keyword\n    thumbnailType: $thumbnailType\n    isEnd: $isEnd\n    isHot: $isHot\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n  communityRandomRankingProducts(count: $count, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery togetherViewedProducts($limit: Int!, $productId: Int!) {\n  togetherViewedProducts(limit: $limit, productId: $productId) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryProductKeywords {\n  productKeywords\n}\n\nmutation MutationCollectProduct($productId: Int!) {\n  collectProduct(productId: $productId)\n}\n\nmutation CreateUserProduct($title: String!, $url: String!, $categoryId: Int!, $price: String, $thumbnail: String, $content: String) {\n  createUserProduct(\n    title: $title\n    url: $url\n    categoryId: $categoryId\n    price: $price\n    thumbnail: $thumbnail\n    content: $content\n  )\n}\n\nmutation CreateProductImageUploadUrl($contentType: String!) {\n  createProductImageUploadUrl(contentType: $contentType) {\n    uploadUrl\n    imageUrl\n  }\n}\n\nmutation MutationReportExpiredProduct($productId: Int!) {\n  reportExpiredProduct(productId: $productId)\n}\n\nquery QueryCategorizedReactionKeywords($id: Int!) {\n  categorizedReactionKeywords(id: $id) {\n    lastUpdatedAt\n    items {\n      type\n      name\n      count\n      tag\n      role\n    }\n  }\n}\n\nquery QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n  hotDealRankingProducts(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryGuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n  guestRecommendedHotDeals(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryExpiringSoonHotDealProducts($daysUntilExpiry: Int!, $limit: Int!, $searchAfter: [String!]) {\n  expiringSoonHotDealProducts(\n    daysUntilExpiry: $daysUntilExpiry\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n    earliestExpiryDate\n  }\n}':
    types.ProductDocument,
  'mutation AddWishlist($productId: Int!) {\n  addWishlist(productId: $productId)\n}\n\nmutation RemoveWishlist($productId: Int!) {\n  removeWishlist(productId: $productId)\n}\n\nquery QueryWishlists($orderBy: WishlistOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {\n  wishlists(\n    orderBy: $orderBy\n    orderOption: $orderOption\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    productId\n    searchAfter\n    product {\n      id\n      title\n      price\n      isHot\n      isEnd\n      isPrivate\n      postedAt\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      thumbnail\n      isMyWishlist\n      categoryId\n    }\n  }\n}\n\nquery QueryWishlistCount {\n  wishlistCount\n}':
    types.AddWishlistDocument,
  '\n  query QueryMe {\n    me {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n    }\n  }\n':
    types.QueryMeDocument,
  '\n  mutation QueryLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.QueryLoginByRefreshTokenDocument,
  '\n  mutation MutationUpdateUserProfile(\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    updateUserProfile(\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    )\n  }\n':
    types.MutationUpdateUserProfileDocument,
  '\n  mutation MutationLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationLoginDocument,
  '\n  mutation MutationSignup(\n    $email: String!\n    $password: String!\n    $nickname: String!\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    signup(\n      email: $email\n      password: $password\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        nickname\n        birthYear\n        gender\n        favoriteCategories\n        linkedSocialProviders\n      }\n    }\n  }\n':
    types.MutationSignupDocument,
  '\n  mutation MutationUpdatePassword($password: String!) {\n    updatePassword(password: $password)\n  }\n':
    types.MutationUpdatePasswordDocument,
  '\n  mutation MutationWithdraw {\n    withdraw\n  }\n': types.MutationWithdrawDocument,
  '\n  query QueryRecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n':
    types.QueryRecommendedNotificationKeywordsDocument,
  '\n  mutation MutationRemoveNotificationKeyword($id: Float!) {\n    removeNotificationKeyword(id: $id)\n  }\n':
    types.MutationRemoveNotificationKeywordDocument,
  '\n  mutation MutationAddUserDevice($deviceId: String!) {\n    addUserDevice(deviceId: $deviceId)\n  }\n':
    types.MutationAddUserDeviceDocument,
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n':
    types.MutationSocialLoginDocument,
  '\n  query QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n    socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n  }\n':
    types.QuerySocialAccessTokenDocument,
  '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n':
    types.QueryCategoriesDocument,
  '\n  query QueryMyCategories {\n    me {\n      favoriteCategories\n    }\n  }\n':
    types.QueryMyCategoriesDocument,
  '\n  query comments(\n    $limit: Int!\n    $searchAfter: [String!]\n    $productId: Int!\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      limit: $limit\n      searchAfter: $searchAfter\n      productId: $productId\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      author {\n        id\n        nickname\n      }\n      likeCount\n      isMyLike\n    }\n  }\n':
    types.CommentsDocument,
  '\n  mutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n':
    types.AddCommentDocument,
  '\n  mutation updateComment($id: Int!, $content: String!) {\n    updateComment(id: $id, content: $content)\n  }\n':
    types.UpdateCommentDocument,
  '\n  mutation removeComment($id: Int!) {\n    removeComment(id: $id)\n  }\n':
    types.RemoveCommentDocument,
  '\n  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n':
    types.AddUserLikeOrDislikeDocument,
  '\n  query publishedModelPages {\n    publishedModelPages {\n      slug\n      brand\n      modelName\n      dealCount\n      heroImage\n      heroMinPrice\n      unitLabel\n      unitPrice\n      categoryId\n      categoryName\n      lastDealAt\n      activeDealCount\n      activePrice\n      activePostedAt\n      priceTone\n      savePct\n      buyLine\n      buyLineUnitLabel\n      trendPrices\n    }\n  }\n':
    types.PublishedModelPagesDocument,
  '\n  query modelPage($slug: String!) {\n    modelPage(slug: $slug) {\n      slug\n      brand\n      modelName\n      dealCount\n      lastDealAt\n      metaDescription\n      payload\n      priceVerdict {\n        tone\n        pendingReason\n        activeDealCount\n        activeProductIds\n        bundleProductIds\n        bestProductId\n        comparePrice\n        activePrice\n        bestPackLabel\n        mallPrice\n        avgPrice\n        savePct\n        buyLine\n        historyPoints\n      }\n      recentDeals {\n        productId\n        title\n        price\n        priceCurrency\n        mallName\n        postedAt\n        thumbnail\n        isEnd\n        isVerified\n      }\n      keywordHub {\n        slug\n        name\n        recentDealCount\n        countCapped\n      }\n    }\n  }\n':
    types.ModelPageDocument,
  '\n  query product($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      isYearLowest\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n        visualConfig {\n          markerPct\n          q1Pct\n          q3Pct\n          medianPct\n          isClustered\n        }\n      }\n      isMyLike\n      isMyReported\n      likeCount\n      dislikeCount\n      isMyWishlist\n      categoryName\n    }\n  }\n':
    types.ProductDocument,
  '\n  query QueryReportUserNames($productId: Int!) {\n    reportUserNames(productId: $productId)\n  }\n':
    types.QueryReportUserNamesDocument,
  '\n  query productGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n':
    types.ProductGuidesDocument,
  '\n  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n    communityRandomRankingProducts(count: $count, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryCommunityRandomRankingProductsDocument,
  '\n  query QueryProductKeywords {\n    productKeywords\n  }\n':
    types.QueryProductKeywordsDocument,
  '\n  query QueryProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      # 토스 하루특가 배지(data.toss.todayDeal*·dealStatus·pageViewCount) — 20개에 ~14KB.\n      data\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryProductsByKeywordDocument,
  '\n  query QueryCategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      lastUpdatedAt\n      items {\n        type\n        name\n        count\n        tag\n        role\n      }\n    }\n  }\n':
    types.QueryCategorizedReactionKeywordsDocument,
  '\n  query QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryHotDealRankingProductsDocument,
  '\n  mutation MutationReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n':
    types.MutationReportExpiredProductDocument,
  '\n  mutation CreateUserProduct(\n    $title: String!\n    $url: String!\n    $categoryId: Int!\n    $price: String\n    $thumbnail: String\n    $content: String\n  ) {\n    createUserProduct(\n      title: $title\n      url: $url\n      categoryId: $categoryId\n      price: $price\n      thumbnail: $thumbnail\n      content: $content\n    )\n  }\n':
    types.CreateUserProductDocument,
  '\n  mutation CreateProductImageUploadUrl($contentType: String!) {\n    createProductImageUploadUrl(contentType: $contentType) {\n      uploadUrl\n      imageUrl\n    }\n  }\n':
    types.CreateProductImageUploadUrlDocument,
  '\n  query QueryTossCategoryLabels {\n    tossCategoryLabels\n  }\n':
    types.QueryTossCategoryLabelsDocument,
  '\n  query QueryTossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryTossProductsDocument,
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n':
    types.AddWishlistDocument,
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n':
    types.RemoveWishlistDocument,
  '\n  query QueryWishlists(\n    $orderBy: WishlistOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    wishlists(\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      productId\n      searchAfter\n      product {\n        id\n        title\n        price\n        isHot\n        isEnd\n        isPrivate\n        postedAt\n        hotDealType\n        isYearLowest\n        priceSaving {\n          basis\n          percent\n        }\n        thumbnail\n        isMyWishlist\n        categoryId\n      }\n    }\n  }\n':
    types.QueryWishlistsDocument,
  '\n  query QueryWishlistCount {\n    wishlistCount\n  }\n': types.QueryWishlistCountDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query activeAds($slotLocation: AdvertiseSlotLocation!) {\n  activeAds(slotLocation: $slotLocation) {\n    id\n    internalId\n    slotType\n    slotLocation\n    slotPriority\n    graphic\n    displayTitle\n    targetUrl\n    isActive\n  }\n}\n\nmutation recordAdImpressions($events: [AdvertiseImpressionInput!]!) {\n  recordAdImpressions(events: $events)\n}\n\nmutation recordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {\n  recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)\n}',
): typeof import('./graphql').ActiveAdsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation MutationLogin($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationSignup($email: String!, $password: String!, $nickname: String!, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  signup(\n    email: $email\n    password: $password\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n    }\n  }\n}\n\nmutation MutationUpdateUserProfile($nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  updateUserProfile(\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  )\n}\n\nquery QueryMe {\n  me {\n    id\n    email\n    nickname\n    birthYear\n    gender\n    favoriteCategories\n  }\n}\n\nquery QueryMyCategories {\n  me {\n    favoriteCategories\n  }\n}\n\nmutation QueryLoginByRefreshToken {\n  loginByRefreshToken {\n    accessToken\n    refreshToken\n  }\n}\n\nmutation MutationUpdatePassword($password: String!) {\n  updatePassword(password: $password)\n}\n\nmutation MutationWithdraw {\n  withdraw\n}\n\nmutation MutationAddUserDevice($deviceId: String!) {\n  addUserDevice(deviceId: $deviceId)\n}\n\nmutation MutationSocialLogin($oauthProvider: OauthProvider!, $socialAccessToken: String!, $email: String, $nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {\n  socialLogin(\n    oauthProvider: $oauthProvider\n    socialAccessToken: $socialAccessToken\n    email: $email\n    nickname: $nickname\n    birthYear: $birthYear\n    gender: $gender\n    favoriteCategories: $favoriteCategories\n  ) {\n    accessToken\n    refreshToken\n    type\n  }\n}\n\nquery QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n  socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n}',
): typeof import('./graphql').MutationLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query QueryCategories {\n  categories {\n    id\n    name\n  }\n}',
): typeof import('./graphql').QueryCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query comments($limit: Int!, $searchAfter: [String!], $productId: Int!, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    productId: $productId\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    content\n    createdAt\n    searchAfter\n    author {\n      id\n      nickname\n    }\n    likeCount\n    isMyLike\n  }\n}\n\nmutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n  addComment(productId: $productId, content: $content, parentId: $parentId)\n}\n\nmutation updateComment($id: Int!, $content: String!) {\n  updateComment(id: $id, content: $content)\n}\n\nmutation removeComment($id: Int!) {\n  removeComment(id: $id)\n}',
): typeof import('./graphql').CommentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query CommunityPosts($limit: Int!, $searchAfter: [String!], $isNotice: Boolean, $isTrending: Boolean, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {\n  comments(\n    limit: $limit\n    searchAfter: $searchAfter\n    isNotice: $isNotice\n    isTrending: $isTrending\n    isRoot: true\n    orderBy: $orderBy\n    orderOption: $orderOption\n  ) {\n    id\n    productId\n    parentId\n    title\n    content\n    createdAt\n    searchAfter\n    isNotice\n    likeCount\n    replyCount\n    viewCount\n    isMyLike\n    isMyReported\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nquery CommunityPost($id: Int!) {\n  comment(id: $id) {\n    id\n    title\n    content\n    createdAt\n    likeCount\n    viewCount\n    isMyLike\n    isNotice\n    isMyReported\n    productId\n    author {\n      id\n      nickname\n    }\n    taggedProduct {\n      id\n      title\n      thumbnail\n      price\n      postedAt\n      url\n    }\n  }\n}\n\nmutation AddCommunityPost($content: String!, $title: String, $productId: Int) {\n  addComment(content: $content, title: $title, productId: $productId)\n}\n\nmutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {\n  updateComment(id: $id, content: $content, title: $title)\n}\n\nmutation RemoveCommunityPost($id: Int!) {\n  removeComment(id: $id)\n}\n\nmutation ReportCommunityPost($targetId: Float!, $target: UserReportTarget!, $reason: UserReportReason!, $description: String) {\n  addUserReport(\n    target: $target\n    targetId: $targetId\n    reason: $reason\n    description: $description\n  )\n}\n\nmutation LikeCommunityPost($targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: COMMENT, targetId: $targetId, isLike: $isLike)\n}',
): typeof import('./graphql').CommunityPostsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation MutationAddNotificationKeyword($keyword: String!, $fromRecommendation: Boolean) {\n  addNotificationKeyword(\n    keyword: $keyword\n    fromRecommendation: $fromRecommendation\n  )\n}\n\nmutation MutationRemoveNotificationKeyword($id: Float!) {\n  removeNotificationKeyword(id: $id)\n}\n\nquery QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {\n  notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {\n    id\n    keyword\n    priceDropOnly\n  }\n}',
): typeof import('./graphql').MutationAddNotificationKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n  addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n}',
): typeof import('./graphql').AddUserLikeOrDislikeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query QueryNotifications($offset: Int!, $limit: Int!) {\n  notifications(offset: $offset, limit: $limit) {\n    id\n    readAt\n    createdAt\n    message\n    title\n    url\n    keyword\n    product {\n      id\n      thumbnail\n      price\n      isHot\n      isEnd\n      categoryId\n    }\n  }\n}\n\nquery QueryUnreadNotificationsCount {\n  unreadNotificationsCount\n}\n\nmutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n  addPushToken(token: $token, tokenType: $tokenType)\n}\n\nmutation MutationReadNotification($id: Int!) {\n  readNotification(id: $id)\n}\n\nmutation MutationReadAllNotifications {\n  readAllNotifications\n}',
): typeof import('./graphql').QueryNotificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query product($id: Int!) {\n  product(id: $id) {\n    id\n    providerId\n    category\n    categoryId\n    mallId\n    title\n    url\n    detailUrl\n    isHot\n    isEnd\n    price\n    postedAt\n    thumbnail\n    wishlistCount\n    positiveCommunityReactionCount\n    negativeCommunityReactionCount\n    author {\n      id\n      nickname\n    }\n    provider {\n      id\n      name\n      nameKr\n      host\n    }\n    viewCount\n    mallName\n    prices {\n      id\n      target\n      type\n      price\n      createdAt\n    }\n    hotDealType\n    isYearLowest\n    hotDealIndex {\n      id\n      message\n      highestPrice\n      currentPrice\n      lowestPrice\n      visualConfig {\n        markerPct\n        q1Pct\n        q3Pct\n        medianPct\n        isClustered\n      }\n    }\n    isMyLike\n    isMyReported\n    likeCount\n    dislikeCount\n    isMyWishlist\n    categoryName\n  }\n}\n\nfragment ProductAdditionalInfo on ProductOutput {\n  id\n  url\n  positiveCommunityReactionCount\n  negativeCommunityReactionCount\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  prices {\n    id\n    target\n    type\n    price\n    createdAt\n  }\n  priceContext {\n    dealPrice\n    danawaPrice\n    delta\n    normalPriceMin\n    normalPriceMax\n    normalPriceMedian\n    danawaProductName\n    verificationStatus\n    shippingIncluded\n  }\n  hotDealType\n  isYearLowest\n  hotDealIndex {\n    id\n    message\n    highestPrice\n    currentPrice\n    lowestPrice\n    visualConfig {\n      markerPct\n      q1Pct\n      q3Pct\n      medianPct\n      isClustered\n    }\n  }\n  commentSummary {\n    additionalInfo\n    option\n    price\n    productId\n    purchaseMethod\n    satisfaction\n    summary\n  }\n}\n\nquery ProductAdditionalInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductAdditionalInfo\n  }\n}\n\nfragment ProductInfo on ProductOutput {\n  id\n  categoryId\n  categoryName\n  title\n  url\n  detailUrl\n  isProfitUrl\n  profitLinkProvider\n  isHot\n  isEnd\n  price\n  postedAt\n  thumbnail\n  uploaderType\n  content\n  author {\n    id\n    nickname\n  }\n  provider {\n    id\n    name\n    nameKr\n    host\n  }\n  hotDealType\n  isYearLowest\n  viewCount\n  mallName\n  data\n}\n\nquery ProductInfo($id: Int!) {\n  product(id: $id) {\n    ...ProductInfo\n  }\n}\n\nfragment ProductStats on ProductOutput {\n  id\n  isHot\n  isEnd\n  wishlistCount\n  isMyLike\n  isMyReported\n  likeCount\n  isMyWishlist\n}\n\nquery ProductStats($id: Int!) {\n  product(id: $id) {\n    ...ProductStats\n  }\n}\n\nquery QueryReportUserNames($productId: Int!) {\n  reportUserNames(productId: $productId)\n}\n\nquery productGuides($productId: Int!) {\n  productGuides(productId: $productId) {\n    id\n    title\n    content\n  }\n}\n\nquery QueryProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $orderOption: OrderOptionType, $categoryId: Int, $keyword: String, $thumbnailType: ThumbnailType, $isEnd: Boolean, $isHot: Boolean) {\n  products(\n    limit: $limit\n    searchAfter: $searchAfter\n    startDate: $startDate\n    orderBy: $orderBy\n    orderOption: $orderOption\n    categoryId: $categoryId\n    keyword: $keyword\n    thumbnailType: $thumbnailType\n    isEnd: $isEnd\n    isHot: $isHot\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n  communityRandomRankingProducts(count: $count, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery togetherViewedProducts($limit: Int!, $productId: Int!) {\n  togetherViewedProducts(limit: $limit, productId: $productId) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryProductKeywords {\n  productKeywords\n}\n\nmutation MutationCollectProduct($productId: Int!) {\n  collectProduct(productId: $productId)\n}\n\nmutation CreateUserProduct($title: String!, $url: String!, $categoryId: Int!, $price: String, $thumbnail: String, $content: String) {\n  createUserProduct(\n    title: $title\n    url: $url\n    categoryId: $categoryId\n    price: $price\n    thumbnail: $thumbnail\n    content: $content\n  )\n}\n\nmutation CreateProductImageUploadUrl($contentType: String!) {\n  createProductImageUploadUrl(contentType: $contentType) {\n    uploadUrl\n    imageUrl\n  }\n}\n\nmutation MutationReportExpiredProduct($productId: Int!) {\n  reportExpiredProduct(productId: $productId)\n}\n\nquery QueryCategorizedReactionKeywords($id: Int!) {\n  categorizedReactionKeywords(id: $id) {\n    lastUpdatedAt\n    items {\n      type\n      name\n      count\n      tag\n      role\n    }\n  }\n}\n\nquery QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n  hotDealRankingProducts(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryGuestRecommendedHotDeals($page: Int!, $limit: Int!) {\n  guestRecommendedHotDeals(page: $page, limit: $limit) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n  }\n}\n\nquery QueryExpiringSoonHotDealProducts($daysUntilExpiry: Int!, $limit: Int!, $searchAfter: [String!]) {\n  expiringSoonHotDealProducts(\n    daysUntilExpiry: $daysUntilExpiry\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    title\n    mallId\n    url\n    isHot\n    isEnd\n    price\n    providerId\n    categoryId\n    category\n    thumbnail\n    hotDealType\n    isYearLowest\n    priceSaving {\n      basis\n      percent\n    }\n    provider {\n      nameKr\n    }\n    searchAfter\n    postedAt\n    earliestExpiryDate\n  }\n}',
): typeof import('./graphql').ProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation AddWishlist($productId: Int!) {\n  addWishlist(productId: $productId)\n}\n\nmutation RemoveWishlist($productId: Int!) {\n  removeWishlist(productId: $productId)\n}\n\nquery QueryWishlists($orderBy: WishlistOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {\n  wishlists(\n    orderBy: $orderBy\n    orderOption: $orderOption\n    limit: $limit\n    searchAfter: $searchAfter\n  ) {\n    id\n    productId\n    searchAfter\n    product {\n      id\n      title\n      price\n      isHot\n      isEnd\n      isPrivate\n      postedAt\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      thumbnail\n      isMyWishlist\n      categoryId\n    }\n  }\n}\n\nquery QueryWishlistCount {\n  wishlistCount\n}',
): typeof import('./graphql').AddWishlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMe {\n    me {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n    }\n  }\n',
): typeof import('./graphql').QueryMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QueryLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').QueryLoginByRefreshTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationUpdateUserProfile(\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    updateUserProfile(\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    )\n  }\n',
): typeof import('./graphql').MutationUpdateUserProfileDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').MutationLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationSignup(\n    $email: String!\n    $password: String!\n    $nickname: String!\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    signup(\n      email: $email\n      password: $password\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        nickname\n        birthYear\n        gender\n        favoriteCategories\n        linkedSocialProviders\n      }\n    }\n  }\n',
): typeof import('./graphql').MutationSignupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationUpdatePassword($password: String!) {\n    updatePassword(password: $password)\n  }\n',
): typeof import('./graphql').MutationUpdatePasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationWithdraw {\n    withdraw\n  }\n',
): typeof import('./graphql').MutationWithdrawDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryRecommendedNotificationKeywords {\n    recommendedNotificationKeywords\n  }\n',
): typeof import('./graphql').QueryRecommendedNotificationKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveNotificationKeyword($id: Float!) {\n    removeNotificationKeyword(id: $id)\n  }\n',
): typeof import('./graphql').MutationRemoveNotificationKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddUserDevice($deviceId: String!) {\n    addUserDevice(deviceId: $deviceId)\n  }\n',
): typeof import('./graphql').MutationAddUserDeviceDocument;
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
  source: '\n  query QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {\n    socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)\n  }\n',
): typeof import('./graphql').QuerySocialAccessTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n',
): typeof import('./graphql').QueryCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMyCategories {\n    me {\n      favoriteCategories\n    }\n  }\n',
): typeof import('./graphql').QueryMyCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query comments(\n    $limit: Int!\n    $searchAfter: [String!]\n    $productId: Int!\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      limit: $limit\n      searchAfter: $searchAfter\n      productId: $productId\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      author {\n        id\n        nickname\n      }\n      likeCount\n      isMyLike\n    }\n  }\n',
): typeof import('./graphql').CommentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n',
): typeof import('./graphql').AddCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateComment($id: Int!, $content: String!) {\n    updateComment(id: $id, content: $content)\n  }\n',
): typeof import('./graphql').UpdateCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeComment($id: Int!) {\n    removeComment(id: $id)\n  }\n',
): typeof import('./graphql').RemoveCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n',
): typeof import('./graphql').AddUserLikeOrDislikeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query publishedModelPages {\n    publishedModelPages {\n      slug\n      brand\n      modelName\n      dealCount\n      heroImage\n      heroMinPrice\n      unitLabel\n      unitPrice\n      categoryId\n      categoryName\n      lastDealAt\n      activeDealCount\n      activePrice\n      activePostedAt\n      priceTone\n      savePct\n      buyLine\n      buyLineUnitLabel\n      trendPrices\n    }\n  }\n',
): typeof import('./graphql').PublishedModelPagesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query modelPage($slug: String!) {\n    modelPage(slug: $slug) {\n      slug\n      brand\n      modelName\n      dealCount\n      lastDealAt\n      metaDescription\n      payload\n      priceVerdict {\n        tone\n        pendingReason\n        activeDealCount\n        activeProductIds\n        bundleProductIds\n        bestProductId\n        comparePrice\n        activePrice\n        bestPackLabel\n        mallPrice\n        avgPrice\n        savePct\n        buyLine\n        historyPoints\n      }\n      recentDeals {\n        productId\n        title\n        price\n        priceCurrency\n        mallName\n        postedAt\n        thumbnail\n        isEnd\n        isVerified\n      }\n      keywordHub {\n        slug\n        name\n        recentDealCount\n        countCapped\n      }\n    }\n  }\n',
): typeof import('./graphql').ModelPageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query product($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      isYearLowest\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n        visualConfig {\n          markerPct\n          q1Pct\n          q3Pct\n          medianPct\n          isClustered\n        }\n      }\n      isMyLike\n      isMyReported\n      likeCount\n      dislikeCount\n      isMyWishlist\n      categoryName\n    }\n  }\n',
): typeof import('./graphql').ProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryReportUserNames($productId: Int!) {\n    reportUserNames(productId: $productId)\n  }\n',
): typeof import('./graphql').QueryReportUserNamesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query productGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n',
): typeof import('./graphql').ProductGuidesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n    communityRandomRankingProducts(count: $count, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryCommunityRandomRankingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryProductKeywords {\n    productKeywords\n  }\n',
): typeof import('./graphql').QueryProductKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryProductsByKeyword(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      # 토스 하루특가 배지(data.toss.todayDeal*·dealStatus·pageViewCount) — 20개에 ~14KB.\n      data\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryProductsByKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryCategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      lastUpdatedAt\n      items {\n        type\n        name\n        count\n        tag\n        role\n      }\n    }\n  }\n',
): typeof import('./graphql').QueryCategorizedReactionKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryHotDealRankingProducts($page: Int!, $limit: Int!) {\n    hotDealRankingProducts(page: $page, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      isYearLowest\n      priceSaving {\n        basis\n        percent\n      }\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryHotDealRankingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n',
): typeof import('./graphql').MutationReportExpiredProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateUserProduct(\n    $title: String!\n    $url: String!\n    $categoryId: Int!\n    $price: String\n    $thumbnail: String\n    $content: String\n  ) {\n    createUserProduct(\n      title: $title\n      url: $url\n      categoryId: $categoryId\n      price: $price\n      thumbnail: $thumbnail\n      content: $content\n    )\n  }\n',
): typeof import('./graphql').CreateUserProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateProductImageUploadUrl($contentType: String!) {\n    createProductImageUploadUrl(contentType: $contentType) {\n      uploadUrl\n      imageUrl\n    }\n  }\n',
): typeof import('./graphql').CreateProductImageUploadUrlDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryTossCategoryLabels {\n    tossCategoryLabels\n  }\n',
): typeof import('./graphql').QueryTossCategoryLabelsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryTossProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $keyword: String!\n    $orderBy: KeywordProductOrderType!\n    $orderOption: OrderOptionType!\n    $tossCategoryLabel: String\n  ) {\n    productsByKeyword(\n      limit: $limit\n      searchAfter: $searchAfter\n      keyword: $keyword\n      orderBy: $orderBy\n      orderOption: $orderOption\n      tossCategoryLabel: $tossCategoryLabel\n    ) {\n      id\n      title\n      price\n      thumbnail\n      data\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryTossProductsDocument;
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
  source: '\n  query QueryWishlists(\n    $orderBy: WishlistOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    wishlists(\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      productId\n      searchAfter\n      product {\n        id\n        title\n        price\n        isHot\n        isEnd\n        isPrivate\n        postedAt\n        hotDealType\n        isYearLowest\n        priceSaving {\n          basis\n          percent\n        }\n        thumbnail\n        isMyWishlist\n        categoryId\n      }\n    }\n  }\n',
): typeof import('./graphql').QueryWishlistsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryWishlistCount {\n    wishlistCount\n  }\n',
): typeof import('./graphql').QueryWishlistCountDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
