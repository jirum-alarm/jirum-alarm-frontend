import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any };
};

export type AdminUser = {
  __typename?: 'AdminUser';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ApiQuery = {
  __typename?: 'ApiQuery';
  dependsOn?: Maybe<Scalars['String']['output']>;
  query: Scalars['String']['output'];
  variables?: Maybe<Scalars['JSONObject']['output']>;
};

export type BaseSection = {
  cta?: Maybe<Cta>;
  title: Scalars['String']['output'];
  type: Scalars['ID']['output'];
};

export type CategorizedReactionKeywords = {
  __typename?: 'CategorizedReactionKeywords';
  count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  tag: Scalars['String']['output'];
  type: HotDealKeywordType;
};

export type CategorizedReactionKeywordsResponse = {
  __typename?: 'CategorizedReactionKeywordsResponse';
  items: Array<CategorizedReactionKeywords>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export enum CommentOrder {
  Id = 'ID',
}

export type CommentOutput = {
  __typename?: 'CommentOutput';
  /** 댓글 작성자 */
  author?: Maybe<User>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isMyLike?: Maybe<Scalars['Boolean']['output']>;
  likeCount: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Float']['output']>;
  productId: Scalars['Float']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  userId: Scalars['Float']['output'];
};

export type Cta = {
  __typename?: 'Cta';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum CurrencyType {
  Dollor = 'DOLLOR',
  Won = 'WON',
}

export type DanawaProductOutput = {
  __typename?: 'DanawaProductOutput';
  amount?: Maybe<Scalars['String']['output']>;
  brandName: Scalars['String']['output'];
  brandProductId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mallCount: Scalars['Float']['output'];
  productName: Scalars['String']['output'];
  volume?: Maybe<Scalars['String']['output']>;
};

export type ExistsUserOutput = {
  __typename?: 'ExistsUserOutput';
  email: Scalars['Boolean']['output'];
  social: Scalars['Boolean']['output'];
};

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
}

export type HomeHotDealSection = BaseSection & {
  __typename?: 'HomeHotDealSection';
  cta?: Maybe<Cta>;
  dataSources: Array<ApiQuery>;
  displayType: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['ID']['output'];
};

export type HomeRankingSection = BaseSection & {
  __typename?: 'HomeRankingSection';
  cta?: Maybe<Cta>;
  dataSources: Array<ApiQuery>;
  displayType: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['ID']['output'];
};

export type HomeRecommendationSection = BaseSection & {
  __typename?: 'HomeRecommendationSection';
  cta?: Maybe<Cta>;
  dataSources: Array<ApiQuery>;
  displayType: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['ID']['output'];
};

export enum HotDealExcludeKeywordOrderType {
  Id = 'ID',
}

export type HotDealExcludeKeywordOutput = {
  __typename?: 'HotDealExcludeKeywordOutput';
  excludeKeyword: Scalars['String']['output'];
  hotDealKeywordId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
};

export enum HotDealKeywordOrderType {
  Id = 'ID',
  Weight = 'WEIGHT',
}

export type HotDealKeywordOutput = {
  __typename?: 'HotDealKeywordOutput';
  excludeKeywordCount: Scalars['Int']['output'];
  excludeKeywords: Array<HotDealExcludeKeywordOutput>;
  groupId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isMajor: Scalars['Boolean']['output'];
  keyword: Scalars['String']['output'];
  lastUpdatedAt: Scalars['DateTime']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  synonymCount: Scalars['Int']['output'];
  synonyms: Array<HotDealKeywordSynonymOutput>;
  type: HotDealKeywordType;
  weight: Scalars['Float']['output'];
};

export enum HotDealKeywordSynonymOrderType {
  Id = 'ID',
}

export type HotDealKeywordSynonymOutput = {
  __typename?: 'HotDealKeywordSynonymOutput';
  hotDealKeywordId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  keyword: Scalars['String']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
};

export enum HotDealKeywordType {
  Negative = 'NEGATIVE',
  Positive = 'POSITIVE',
  Synonym = 'SYNONYM',
}

/** 핫딜 타입 */
export enum HotDealType {
  /** 핫딜 */
  HotDeal = 'HOT_DEAL',
  /** 대박딜 */
  SuperDeal = 'SUPER_DEAL',
  /** 초대박딜 */
  UltraDeal = 'ULTRA_DEAL',
}

export type InstagramPost = {
  __typename?: 'InstagramPost';
  content: Scalars['String']['output'];
  dagDefinition: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reservedAt: Scalars['DateTime']['output'];
  thumbnail: Scalars['String']['output'];
  type: InstagramPostType;
};

export enum InstagramPostType {
  Normal = 'NORMAL',
}

export type ItemUnion = HomeHotDealSection | HomeRankingSection | HomeRecommendationSection;

export enum KeywordProductOrderType {
  PostedAt = 'POSTED_AT',
}

export type Mutation = {
  __typename?: 'Mutation';
  addComment: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 제외 키워드 추가 */
  addHotDealExcludeKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민)핫딜 키워드 추가 */
  addHotDealKeywordByAdmin: Scalars['Int']['output'];
  /** 어드민) 핫딜 유의어 추가 */
  addHotDealKeywordSynonymByAdmin: Scalars['Boolean']['output'];
  /** 알림 키워드 추가 */
  addNotificationKeyword: Scalars['Boolean']['output'];
  /** 비회원 푸시 */
  addNotificationToNonUsers: Scalars['Boolean']['output'];
  /** 주제 지정하여 알림 센터에 알림을 추가하거나 푸시를 보내거나 모두 수행 */
  addNotificationToTopic: Scalars['Boolean']['output'];
  /** 유저 ID 지정하여 알림 센터에 알림을 추가하거나 푸시를 보내거나 모두 수행 */
  addNotificationToUsers: Scalars['Boolean']['output'];
  addProductMapping: Scalars['Boolean']['output'];
  /** 푸시를 받기위한 토큰 등록 */
  addPushToken: Scalars['Boolean']['output'];
  addUserLikeOrDislike: Scalars['Boolean']['output'];
  /** wishlist 추가 */
  addWishlist: Scalars['Boolean']['output'];
  /** 어드민) 로그인 */
  adminLogin: TokenOutput;
  /** 상품 단건 수집 */
  collectProduct: Scalars['Boolean']['output'];
  /** 썸네일 단건 수집 */
  collectThumbnail: Scalars['Boolean']['output'];
  /** 로그인 */
  login: TokenOutput;
  /** 리프레시 토큰으로 로그인 */
  loginByRefreshToken: TokenOutput;
  /** 로그아웃 */
  logout: Scalars['Boolean']['output'];
  matchProductToDanawaProduct: Scalars['Boolean']['output'];
  /** 모든 알림 읽음 처리 */
  readAllNotifications: Scalars['Boolean']['output'];
  /** 모든 알림 읽음 처리 */
  readNotification: Scalars['Boolean']['output'];
  /** 모든 알림 삭제 */
  removeAllNotifications: Scalars['Boolean']['output'];
  removeComment: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 제외 키워드 추가 */
  removeHotDealExcludeKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 키워드 제거 */
  removeHotDealKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 유의어 제거 */
  removeHotDealKeywordSynonymByAdmin: Scalars['Boolean']['output'];
  /** 단일 알림 삭제 */
  removeNotification: Scalars['Boolean']['output'];
  /** 알림 키워드 제거 */
  removeNotificationKeyword: Scalars['Boolean']['output'];
  removeProductMapping: Scalars['Boolean']['output'];
  /** 토큰에 연결된 `userId` 연결 해제 */
  removeTokenLinkage: Scalars['Boolean']['output'];
  /** wishlist 제거 */
  removeWishlist: Scalars['Boolean']['output'];
  /** 종료된 상품 제보 */
  reportExpiredProduct: Scalars['Boolean']['output'];
  /** 인스타그램 게시글 예약 */
  reserveInstagramPost: Scalars['Boolean']['output'];
  /** 회원가입 */
  signup: SignupOutput;
  /** 소셜 로그인 */
  socialLogin: SocialLoginOutput;
  updateComment: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 키워드 수정 */
  updateHotDealKeywordByAdmin: Scalars['Boolean']['output'];
  /** 알림 키워드 상태 수정 */
  updateNotificationKeywordStatus: Scalars['Boolean']['output'];
  /** 비밀번호 업데이트 */
  updatePassword: Scalars['Boolean']['output'];
  /** 계정 별로 관리되는 푸시 설정 업데이트 */
  updatePushSetting: Scalars['Boolean']['output'];
  /** 유저 프로필 수정 */
  updateUserProfile: Scalars['Boolean']['output'];
  /** 인스타그램 게시글 업로드 */
  uploadInstagramPost: Scalars['String']['output'];
  /** 회원 탈퇴 */
  withdraw: Scalars['Boolean']['output'];
};

export type MutationAddCommentArgs = {
  content: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
};

export type MutationAddHotDealExcludeKeywordByAdminArgs = {
  excludeKeywords: Array<Scalars['String']['input']>;
  hotDealKeywordId: Scalars['Int']['input'];
};

export type MutationAddHotDealKeywordByAdminArgs = {
  isMajor: Scalars['Boolean']['input'];
  keyword: Scalars['String']['input'];
  type: HotDealKeywordType;
  weight: Scalars['Float']['input'];
};

export type MutationAddHotDealKeywordSynonymByAdminArgs = {
  hotDealKeywordId: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
};

export type MutationAddNotificationKeywordArgs = {
  keyword: Scalars['String']['input'];
};

export type MutationAddNotificationToNonUsersArgs = {
  body: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type MutationAddNotificationToTopicArgs = {
  body: Scalars['String']['input'];
  notificationType: NotificationType;
  throttle?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  topic: NotificationTopic;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type MutationAddNotificationToUsersArgs = {
  body: Scalars['String']['input'];
  notificationType: NotificationType;
  target: NotificationTarget;
  targetId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  userIds: Array<Scalars['Int']['input']>;
};

export type MutationAddProductMappingArgs = {
  brandProductId: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
};

export type MutationAddPushTokenArgs = {
  token: Scalars['String']['input'];
  tokenType: TokenType;
};

export type MutationAddUserLikeOrDislikeArgs = {
  isLike?: InputMaybe<Scalars['Boolean']['input']>;
  target: UserLikeTarget;
  targetId: Scalars['Int']['input'];
};

export type MutationAddWishlistArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationAdminLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationCollectProductArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationCollectThumbnailArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationMatchProductToDanawaProductArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationReadNotificationArgs = {
  id: Scalars['Int']['input'];
};

export type MutationRemoveCommentArgs = {
  id: Scalars['Int']['input'];
};

export type MutationRemoveHotDealExcludeKeywordByAdminArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationRemoveHotDealKeywordByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type MutationRemoveHotDealKeywordSynonymByAdminArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationRemoveNotificationArgs = {
  id: Scalars['Int']['input'];
};

export type MutationRemoveNotificationKeywordArgs = {
  id: Scalars['Float']['input'];
};

export type MutationRemoveProductMappingArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationRemoveTokenLinkageArgs = {
  token: Scalars['String']['input'];
};

export type MutationRemoveWishlistArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationReportExpiredProductArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationReserveInstagramPostArgs = {
  id: Scalars['Int']['input'];
};

export type MutationSignupArgs = {
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  email: Scalars['String']['input'];
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  gender?: InputMaybe<Gender>;
  nickname: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationSocialLoginArgs = {
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  gender?: InputMaybe<Gender>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  oauthProvider: OauthProvider;
  socialAccessToken: Scalars['String']['input'];
};

export type MutationUpdateCommentArgs = {
  content: Scalars['String']['input'];
  id: Scalars['Int']['input'];
};

export type MutationUpdateHotDealKeywordByAdminArgs = {
  id: Scalars['Int']['input'];
  isMajor?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type MutationUpdateNotificationKeywordStatusArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationUpdatePasswordArgs = {
  password: Scalars['String']['input'];
};

export type MutationUpdatePushSettingArgs = {
  info?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationUpdateUserProfileArgs = {
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  gender?: InputMaybe<Gender>;
  nickname?: InputMaybe<Scalars['String']['input']>;
};

export type Notification = {
  __typename?: 'Notification';
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  groupId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  keyword?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  product?: Maybe<ProductOutput>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  receiverId: Scalars['Int']['output'];
  senderId: Scalars['Int']['output'];
  senderType: Role;
  target: Scalars['String']['output'];
  targetId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type NotificationKeyword = {
  __typename?: 'NotificationKeyword';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  keyword: Scalars['String']['output'];
  userId: Scalars['Int']['output'];
};

export enum NotificationTarget {
  Info = 'INFO',
  Notice = 'NOTICE',
  Product = 'PRODUCT',
}

export enum NotificationTopic {
  Info = 'INFO',
  Notice = 'NOTICE',
  Product = 'PRODUCT',
}

export enum NotificationType {
  NotificationCenterAndPush = 'NOTIFICATION_CENTER_AND_PUSH',
  NotificationCenterOnly = 'NOTIFICATION_CENTER_ONLY',
  PushOnly = 'PUSH_ONLY',
}

export enum OauthProvider {
  Apple = 'APPLE',
  Google = 'GOOGLE',
  Kakao = 'KAKAO',
  Naver = 'NAVER',
}

export enum OrderOptionType {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type PageSchema = {
  __typename?: 'PageSchema';
  items: Array<ItemUnion>;
  schemaVersion: Scalars['String']['output'];
};

export enum ProductExpiredReportsOrderType {
  Id = 'ID',
}

export type ProductGuide = {
  __typename?: 'ProductGuide';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type ProductHotDealIndex = {
  __typename?: 'ProductHotDealIndex';
  confidence?: Maybe<Scalars['String']['output']>;
  currentPrice: Scalars['Float']['output'];
  detailMessage?: Maybe<Scalars['String']['output']>;
  highestPrice: Scalars['Float']['output'];
  hotDealType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lowestPrice: Scalars['Float']['output'];
  message: Scalars['String']['output'];
  productId: Scalars['Int']['output'];
  score?: Maybe<Scalars['Int']['output']>;
};

export type ProductMapping = {
  __typename?: 'ProductMapping';
  brandProduct?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  productId: Scalars['Int']['output'];
  target: ProductMappingTarget;
  targetId: Scalars['Int']['output'];
};

export type ProductMappingInfoOutput = {
  __typename?: 'ProductMappingInfoOutput';
  amount: Scalars['String']['output'];
  brandProductId: Scalars['Int']['output'];
  quantity: Scalars['String']['output'];
};

export enum ProductMappingTarget {
  BrandItem = 'BRAND_ITEM',
  BrandProduct = 'BRAND_PRODUCT',
  BrandProductItem = 'BRAND_PRODUCT_ITEM',
}

export enum ProductOrderType {
  CommentCount = 'COMMENT_COUNT',
  CommunityRanking = 'COMMUNITY_RANKING',
  Id = 'ID',
  PostedAt = 'POSTED_AT',
  Reaction = 'REACTION',
  ViewCount = 'VIEW_COUNT',
}

export type ProductOutput = {
  __typename?: 'ProductOutput';
  /** 핫딜 작성자 */
  author?: Maybe<User>;
  authorId?: Maybe<Scalars['Int']['output']>;
  /** 커뮤니티 내 카테고리 */
  category?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['Int']['output']>;
  /** 서비스 카테고리 */
  categoryName?: Maybe<Scalars['String']['output']>;
  detailUrl?: Maybe<Scalars['String']['output']>;
  dislikeCount: Scalars['Int']['output'];
  /**
   * 핫딜 정보 요약
   * @deprecated productGuides 쿼리를 사용해주세요.
   */
  guides?: Maybe<Array<ProductGuide>>;
  hotDealIndex?: Maybe<ProductHotDealIndex>;
  hotDealType?: Maybe<HotDealType>;
  id: Scalars['ID']['output'];
  isEnd?: Maybe<Scalars['Boolean']['output']>;
  isHot?: Maybe<Scalars['Boolean']['output']>;
  /** true:좋아요, false:싫어요, null:로그인 안됨/좋아요,싫어요 안함 */
  isMyLike?: Maybe<Scalars['Boolean']['output']>;
  isMyReported: Scalars['Boolean']['output'];
  /** 로그인한 사용자의 위시리스트 여부 */
  isMyWishlist?: Maybe<Scalars['Boolean']['output']>;
  isPrivate: Scalars['Boolean']['output'];
  isProfitUrl: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  mallId?: Maybe<Scalars['Int']['output']>;
  /** 쇼핑몰 이름 */
  mallName?: Maybe<Scalars['String']['output']>;
  mappingInfo?: Maybe<Array<ProductMappingInfoOutput>>;
  negativeCommunityReactionCount: Scalars['Int']['output'];
  positiveCommunityReactionCount: Scalars['Int']['output'];
  postedAt: Scalars['DateTime']['output'];
  price?: Maybe<Scalars['String']['output']>;
  /** 상품 가격 목록 */
  prices?: Maybe<Array<ProductPrice>>;
  productMapping?: Maybe<ProductMapping>;
  provider: Provider;
  providerId: Scalars['Int']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  ship?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
  /** 조회 수 */
  viewCount: Scalars['Int']['output'];
  wishlistCount: Scalars['Int']['output'];
};

export type ProductPrice = {
  __typename?: 'ProductPrice';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  price: Scalars['Int']['output'];
  target: ProductPriceTarget;
  type: CurrencyType;
};

export enum ProductPriceTarget {
  Danawa = 'DANAWA',
  JirumAlarm = 'JIRUM_ALARM',
  Mall = 'MALL',
}

export type Provider = {
  __typename?: 'Provider';
  host?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nameKr: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminMe: AdminUser;
  analysisTitleByDanawa: Scalars['Boolean']['output'];
  categories: Array<Category>;
  /** 커뮤니티 반응 카테고리별 키워드 조회 */
  categorizedReactionKeywords: CategorizedReactionKeywordsResponse;
  comments: Array<CommentOutput>;
  /** 어드민) 댓글 목록 조회 */
  commentsByAdmin: Array<Scalars['String']['output']>;
  /** 상품 랭킹 랜덤 조회 */
  communityRandomRankingProducts: Array<ProductOutput>;
  danawaProduct: DanawaProductOutput;
  danawaProducts: Array<DanawaProductOutput>;
  /** 안읽은 알림 존재 여부 조회 */
  existUnreadNotification: Scalars['Boolean']['output'];
  /** 유저 존재 여부 조회 */
  existsUser: ExistsUserOutput;
  /** 해당 상품 신고된 횟수 조회 */
  expireProductReportCount: Scalars['Int']['output'];
  /** 종료된 상품 제보 내역 조회 */
  expireProductReports: Array<ProductExpireReport>;
  homePage: PageSchema;
  /** 어드민) 핫딜 제외 키워드 목록 조회 */
  hotDealExcludeKeywordsByAdmin: Array<HotDealExcludeKeywordOutput>;
  /** 어드민) 핫딜 키워드 조회 */
  hotDealKeywordByAdmin?: Maybe<HotDealKeywordOutput>;
  /** 어드민) 핫딜 키워드 유의어 목록 조회 */
  hotDealKeywordSynonymsByAdmin: Array<HotDealKeywordSynonymOutput>;
  /** 어드민) 핫딜 키워드 목록 조회 */
  hotDealKeywordsByAdmin: Array<HotDealKeywordOutput>;
  instagramPost?: Maybe<InstagramPost>;
  matchProduct: Scalars['String']['output'];
  /** 로그인한 유저 정보 조회 */
  me: User;
  /** 유저 알림 키워드 목록 조회 */
  notificationKeywordsByMe: Array<NotificationKeyword>;
  /** 알림 목록 조회 */
  notifications: Array<Notification>;
  /** 어드민) 알림 목록 조회 */
  notificationsByAdmin: Array<Notification>;
  /** 상품 조회 */
  product?: Maybe<ProductOutput>;
  productGuides: Array<ProductGuide>;
  productKeywords: Array<Scalars['String']['output']>;
  /** 상품 목록 조회 */
  products: Array<ProductOutput>;
  /** 키워드로 상품 목록 조회 */
  productsByKeyword: Array<ProductOutput>;
  /** 푸시 세팅 조회 */
  pushSetting: UserPushSetting;
  /** 상품 랭킹 목록 조회 */
  rankingProducts: Array<ProductOutput>;
  /** 신고한 사용자 목록 조회 (마스킹) */
  reportUserNames: Array<Scalars['String']['output']>;
  /** 소셜 액세스 토큰 조회 */
  socialAccessToken: Scalars['String']['output'];
  /** 소셜 정보 조회 */
  socialInfo: SocialInfoOutput;
  test6: Scalars['Int']['output'];
  test7: Scalars['Boolean']['output'];
  test8: Scalars['Boolean']['output'];
  /** 같이 본 상품 목록 조회 */
  togetherViewedProducts: Array<ProductOutput>;
  /** 안읽은 알림 수 목록 조회 */
  unreadNotificationsCount: Scalars['Int']['output'];
  /** 유저 조회 */
  user: User;
  /** 이메일로 유저 조회 */
  userByEmail: User;
  /** 위시리스트 개수 조회 */
  wishlistCount: Scalars['Int']['output'];
  /** 위시리스트 목록 조회 */
  wishlists: Array<WishlistOutput>;
};

export type QueryCategorizedReactionKeywordsArgs = {
  id: Scalars['Int']['input'];
};

export type QueryCommentsArgs = {
  limit: Scalars['Int']['input'];
  orderBy: CommentOrder;
  orderOption: OrderOptionType;
  productId: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryCommentsByAdminArgs = {
  excludes?: InputMaybe<Array<Scalars['String']['input']>>;
  hotDealKeywordId: Scalars['Int']['input'];
  synonyms?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryCommunityRandomRankingProductsArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  count: Scalars['Int']['input'];
  isApp?: InputMaybe<Scalars['Boolean']['input']>;
  isGame?: InputMaybe<Scalars['Boolean']['input']>;
  isReward?: InputMaybe<Scalars['Boolean']['input']>;
  limit: Scalars['Int']['input'];
};

export type QueryDanawaProductArgs = {
  id: Scalars['String']['input'];
};

export type QueryDanawaProductsArgs = {
  amount?: InputMaybe<Scalars['String']['input']>;
  brandName: Scalars['String']['input'];
  productName: Scalars['String']['input'];
  volume?: InputMaybe<Scalars['String']['input']>;
};

export type QueryExistsUserArgs = {
  email: Scalars['String']['input'];
};

export type QueryExpireProductReportCountArgs = {
  productId: Scalars['Int']['input'];
};

export type QueryExpireProductReportsArgs = {
  limit: Scalars['Int']['input'];
  orderBy: ProductExpiredReportsOrderType;
  orderOption: OrderOptionType;
  productId?: InputMaybe<Scalars['Int']['input']>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryHomePageArgs = {
  version: Scalars['String']['input'];
};

export type QueryHotDealExcludeKeywordsByAdminArgs = {
  hotDealKeywordId: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  orderBy: HotDealExcludeKeywordOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryHotDealKeywordByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type QueryHotDealKeywordSynonymsByAdminArgs = {
  hotDealKeywordId: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  orderBy: HotDealKeywordSynonymOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryHotDealKeywordsByAdminArgs = {
  limit: Scalars['Int']['input'];
  orderBy: HotDealKeywordOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<HotDealKeywordType>;
};

export type QueryInstagramPostArgs = {
  id: Scalars['Int']['input'];
};

export type QueryMatchProductArgs = {
  text: Scalars['String']['input'];
};

export type QueryNotificationKeywordsByMeArgs = {
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type QueryNotificationsByAdminArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  target?: InputMaybe<NotificationTarget>;
  targetId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryProductArgs = {
  id: Scalars['Int']['input'];
};

export type QueryProductGuidesArgs = {
  productId: Scalars['Int']['input'];
};

export type QueryProductKeywordsArgs = {
  endedAt?: InputMaybe<Scalars['DateTime']['input']>;
  startedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QueryProductsArgs = {
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  isApp?: InputMaybe<Scalars['Boolean']['input']>;
  isEnd?: InputMaybe<Scalars['Boolean']['input']>;
  isGame?: InputMaybe<Scalars['Boolean']['input']>;
  isHot?: InputMaybe<Scalars['Boolean']['input']>;
  isReward?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  orderBy?: InputMaybe<ProductOrderType>;
  orderOption?: InputMaybe<OrderOptionType>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  thumbnailType?: InputMaybe<ThumbnailType>;
};

export type QueryProductsByKeywordArgs = {
  keyword: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
  orderBy: KeywordProductOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryReportUserNamesArgs = {
  productId: Scalars['Int']['input'];
};

export type QuerySocialAccessTokenArgs = {
  code: Scalars['String']['input'];
  oauthProvider: OauthProvider;
  state: Scalars['String']['input'];
};

export type QuerySocialInfoArgs = {
  oauthProvider: OauthProvider;
  socialAccessToken: Scalars['String']['input'];
};

export type QueryTogetherViewedProductsArgs = {
  limit: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
};

export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};

export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};

export type QueryWishlistsArgs = {
  limit: Scalars['Int']['input'];
  orderBy: WishlistOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export type SignupOutput = {
  __typename?: 'SignupOutput';
  accessToken: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
  user: User;
};

export type SocialInfoOutput = {
  __typename?: 'SocialInfoOutput';
  email?: Maybe<Scalars['String']['output']>;
  linkedSocialProviders: Array<OauthProvider>;
};

export type SocialLoginOutput = {
  __typename?: 'SocialLoginOutput';
  accessToken: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  productAdded: ProductOutput;
};

export enum ThumbnailType {
  Mall = 'MALL',
  Post = 'POST',
}

export type TokenOutput = {
  __typename?: 'TokenOutput';
  accessToken: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
};

export enum TokenType {
  Apns = 'APNS',
  Fcm = 'FCM',
}

export type User = {
  __typename?: 'User';
  birthYear?: Maybe<Scalars['Int']['output']>;
  email: Scalars['String']['output'];
  favoriteCategories?: Maybe<Array<Scalars['Int']['output']>>;
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  linkedSocialProviders?: Maybe<Array<OauthProvider>>;
  nickname: Scalars['String']['output'];
};

/** 좋아요 대상 */
export enum UserLikeTarget {
  Comment = 'COMMENT',
  Product = 'PRODUCT',
}

export type UserPushSetting = {
  __typename?: 'UserPushSetting';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  info: Scalars['Boolean']['output'];
  userId: Scalars['Int']['output'];
};

export enum WishlistOrderType {
  Id = 'ID',
}

export type WishlistOutput = {
  __typename?: 'WishlistOutput';
  id: Scalars['ID']['output'];
  /** 상품 조회 */
  product: ProductOutput;
  productId: Scalars['Int']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
};

export type ProductExpireReport = {
  __typename?: 'productExpireReport';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  product: ProductOutput;
  productId: Scalars['Int']['output'];
  userId: Scalars['Int']['output'];
};

export type MutationLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type MutationLoginMutation = {
  __typename?: 'Mutation';
  login: { __typename?: 'TokenOutput'; accessToken: string; refreshToken?: string | null };
};

export type MutationSignupMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  gender?: InputMaybe<Gender>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;

export type MutationSignupMutation = {
  __typename?: 'Mutation';
  signup: {
    __typename?: 'SignupOutput';
    accessToken: string;
    refreshToken?: string | null;
    user: {
      __typename?: 'User';
      id: string;
      email: string;
      nickname: string;
      birthYear?: number | null;
      gender?: Gender | null;
      favoriteCategories?: Array<number> | null;
      linkedSocialProviders?: Array<OauthProvider> | null;
    };
  };
};

export type MutationUpdateUserProfileMutationVariables = Exact<{
  nickname?: InputMaybe<Scalars['String']['input']>;
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  gender?: InputMaybe<Gender>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;

export type MutationUpdateUserProfileMutation = {
  __typename?: 'Mutation';
  updateUserProfile: boolean;
};

export type QueryMeQueryVariables = Exact<{ [key: string]: never }>;

export type QueryMeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    email: string;
    nickname: string;
    birthYear?: number | null;
    gender?: Gender | null;
    favoriteCategories?: Array<number> | null;
  };
};

export type QueryMyCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type QueryMyCategoriesQuery = {
  __typename?: 'Query';
  me: { __typename?: 'User'; favoriteCategories?: Array<number> | null };
};

export type QueryLoginByRefreshTokenMutationVariables = Exact<{ [key: string]: never }>;

export type QueryLoginByRefreshTokenMutation = {
  __typename?: 'Mutation';
  loginByRefreshToken: {
    __typename?: 'TokenOutput';
    accessToken: string;
    refreshToken?: string | null;
  };
};

export type MutationUpdatePasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
}>;

export type MutationUpdatePasswordMutation = { __typename?: 'Mutation'; updatePassword: boolean };

export type MutationWithdrawMutationVariables = Exact<{ [key: string]: never }>;

export type MutationWithdrawMutation = { __typename?: 'Mutation'; withdraw: boolean };

export type QueryCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type QueryCategoriesQuery = {
  __typename?: 'Query';
  categories: Array<{ __typename?: 'Category'; id: string; name: string }>;
};

export type CommentsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  productId: Scalars['Int']['input'];
  orderBy: CommentOrder;
  orderOption: OrderOptionType;
}>;

export type CommentsQuery = {
  __typename?: 'Query';
  comments: Array<{
    __typename?: 'CommentOutput';
    id: string;
    productId: number;
    parentId?: number | null;
    content: string;
    createdAt: any;
    searchAfter?: Array<string> | null;
    likeCount: number;
    isMyLike?: boolean | null;
    author?: { __typename?: 'User'; id: string; nickname: string } | null;
  }>;
};

export type AddCommentMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type AddCommentMutation = { __typename?: 'Mutation'; addComment: boolean };

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  content: Scalars['String']['input'];
}>;

export type UpdateCommentMutation = { __typename?: 'Mutation'; updateComment: boolean };

export type RemoveCommentMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type RemoveCommentMutation = { __typename?: 'Mutation'; removeComment: boolean };

export type MutationAddNotificationKeywordMutationVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;

export type MutationAddNotificationKeywordMutation = {
  __typename?: 'Mutation';
  addNotificationKeyword: boolean;
};

export type MutationRemoveNotificationKeywordMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type MutationRemoveNotificationKeywordMutation = {
  __typename?: 'Mutation';
  removeNotificationKeyword: boolean;
};

export type QueryMypageKeywordQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryMypageKeywordQuery = {
  __typename?: 'Query';
  notificationKeywordsByMe: Array<{
    __typename?: 'NotificationKeyword';
    id: string;
    keyword: string;
  }>;
};

export type AddUserLikeOrDislikeMutationVariables = Exact<{
  target: UserLikeTarget;
  targetId: Scalars['Int']['input'];
  isLike?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type AddUserLikeOrDislikeMutation = {
  __typename?: 'Mutation';
  addUserLikeOrDislike: boolean;
};

export type QueryNotificationsQueryVariables = Exact<{
  offset: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type QueryNotificationsQuery = {
  __typename?: 'Query';
  notifications: Array<{
    __typename?: 'Notification';
    id: string;
    readAt?: any | null;
    createdAt: any;
    message: string;
    url?: string | null;
    keyword?: string | null;
    product?: {
      __typename?: 'ProductOutput';
      id: string;
      thumbnail?: string | null;
      price?: string | null;
      isHot?: boolean | null;
      isEnd?: boolean | null;
      categoryId?: number | null;
    } | null;
  }>;
};

export type QueryUnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never }>;

export type QueryUnreadNotificationsCountQuery = {
  __typename?: 'Query';
  unreadNotificationsCount: number;
};

export type MutationAddPushTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
  tokenType: TokenType;
}>;

export type MutationAddPushTokenMutation = { __typename?: 'Mutation'; addPushToken: boolean };

export type ProductQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    providerId: number;
    category?: string | null;
    categoryId?: number | null;
    mallId?: number | null;
    title: string;
    url?: string | null;
    detailUrl?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    postedAt: any;
    thumbnail?: string | null;
    wishlistCount: number;
    positiveCommunityReactionCount: number;
    negativeCommunityReactionCount: number;
    viewCount: number;
    mallName?: string | null;
    hotDealType?: HotDealType | null;
    isMyLike?: boolean | null;
    isMyReported: boolean;
    likeCount: number;
    dislikeCount: number;
    isMyWishlist?: boolean | null;
    categoryName?: string | null;
    author?: { __typename?: 'User'; id: string; nickname: string } | null;
    provider: {
      __typename?: 'Provider';
      id: string;
      name: string;
      nameKr: string;
      host?: string | null;
    };
    prices?: Array<{
      __typename?: 'ProductPrice';
      id: string;
      target: ProductPriceTarget;
      type: CurrencyType;
      price: number;
      createdAt: any;
    }> | null;
    hotDealIndex?: {
      __typename?: 'ProductHotDealIndex';
      id: string;
      message: string;
      highestPrice: number;
      currentPrice: number;
      lowestPrice: number;
    } | null;
  } | null;
};

export type QueryReportUserNamesQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type QueryReportUserNamesQuery = { __typename?: 'Query'; reportUserNames: Array<string> };

export type ProductGuidesQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type ProductGuidesQuery = {
  __typename?: 'Query';
  productGuides: Array<{ __typename?: 'ProductGuide'; id: string; title: string; content: string }>;
};

export type QueryProductsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<ProductOrderType>;
  orderOption?: InputMaybe<OrderOptionType>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  thumbnailType?: InputMaybe<ThumbnailType>;
  isEnd?: InputMaybe<Scalars['Boolean']['input']>;
  isHot?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type QueryProductsQuery = {
  __typename?: 'Query';
  products: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId?: number | null;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type QueryRankingProductsQueryVariables = Exact<{ [key: string]: never }>;

export type QueryRankingProductsQuery = {
  __typename?: 'Query';
  rankingProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    url?: string | null;
    price?: string | null;
    thumbnail?: string | null;
    categoryId?: number | null;
  }>;
};

export type QueryCommunityRandomRankingProductsQueryVariables = Exact<{
  count: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type QueryCommunityRandomRankingProductsQuery = {
  __typename?: 'Query';
  communityRandomRankingProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId?: number | null;
    category?: string | null;
    thumbnail?: string | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type TogetherViewedProductsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
}>;

export type TogetherViewedProductsQuery = {
  __typename?: 'Query';
  togetherViewedProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId?: number | null;
    category?: string | null;
    thumbnail?: string | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type QueryProductKeywordsQueryVariables = Exact<{ [key: string]: never }>;

export type QueryProductKeywordsQuery = { __typename?: 'Query'; productKeywords: Array<string> };

export type QueryProductsByKeywordQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  keyword: Scalars['String']['input'];
  orderBy: KeywordProductOrderType;
  orderOption: OrderOptionType;
}>;

export type QueryProductsByKeywordQuery = {
  __typename?: 'Query';
  productsByKeyword: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId?: number | null;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type MutationCollectProductMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type MutationCollectProductMutation = { __typename?: 'Mutation'; collectProduct: boolean };

export type MutationReportExpiredProductMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type MutationReportExpiredProductMutation = {
  __typename?: 'Mutation';
  reportExpiredProduct: boolean;
};

export type QueryCategorizedReactionKeywordsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryCategorizedReactionKeywordsQuery = {
  __typename?: 'Query';
  categorizedReactionKeywords: {
    __typename?: 'CategorizedReactionKeywordsResponse';
    lastUpdatedAt?: any | null;
    items: Array<{
      __typename?: 'CategorizedReactionKeywords';
      type: HotDealKeywordType;
      name: string;
      count: number;
      tag: string;
    }>;
  };
};

export type AddWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type AddWishlistMutation = { __typename?: 'Mutation'; addWishlist: boolean };

export type RemoveWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type RemoveWishlistMutation = { __typename?: 'Mutation'; removeWishlist: boolean };

export type QueryWishlistsQueryVariables = Exact<{
  orderBy: WishlistOrderType;
  orderOption: OrderOptionType;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryWishlistsQuery = {
  __typename?: 'Query';
  wishlists: Array<{
    __typename?: 'WishlistOutput';
    id: string;
    productId: number;
    searchAfter?: Array<string> | null;
    product: {
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      price?: string | null;
      isHot?: boolean | null;
      isEnd?: boolean | null;
      isPrivate: boolean;
      postedAt: any;
      hotDealType?: HotDealType | null;
      thumbnail?: string | null;
      isMyWishlist?: boolean | null;
      categoryId?: number | null;
    };
  }>;
};

export type QueryWishlistCountQueryVariables = Exact<{ [key: string]: never }>;

export type QueryWishlistCountQuery = { __typename?: 'Query'; wishlistCount: number };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const MutationLoginDocument = new TypedDocumentString(`
    mutation MutationLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<MutationLoginMutation, MutationLoginMutationVariables>;
export const MutationSignupDocument = new TypedDocumentString(`
    mutation MutationSignup($email: String!, $password: String!, $nickname: String!, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {
  signup(
    email: $email
    password: $password
    nickname: $nickname
    birthYear: $birthYear
    gender: $gender
    favoriteCategories: $favoriteCategories
  ) {
    accessToken
    refreshToken
    user {
      id
      email
      nickname
      birthYear
      gender
      favoriteCategories
      linkedSocialProviders
    }
  }
}
    `) as unknown as TypedDocumentString<MutationSignupMutation, MutationSignupMutationVariables>;
export const MutationUpdateUserProfileDocument = new TypedDocumentString(`
    mutation MutationUpdateUserProfile($nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {
  updateUserProfile(
    nickname: $nickname
    birthYear: $birthYear
    gender: $gender
    favoriteCategories: $favoriteCategories
  )
}
    `) as unknown as TypedDocumentString<
  MutationUpdateUserProfileMutation,
  MutationUpdateUserProfileMutationVariables
>;
export const QueryMeDocument = new TypedDocumentString(`
    query QueryMe {
  me {
    id
    email
    nickname
    birthYear
    gender
    favoriteCategories
  }
}
    `) as unknown as TypedDocumentString<QueryMeQuery, QueryMeQueryVariables>;
export const QueryMyCategoriesDocument = new TypedDocumentString(`
    query QueryMyCategories {
  me {
    favoriteCategories
  }
}
    `) as unknown as TypedDocumentString<QueryMyCategoriesQuery, QueryMyCategoriesQueryVariables>;
export const QueryLoginByRefreshTokenDocument = new TypedDocumentString(`
    mutation QueryLoginByRefreshToken {
  loginByRefreshToken {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<
  QueryLoginByRefreshTokenMutation,
  QueryLoginByRefreshTokenMutationVariables
>;
export const MutationUpdatePasswordDocument = new TypedDocumentString(`
    mutation MutationUpdatePassword($password: String!) {
  updatePassword(password: $password)
}
    `) as unknown as TypedDocumentString<
  MutationUpdatePasswordMutation,
  MutationUpdatePasswordMutationVariables
>;
export const MutationWithdrawDocument = new TypedDocumentString(`
    mutation MutationWithdraw {
  withdraw
}
    `) as unknown as TypedDocumentString<
  MutationWithdrawMutation,
  MutationWithdrawMutationVariables
>;
export const QueryCategoriesDocument = new TypedDocumentString(`
    query QueryCategories {
  categories {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<QueryCategoriesQuery, QueryCategoriesQueryVariables>;
export const CommentsDocument = new TypedDocumentString(`
    query comments($limit: Int!, $searchAfter: [String!], $productId: Int!, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {
  comments(
    limit: $limit
    searchAfter: $searchAfter
    productId: $productId
    orderBy: $orderBy
    orderOption: $orderOption
  ) {
    id
    productId
    parentId
    content
    createdAt
    searchAfter
    author {
      id
      nickname
    }
    likeCount
    isMyLike
  }
}
    `) as unknown as TypedDocumentString<CommentsQuery, CommentsQueryVariables>;
export const AddCommentDocument = new TypedDocumentString(`
    mutation addComment($productId: Int!, $content: String!, $parentId: Int) {
  addComment(productId: $productId, content: $content, parentId: $parentId)
}
    `) as unknown as TypedDocumentString<AddCommentMutation, AddCommentMutationVariables>;
export const UpdateCommentDocument = new TypedDocumentString(`
    mutation updateComment($id: Int!, $content: String!) {
  updateComment(id: $id, content: $content)
}
    `) as unknown as TypedDocumentString<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const RemoveCommentDocument = new TypedDocumentString(`
    mutation removeComment($id: Int!) {
  removeComment(id: $id)
}
    `) as unknown as TypedDocumentString<RemoveCommentMutation, RemoveCommentMutationVariables>;
export const MutationAddNotificationKeywordDocument = new TypedDocumentString(`
    mutation MutationAddNotificationKeyword($keyword: String!) {
  addNotificationKeyword(keyword: $keyword)
}
    `) as unknown as TypedDocumentString<
  MutationAddNotificationKeywordMutation,
  MutationAddNotificationKeywordMutationVariables
>;
export const MutationRemoveNotificationKeywordDocument = new TypedDocumentString(`
    mutation MutationRemoveNotificationKeyword($id: Float!) {
  removeNotificationKeyword(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveNotificationKeywordMutation,
  MutationRemoveNotificationKeywordMutationVariables
>;
export const QueryMypageKeywordDocument = new TypedDocumentString(`
    query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {
  notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
    id
    keyword
  }
}
    `) as unknown as TypedDocumentString<QueryMypageKeywordQuery, QueryMypageKeywordQueryVariables>;
export const AddUserLikeOrDislikeDocument = new TypedDocumentString(`
    mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {
  addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
}
    `) as unknown as TypedDocumentString<
  AddUserLikeOrDislikeMutation,
  AddUserLikeOrDislikeMutationVariables
>;
export const QueryNotificationsDocument = new TypedDocumentString(`
    query QueryNotifications($offset: Int!, $limit: Int!) {
  notifications(offset: $offset, limit: $limit) {
    id
    readAt
    createdAt
    message
    url
    keyword
    product {
      id
      thumbnail
      price
      isHot
      isEnd
      categoryId
    }
  }
}
    `) as unknown as TypedDocumentString<QueryNotificationsQuery, QueryNotificationsQueryVariables>;
export const QueryUnreadNotificationsCountDocument = new TypedDocumentString(`
    query QueryUnreadNotificationsCount {
  unreadNotificationsCount
}
    `) as unknown as TypedDocumentString<
  QueryUnreadNotificationsCountQuery,
  QueryUnreadNotificationsCountQueryVariables
>;
export const MutationAddPushTokenDocument = new TypedDocumentString(`
    mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
  addPushToken(token: $token, tokenType: $tokenType)
}
    `) as unknown as TypedDocumentString<
  MutationAddPushTokenMutation,
  MutationAddPushTokenMutationVariables
>;
export const ProductDocument = new TypedDocumentString(`
    query product($id: Int!) {
  product(id: $id) {
    id
    providerId
    category
    categoryId
    mallId
    title
    url
    detailUrl
    isHot
    isEnd
    price
    postedAt
    thumbnail
    wishlistCount
    positiveCommunityReactionCount
    negativeCommunityReactionCount
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
    viewCount
    mallName
    prices {
      id
      target
      type
      price
      createdAt
    }
    hotDealType
    hotDealIndex {
      id
      message
      highestPrice
      currentPrice
      lowestPrice
    }
    isMyLike
    isMyReported
    likeCount
    dislikeCount
    isMyWishlist
    categoryName
  }
}
    `) as unknown as TypedDocumentString<ProductQuery, ProductQueryVariables>;
export const QueryReportUserNamesDocument = new TypedDocumentString(`
    query QueryReportUserNames($productId: Int!) {
  reportUserNames(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  QueryReportUserNamesQuery,
  QueryReportUserNamesQueryVariables
>;
export const ProductGuidesDocument = new TypedDocumentString(`
    query productGuides($productId: Int!) {
  productGuides(productId: $productId) {
    id
    title
    content
  }
}
    `) as unknown as TypedDocumentString<ProductGuidesQuery, ProductGuidesQueryVariables>;
export const QueryProductsDocument = new TypedDocumentString(`
    query QueryProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $orderOption: OrderOptionType, $categoryId: Int, $keyword: String, $thumbnailType: ThumbnailType, $isEnd: Boolean, $isHot: Boolean) {
  products(
    limit: $limit
    searchAfter: $searchAfter
    startDate: $startDate
    orderBy: $orderBy
    orderOption: $orderOption
    categoryId: $categoryId
    keyword: $keyword
    thumbnailType: $thumbnailType
    isEnd: $isEnd
    isHot: $isHot
  ) {
    id
    title
    mallId
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    hotDealType
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<QueryProductsQuery, QueryProductsQueryVariables>;
export const QueryRankingProductsDocument = new TypedDocumentString(`
    query QueryRankingProducts {
  rankingProducts {
    id
    title
    url
    price
    thumbnail
    categoryId
  }
}
    `) as unknown as TypedDocumentString<
  QueryRankingProductsQuery,
  QueryRankingProductsQueryVariables
>;
export const QueryCommunityRandomRankingProductsDocument = new TypedDocumentString(`
    query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {
  communityRandomRankingProducts(count: $count, limit: $limit) {
    id
    title
    mallId
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  QueryCommunityRandomRankingProductsQuery,
  QueryCommunityRandomRankingProductsQueryVariables
>;
export const TogetherViewedProductsDocument = new TypedDocumentString(`
    query togetherViewedProducts($limit: Int!, $productId: Int!) {
  togetherViewedProducts(limit: $limit, productId: $productId) {
    id
    title
    mallId
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  TogetherViewedProductsQuery,
  TogetherViewedProductsQueryVariables
>;
export const QueryProductKeywordsDocument = new TypedDocumentString(`
    query QueryProductKeywords {
  productKeywords
}
    `) as unknown as TypedDocumentString<
  QueryProductKeywordsQuery,
  QueryProductKeywordsQueryVariables
>;
export const QueryProductsByKeywordDocument = new TypedDocumentString(`
    query QueryProductsByKeyword($limit: Int!, $searchAfter: [String!], $keyword: String!, $orderBy: KeywordProductOrderType!, $orderOption: OrderOptionType!) {
  productsByKeyword(
    limit: $limit
    searchAfter: $searchAfter
    keyword: $keyword
    orderBy: $orderBy
    orderOption: $orderOption
  ) {
    id
    title
    mallId
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    hotDealType
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductsByKeywordQuery,
  QueryProductsByKeywordQueryVariables
>;
export const MutationCollectProductDocument = new TypedDocumentString(`
    mutation MutationCollectProduct($productId: Int!) {
  collectProduct(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  MutationCollectProductMutation,
  MutationCollectProductMutationVariables
>;
export const MutationReportExpiredProductDocument = new TypedDocumentString(`
    mutation MutationReportExpiredProduct($productId: Int!) {
  reportExpiredProduct(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  MutationReportExpiredProductMutation,
  MutationReportExpiredProductMutationVariables
>;
export const QueryCategorizedReactionKeywordsDocument = new TypedDocumentString(`
    query QueryCategorizedReactionKeywords($id: Int!) {
  categorizedReactionKeywords(id: $id) {
    lastUpdatedAt
    items {
      type
      name
      count
      tag
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryCategorizedReactionKeywordsQuery,
  QueryCategorizedReactionKeywordsQueryVariables
>;
export const AddWishlistDocument = new TypedDocumentString(`
    mutation AddWishlist($productId: Int!) {
  addWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<AddWishlistMutation, AddWishlistMutationVariables>;
export const RemoveWishlistDocument = new TypedDocumentString(`
    mutation RemoveWishlist($productId: Int!) {
  removeWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<RemoveWishlistMutation, RemoveWishlistMutationVariables>;
export const QueryWishlistsDocument = new TypedDocumentString(`
    query QueryWishlists($orderBy: WishlistOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {
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
    }
  }
}
    `) as unknown as TypedDocumentString<QueryWishlistsQuery, QueryWishlistsQueryVariables>;
export const QueryWishlistCountDocument = new TypedDocumentString(`
    query QueryWishlistCount {
  wishlistCount
}
    `) as unknown as TypedDocumentString<QueryWishlistCountQuery, QueryWishlistCountQueryVariables>;
