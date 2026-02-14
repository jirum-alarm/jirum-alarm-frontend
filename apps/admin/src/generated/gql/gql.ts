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
  '\n  mutation MutationAdminLogin($email: String!, $password: String!) {\n    adminLogin(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n': typeof types.MutationAdminLoginDocument;
  '\n  query QueryAdminMe {\n    adminMe {\n      id\n      name\n      email\n    }\n  }\n': typeof types.QueryAdminMeDocument;
  '\n  query QueryBrandProductsOrderByMatchCount(\n    $limit: Int!\n    $searchAfter: [String!]\n    $brandItemId: Int\n    $title: String\n  ) {\n    brandProductsOrderByMatchCount(\n      limit: $limit\n      searchAfter: $searchAfter\n      brandItemId: $brandItemId\n      title: $title\n    ) {\n      id\n      danawaProductId\n      brandItemId\n      brandName\n      productName\n      volume\n      amount\n      matchCount\n      pendingVerificationCount\n      createdAt\n      searchAfter\n    }\n  }\n': typeof types.QueryBrandProductsOrderByMatchCountDocument;
  '\n  query QuerySimilarProducts($id: Int!) {\n    similarProducts(id: $id) {\n      id\n      title\n      url\n      thumbnail\n      price\n      categoryId\n      providerId\n      provider {\n        name\n      }\n      postedAt\n    }\n  }\n': typeof types.QuerySimilarProductsDocument;
  '\n  query QueryBrandProductsByMatchCountTotalCount($brandItemId: Int, $title: String) {\n    brandProductsByMatchCountTotalCount(brandItemId: $brandItemId, title: $title)\n  }\n': typeof types.QueryBrandProductsByMatchCountTotalCountDocument;
  '\n  query QueryBrandProductMatchCount($brandProductId: Int!) {\n    brandProductMatchCount(brandProductId: $brandProductId)\n  }\n': typeof types.QueryBrandProductMatchCountDocument;
  '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n': typeof types.QueryCategoriesDocument;
  '\n  query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {\n    commentsByAdmin(hotDealKeywordId: $hotDealKeywordId, synonyms: $synonyms, excludes: $excludes)\n  }\n': typeof types.CommentsByAdminDocument;
  '\n  query QueryHotDealKeywordsByAdmin(\n    $type: HotDealKeywordType\n    $orderBy: HotDealKeywordOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    hotDealKeywordsByAdmin(\n      type: $type\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      lastUpdatedAt\n      synonymCount\n      excludeKeywordCount\n      searchAfter\n    }\n  }\n': typeof types.QueryHotDealKeywordsByAdminDocument;
  '\n  mutation MutationAddHotDealKeywordByAdmin(\n    $type: HotDealKeywordType!\n    $keyword: String!\n    $weight: Float!\n    $isMajor: Boolean!\n  ) {\n    addHotDealKeywordByAdmin(type: $type, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n': typeof types.MutationAddHotDealKeywordByAdminDocument;
  '\n  mutation MutationRemoveHotDealKeywordByAdmin($id: Int!) {\n    removeHotDealKeywordByAdmin(id: $id)\n  }\n': typeof types.MutationRemoveHotDealKeywordByAdminDocument;
  '\n  mutation MutationUpdateHotDealKeywordByAdmin(\n    $id: Int!\n    $keyword: String\n    $weight: Float\n    $isMajor: Boolean\n  ) {\n    updateHotDealKeywordByAdmin(id: $id, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n': typeof types.MutationUpdateHotDealKeywordByAdminDocument;
  '\n  query QueryHotDealKeywordByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      synonyms {\n        id\n        hotDealKeywordId\n        keyword\n      }\n      excludeKeywords {\n        id\n        hotDealKeywordId\n        excludeKeyword\n      }\n    }\n  }\n': typeof types.QueryHotDealKeywordByAdminDocument;
  '\n  query QueryHotDealKeywordDetailByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n    }\n  }\n': typeof types.QueryHotDealKeywordDetailByAdminDocument;
  '\n  query QueryNotificationsByAdmin($limit: Int!, $searchAfter: [String!]) {\n    notificationsByAdmin(limit: $limit, searchAfter: $searchAfter) {\n      id\n      title\n      message\n      target\n      targetId\n      createdAt\n      searchAfter\n    }\n  }\n': typeof types.QueryNotificationsByAdminDocument;
  '\n  mutation MutationSendNotificationByAdmin(\n    $title: String!\n    $message: String!\n    $type: NotificationType!\n    $target: NotificationTarget\n    $targetId: Int\n    $url: String\n    $userIds: [Int!]\n  ) {\n    sendNotificationByAdmin(\n      title: $title\n      message: $message\n      type: $type\n      target: $target\n      targetId: $targetId\n      url: $url\n      userIds: $userIds\n    )\n  }\n': typeof types.MutationSendNotificationByAdminDocument;
  '\n  query QueryProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryId: Int\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryId: $categoryId\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n': typeof types.QueryProductsDocument;
  '\n  query QueryProduct($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      categoryName\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n      }\n      likeCount\n      dislikeCount\n    }\n  }\n': typeof types.QueryProductDocument;
  '\n  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keywords: [String!]!) {\n    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keywords: $keywords)\n  }\n': typeof types.MutationAddHotDealKeywordSynonymByAdminDocument;
  '\n  mutation MutationAddHotDealExcludeKeywordByAdmin(\n    $hotDealKeywordId: Int!\n    $excludeKeywords: [String!]!\n  ) {\n    addHotDealExcludeKeywordByAdmin(\n      hotDealKeywordId: $hotDealKeywordId\n      excludeKeywords: $excludeKeywords\n    )\n  }\n': typeof types.MutationAddHotDealExcludeKeywordByAdminDocument;
  '\n  mutation MutationRemoveHotDealKeywordSynonymByAdmin($ids: [Int!]!) {\n    removeHotDealKeywordSynonymByAdmin(ids: $ids)\n  }\n': typeof types.MutationRemoveHotDealKeywordSynonymByAdminDocument;
  '\n  mutation MutationRemoveHotDealExcludeKeywordByAdmin($ids: [Int!]!) {\n    removeHotDealExcludeKeywordByAdmin(ids: $ids)\n  }\n': typeof types.MutationRemoveHotDealExcludeKeywordByAdminDocument;
  '\n  query QueryUsersByAdmin($limit: Int!, $searchAfter: [String!], $keyword: String) {\n    usersByAdmin(limit: $limit, searchAfter: $searchAfter, keyword: $keyword) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      createdAt\n      searchAfter\n    }\n  }\n': typeof types.QueryUsersByAdminDocument;
  '\n  query QueryUserByAdmin($id: Int!) {\n    userByAdmin(id: $id) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n      createdAt\n    }\n  }\n': typeof types.QueryUserByAdminDocument;
  '\n  query QueryUsersTotalCountByAdmin($keyword: String) {\n    usersTotalCountByAdmin(keyword: $keyword)\n  }\n': typeof types.QueryUsersTotalCountByAdminDocument;
  '\n  query QueryPendingVerifications(\n    $limit: Int!\n    $searchAfter: [String!]\n    $prioritizeOld: Boolean\n    $orderBy: OrderOptionType\n    $brandProductId: Int\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerifications(\n      limit: $limit\n      searchAfter: $searchAfter\n      prioritizeOld: $prioritizeOld\n      orderBy: $orderBy\n      brandProductId: $brandProductId\n      verificationStatus: $verificationStatus\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n        price\n        url\n        provider {\n          name\n        }\n      }\n      danawaUrl\n      matchingConfidence\n      matchingReasoning\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n': typeof types.QueryPendingVerificationsDocument;
  '\n  query QueryVerificationStatistics {\n    verificationStatistics {\n      pending\n      verified\n      rejected\n      total\n    }\n  }\n': typeof types.QueryVerificationStatisticsDocument;
  '\n  query QueryVerificationHistory(\n    $limit: Int!\n    $searchAfter: [String!]\n    $verificationStatus: [ProductMappingVerificationStatus!]\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $productId: Int\n    $verifiedBy: Int\n    $orderBy: OrderOptionType\n  ) {\n    verificationHistory(\n      limit: $limit\n      searchAfter: $searchAfter\n      verificationStatus: $verificationStatus\n      matchStatus: $matchStatus\n      target: $target\n      productId: $productId\n      verifiedBy: $verifiedBy\n      orderBy: $orderBy\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n      }\n      danawaUrl\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n': typeof types.QueryVerificationHistoryDocument;
  '\n  mutation MutationVerifyProductMapping(\n    $productMappingId: Int!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    verifyProductMapping(productMappingId: $productMappingId, result: $result, feedback: $feedback)\n  }\n': typeof types.MutationVerifyProductMappingDocument;
  '\n  mutation MutationBatchVerifyProductMapping(\n    $productMappingIds: [Int!]!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    batchVerifyProductMapping(\n      productMappingIds: $productMappingIds\n      result: $result\n      feedback: $feedback\n    )\n  }\n': typeof types.MutationBatchVerifyProductMappingDocument;
  '\n  mutation MutationRemoveProductMapping($productId: Int!) {\n    removeProductMapping(productId: $productId)\n  }\n': typeof types.MutationRemoveProductMappingDocument;
  '\n  mutation MutationCancelVerification($productMappingId: Int!, $reason: String) {\n    cancelVerification(productMappingId: $productMappingId, reason: $reason)\n  }\n': typeof types.MutationCancelVerificationDocument;
  '\n  query QueryPendingVerificationsTotalCount(\n    $brandProductId: Int\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerificationsTotalCount(\n      brandProductId: $brandProductId\n      matchStatus: $matchStatus\n      target: $target\n      verificationStatus: $verificationStatus\n    )\n  }\n': typeof types.QueryPendingVerificationsTotalCountDocument;
};
const documents: Documents = {
  '\n  mutation MutationAdminLogin($email: String!, $password: String!) {\n    adminLogin(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationAdminLoginDocument,
  '\n  query QueryAdminMe {\n    adminMe {\n      id\n      name\n      email\n    }\n  }\n':
    types.QueryAdminMeDocument,
  '\n  query QueryBrandProductsOrderByMatchCount(\n    $limit: Int!\n    $searchAfter: [String!]\n    $brandItemId: Int\n    $title: String\n  ) {\n    brandProductsOrderByMatchCount(\n      limit: $limit\n      searchAfter: $searchAfter\n      brandItemId: $brandItemId\n      title: $title\n    ) {\n      id\n      danawaProductId\n      brandItemId\n      brandName\n      productName\n      volume\n      amount\n      matchCount\n      pendingVerificationCount\n      createdAt\n      searchAfter\n    }\n  }\n':
    types.QueryBrandProductsOrderByMatchCountDocument,
  '\n  query QuerySimilarProducts($id: Int!) {\n    similarProducts(id: $id) {\n      id\n      title\n      url\n      thumbnail\n      price\n      categoryId\n      providerId\n      provider {\n        name\n      }\n      postedAt\n    }\n  }\n':
    types.QuerySimilarProductsDocument,
  '\n  query QueryBrandProductsByMatchCountTotalCount($brandItemId: Int, $title: String) {\n    brandProductsByMatchCountTotalCount(brandItemId: $brandItemId, title: $title)\n  }\n':
    types.QueryBrandProductsByMatchCountTotalCountDocument,
  '\n  query QueryBrandProductMatchCount($brandProductId: Int!) {\n    brandProductMatchCount(brandProductId: $brandProductId)\n  }\n':
    types.QueryBrandProductMatchCountDocument,
  '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n':
    types.QueryCategoriesDocument,
  '\n  query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {\n    commentsByAdmin(hotDealKeywordId: $hotDealKeywordId, synonyms: $synonyms, excludes: $excludes)\n  }\n':
    types.CommentsByAdminDocument,
  '\n  query QueryHotDealKeywordsByAdmin(\n    $type: HotDealKeywordType\n    $orderBy: HotDealKeywordOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    hotDealKeywordsByAdmin(\n      type: $type\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      lastUpdatedAt\n      synonymCount\n      excludeKeywordCount\n      searchAfter\n    }\n  }\n':
    types.QueryHotDealKeywordsByAdminDocument,
  '\n  mutation MutationAddHotDealKeywordByAdmin(\n    $type: HotDealKeywordType!\n    $keyword: String!\n    $weight: Float!\n    $isMajor: Boolean!\n  ) {\n    addHotDealKeywordByAdmin(type: $type, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n':
    types.MutationAddHotDealKeywordByAdminDocument,
  '\n  mutation MutationRemoveHotDealKeywordByAdmin($id: Int!) {\n    removeHotDealKeywordByAdmin(id: $id)\n  }\n':
    types.MutationRemoveHotDealKeywordByAdminDocument,
  '\n  mutation MutationUpdateHotDealKeywordByAdmin(\n    $id: Int!\n    $keyword: String\n    $weight: Float\n    $isMajor: Boolean\n  ) {\n    updateHotDealKeywordByAdmin(id: $id, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n':
    types.MutationUpdateHotDealKeywordByAdminDocument,
  '\n  query QueryHotDealKeywordByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      synonyms {\n        id\n        hotDealKeywordId\n        keyword\n      }\n      excludeKeywords {\n        id\n        hotDealKeywordId\n        excludeKeyword\n      }\n    }\n  }\n':
    types.QueryHotDealKeywordByAdminDocument,
  '\n  query QueryHotDealKeywordDetailByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n    }\n  }\n':
    types.QueryHotDealKeywordDetailByAdminDocument,
  '\n  query QueryNotificationsByAdmin($limit: Int!, $searchAfter: [String!]) {\n    notificationsByAdmin(limit: $limit, searchAfter: $searchAfter) {\n      id\n      title\n      message\n      target\n      targetId\n      createdAt\n      searchAfter\n    }\n  }\n':
    types.QueryNotificationsByAdminDocument,
  '\n  mutation MutationSendNotificationByAdmin(\n    $title: String!\n    $message: String!\n    $type: NotificationType!\n    $target: NotificationTarget\n    $targetId: Int\n    $url: String\n    $userIds: [Int!]\n  ) {\n    sendNotificationByAdmin(\n      title: $title\n      message: $message\n      type: $type\n      target: $target\n      targetId: $targetId\n      url: $url\n      userIds: $userIds\n    )\n  }\n':
    types.MutationSendNotificationByAdminDocument,
  '\n  query QueryProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryId: Int\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryId: $categoryId\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryProductsDocument,
  '\n  query QueryProduct($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      categoryName\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n      }\n      likeCount\n      dislikeCount\n    }\n  }\n':
    types.QueryProductDocument,
  '\n  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keywords: [String!]!) {\n    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keywords: $keywords)\n  }\n':
    types.MutationAddHotDealKeywordSynonymByAdminDocument,
  '\n  mutation MutationAddHotDealExcludeKeywordByAdmin(\n    $hotDealKeywordId: Int!\n    $excludeKeywords: [String!]!\n  ) {\n    addHotDealExcludeKeywordByAdmin(\n      hotDealKeywordId: $hotDealKeywordId\n      excludeKeywords: $excludeKeywords\n    )\n  }\n':
    types.MutationAddHotDealExcludeKeywordByAdminDocument,
  '\n  mutation MutationRemoveHotDealKeywordSynonymByAdmin($ids: [Int!]!) {\n    removeHotDealKeywordSynonymByAdmin(ids: $ids)\n  }\n':
    types.MutationRemoveHotDealKeywordSynonymByAdminDocument,
  '\n  mutation MutationRemoveHotDealExcludeKeywordByAdmin($ids: [Int!]!) {\n    removeHotDealExcludeKeywordByAdmin(ids: $ids)\n  }\n':
    types.MutationRemoveHotDealExcludeKeywordByAdminDocument,
  '\n  query QueryUsersByAdmin($limit: Int!, $searchAfter: [String!], $keyword: String) {\n    usersByAdmin(limit: $limit, searchAfter: $searchAfter, keyword: $keyword) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      createdAt\n      searchAfter\n    }\n  }\n':
    types.QueryUsersByAdminDocument,
  '\n  query QueryUserByAdmin($id: Int!) {\n    userByAdmin(id: $id) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n      createdAt\n    }\n  }\n':
    types.QueryUserByAdminDocument,
  '\n  query QueryUsersTotalCountByAdmin($keyword: String) {\n    usersTotalCountByAdmin(keyword: $keyword)\n  }\n':
    types.QueryUsersTotalCountByAdminDocument,
  '\n  query QueryPendingVerifications(\n    $limit: Int!\n    $searchAfter: [String!]\n    $prioritizeOld: Boolean\n    $orderBy: OrderOptionType\n    $brandProductId: Int\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerifications(\n      limit: $limit\n      searchAfter: $searchAfter\n      prioritizeOld: $prioritizeOld\n      orderBy: $orderBy\n      brandProductId: $brandProductId\n      verificationStatus: $verificationStatus\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n        price\n        url\n        provider {\n          name\n        }\n      }\n      danawaUrl\n      matchingConfidence\n      matchingReasoning\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n':
    types.QueryPendingVerificationsDocument,
  '\n  query QueryVerificationStatistics {\n    verificationStatistics {\n      pending\n      verified\n      rejected\n      total\n    }\n  }\n':
    types.QueryVerificationStatisticsDocument,
  '\n  query QueryVerificationHistory(\n    $limit: Int!\n    $searchAfter: [String!]\n    $verificationStatus: [ProductMappingVerificationStatus!]\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $productId: Int\n    $verifiedBy: Int\n    $orderBy: OrderOptionType\n  ) {\n    verificationHistory(\n      limit: $limit\n      searchAfter: $searchAfter\n      verificationStatus: $verificationStatus\n      matchStatus: $matchStatus\n      target: $target\n      productId: $productId\n      verifiedBy: $verifiedBy\n      orderBy: $orderBy\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n      }\n      danawaUrl\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n':
    types.QueryVerificationHistoryDocument,
  '\n  mutation MutationVerifyProductMapping(\n    $productMappingId: Int!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    verifyProductMapping(productMappingId: $productMappingId, result: $result, feedback: $feedback)\n  }\n':
    types.MutationVerifyProductMappingDocument,
  '\n  mutation MutationBatchVerifyProductMapping(\n    $productMappingIds: [Int!]!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    batchVerifyProductMapping(\n      productMappingIds: $productMappingIds\n      result: $result\n      feedback: $feedback\n    )\n  }\n':
    types.MutationBatchVerifyProductMappingDocument,
  '\n  mutation MutationRemoveProductMapping($productId: Int!) {\n    removeProductMapping(productId: $productId)\n  }\n':
    types.MutationRemoveProductMappingDocument,
  '\n  mutation MutationCancelVerification($productMappingId: Int!, $reason: String) {\n    cancelVerification(productMappingId: $productMappingId, reason: $reason)\n  }\n':
    types.MutationCancelVerificationDocument,
  '\n  query QueryPendingVerificationsTotalCount(\n    $brandProductId: Int\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerificationsTotalCount(\n      brandProductId: $brandProductId\n      matchStatus: $matchStatus\n      target: $target\n      verificationStatus: $verificationStatus\n    )\n  }\n':
    types.QueryPendingVerificationsTotalCountDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAdminLogin($email: String!, $password: String!) {\n    adminLogin(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').MutationAdminLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryAdminMe {\n    adminMe {\n      id\n      name\n      email\n    }\n  }\n',
): typeof import('./graphql').QueryAdminMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryBrandProductsOrderByMatchCount(\n    $limit: Int!\n    $searchAfter: [String!]\n    $brandItemId: Int\n    $title: String\n  ) {\n    brandProductsOrderByMatchCount(\n      limit: $limit\n      searchAfter: $searchAfter\n      brandItemId: $brandItemId\n      title: $title\n    ) {\n      id\n      danawaProductId\n      brandItemId\n      brandName\n      productName\n      volume\n      amount\n      matchCount\n      pendingVerificationCount\n      createdAt\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryBrandProductsOrderByMatchCountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QuerySimilarProducts($id: Int!) {\n    similarProducts(id: $id) {\n      id\n      title\n      url\n      thumbnail\n      price\n      categoryId\n      providerId\n      provider {\n        name\n      }\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QuerySimilarProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryBrandProductsByMatchCountTotalCount($brandItemId: Int, $title: String) {\n    brandProductsByMatchCountTotalCount(brandItemId: $brandItemId, title: $title)\n  }\n',
): typeof import('./graphql').QueryBrandProductsByMatchCountTotalCountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryBrandProductMatchCount($brandProductId: Int!) {\n    brandProductMatchCount(brandProductId: $brandProductId)\n  }\n',
): typeof import('./graphql').QueryBrandProductMatchCountDocument;
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
  source: '\n  query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {\n    commentsByAdmin(hotDealKeywordId: $hotDealKeywordId, synonyms: $synonyms, excludes: $excludes)\n  }\n',
): typeof import('./graphql').CommentsByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryHotDealKeywordsByAdmin(\n    $type: HotDealKeywordType\n    $orderBy: HotDealKeywordOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    hotDealKeywordsByAdmin(\n      type: $type\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      lastUpdatedAt\n      synonymCount\n      excludeKeywordCount\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryHotDealKeywordsByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddHotDealKeywordByAdmin(\n    $type: HotDealKeywordType!\n    $keyword: String!\n    $weight: Float!\n    $isMajor: Boolean!\n  ) {\n    addHotDealKeywordByAdmin(type: $type, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n',
): typeof import('./graphql').MutationAddHotDealKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveHotDealKeywordByAdmin($id: Int!) {\n    removeHotDealKeywordByAdmin(id: $id)\n  }\n',
): typeof import('./graphql').MutationRemoveHotDealKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationUpdateHotDealKeywordByAdmin(\n    $id: Int!\n    $keyword: String\n    $weight: Float\n    $isMajor: Boolean\n  ) {\n    updateHotDealKeywordByAdmin(id: $id, keyword: $keyword, weight: $weight, isMajor: $isMajor)\n  }\n',
): typeof import('./graphql').MutationUpdateHotDealKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryHotDealKeywordByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n      synonyms {\n        id\n        hotDealKeywordId\n        keyword\n      }\n      excludeKeywords {\n        id\n        hotDealKeywordId\n        excludeKeyword\n      }\n    }\n  }\n',
): typeof import('./graphql').QueryHotDealKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryHotDealKeywordDetailByAdmin($id: Int!) {\n    hotDealKeywordByAdmin(id: $id) {\n      id\n      type\n      keyword\n      weight\n      isMajor\n    }\n  }\n',
): typeof import('./graphql').QueryHotDealKeywordDetailByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryNotificationsByAdmin($limit: Int!, $searchAfter: [String!]) {\n    notificationsByAdmin(limit: $limit, searchAfter: $searchAfter) {\n      id\n      title\n      message\n      target\n      targetId\n      createdAt\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryNotificationsByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationSendNotificationByAdmin(\n    $title: String!\n    $message: String!\n    $type: NotificationType!\n    $target: NotificationTarget\n    $targetId: Int\n    $url: String\n    $userIds: [Int!]\n  ) {\n    sendNotificationByAdmin(\n      title: $title\n      message: $message\n      type: $type\n      target: $target\n      targetId: $targetId\n      url: $url\n      userIds: $userIds\n    )\n  }\n',
): typeof import('./graphql').MutationSendNotificationByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryId: Int\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryId: $categoryId\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      hotDealType\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryProduct($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      categoryName\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      hotDealType\n      hotDealIndex {\n        id\n        message\n        highestPrice\n        currentPrice\n        lowestPrice\n      }\n      likeCount\n      dislikeCount\n    }\n  }\n',
): typeof import('./graphql').QueryProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keywords: [String!]!) {\n    addHotDealKeywordSynonymByAdmin(hotDealKeywordId: $hotDealKeywordId, keywords: $keywords)\n  }\n',
): typeof import('./graphql').MutationAddHotDealKeywordSynonymByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddHotDealExcludeKeywordByAdmin(\n    $hotDealKeywordId: Int!\n    $excludeKeywords: [String!]!\n  ) {\n    addHotDealExcludeKeywordByAdmin(\n      hotDealKeywordId: $hotDealKeywordId\n      excludeKeywords: $excludeKeywords\n    )\n  }\n',
): typeof import('./graphql').MutationAddHotDealExcludeKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveHotDealKeywordSynonymByAdmin($ids: [Int!]!) {\n    removeHotDealKeywordSynonymByAdmin(ids: $ids)\n  }\n',
): typeof import('./graphql').MutationRemoveHotDealKeywordSynonymByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveHotDealExcludeKeywordByAdmin($ids: [Int!]!) {\n    removeHotDealExcludeKeywordByAdmin(ids: $ids)\n  }\n',
): typeof import('./graphql').MutationRemoveHotDealExcludeKeywordByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryUsersByAdmin($limit: Int!, $searchAfter: [String!], $keyword: String) {\n    usersByAdmin(limit: $limit, searchAfter: $searchAfter, keyword: $keyword) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      createdAt\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryUsersByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryUserByAdmin($id: Int!) {\n    userByAdmin(id: $id) {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n      linkedSocialProviders\n      createdAt\n    }\n  }\n',
): typeof import('./graphql').QueryUserByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryUsersTotalCountByAdmin($keyword: String) {\n    usersTotalCountByAdmin(keyword: $keyword)\n  }\n',
): typeof import('./graphql').QueryUsersTotalCountByAdminDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryPendingVerifications(\n    $limit: Int!\n    $searchAfter: [String!]\n    $prioritizeOld: Boolean\n    $orderBy: OrderOptionType\n    $brandProductId: Int\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerifications(\n      limit: $limit\n      searchAfter: $searchAfter\n      prioritizeOld: $prioritizeOld\n      orderBy: $orderBy\n      brandProductId: $brandProductId\n      verificationStatus: $verificationStatus\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n        price\n        url\n        provider {\n          name\n        }\n      }\n      danawaUrl\n      matchingConfidence\n      matchingReasoning\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryPendingVerificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryVerificationStatistics {\n    verificationStatistics {\n      pending\n      verified\n      rejected\n      total\n    }\n  }\n',
): typeof import('./graphql').QueryVerificationStatisticsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryVerificationHistory(\n    $limit: Int!\n    $searchAfter: [String!]\n    $verificationStatus: [ProductMappingVerificationStatus!]\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $productId: Int\n    $verifiedBy: Int\n    $orderBy: OrderOptionType\n  ) {\n    verificationHistory(\n      limit: $limit\n      searchAfter: $searchAfter\n      verificationStatus: $verificationStatus\n      matchStatus: $matchStatus\n      target: $target\n      productId: $productId\n      verifiedBy: $verifiedBy\n      orderBy: $orderBy\n    ) {\n      id\n      productId\n      brandProduct\n      product {\n        title\n        thumbnail\n      }\n      danawaUrl\n\n      verificationStatus\n      verifiedBy {\n        id\n        name\n        email\n      }\n      verifiedAt\n      verificationNote\n      createdAt\n      searchAfter\n    }\n  }\n',
): typeof import('./graphql').QueryVerificationHistoryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationVerifyProductMapping(\n    $productMappingId: Int!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    verifyProductMapping(productMappingId: $productMappingId, result: $result, feedback: $feedback)\n  }\n',
): typeof import('./graphql').MutationVerifyProductMappingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationBatchVerifyProductMapping(\n    $productMappingIds: [Int!]!\n    $result: ProductMappingVerificationStatus!\n    $feedback: String\n  ) {\n    batchVerifyProductMapping(\n      productMappingIds: $productMappingIds\n      result: $result\n      feedback: $feedback\n    )\n  }\n',
): typeof import('./graphql').MutationBatchVerifyProductMappingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveProductMapping($productId: Int!) {\n    removeProductMapping(productId: $productId)\n  }\n',
): typeof import('./graphql').MutationRemoveProductMappingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationCancelVerification($productMappingId: Int!, $reason: String) {\n    cancelVerification(productMappingId: $productMappingId, reason: $reason)\n  }\n',
): typeof import('./graphql').MutationCancelVerificationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryPendingVerificationsTotalCount(\n    $brandProductId: Int\n    $matchStatus: [ProductMappingMatchStatus!]\n    $target: ProductMappingTarget\n    $verificationStatus: [ProductMappingVerificationStatus!]\n  ) {\n    pendingVerificationsTotalCount(\n      brandProductId: $brandProductId\n      matchStatus: $matchStatus\n      target: $target\n      verificationStatus: $verificationStatus\n    )\n  }\n',
): typeof import('./graphql').QueryPendingVerificationsTotalCountDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
