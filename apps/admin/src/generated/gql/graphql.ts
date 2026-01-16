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

export type Ad = {
  __typename?: 'Ad';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  slotType: AdSlotType;
  startAt: Scalars['DateTime']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  weight: Scalars['Int']['output'];
};

export enum AdSlotType {
  DetailPageBanner = 'DETAIL_PAGE_BANNER',
  MainBanner = 'MAIN_BANNER',
  MainRankingInfeed = 'MAIN_RANKING_INFEED',
  MenuRankingInfeed = 'MENU_RANKING_INFEED',
}

export type AdStats = {
  __typename?: 'AdStats';
  adId: Scalars['Int']['output'];
  clicks: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  impressions: Scalars['Int']['output'];
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

export type BrandProductMatchCountOutput = {
  __typename?: 'BrandProductMatchCountOutput';
  amount: Scalars['String']['output'];
  brandItemId: Scalars['Int']['output'];
  brandName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  danawaProductId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  matchCount: Scalars['Int']['output'];
  pendingVerificationCount: Scalars['Int']['output'];
  productName: Scalars['String']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  volume: Scalars['String']['output'];
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

export type MallGroup = {
  __typename?: 'MallGroup';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Float']['output'];
  isActive: Scalars['Boolean']['output'];
  site?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
};

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
  addUserDevice: Scalars['Boolean']['output'];
  addUserLikeOrDislike: Scalars['Boolean']['output'];
  /** wishlist 추가 */
  addWishlist: Scalars['Boolean']['output'];
  /** 어드민) 로그인 */
  adminLogin: TokenOutput;
  /** 여러 매핑을 한 번에 검증 수행 */
  batchVerifyProductMapping: Scalars['Int']['output'];
  /** 검증 취소 (검증 완료/거부된 항목을 다시 대기 상태로 되돌림) */
  cancelVerification: Scalars['Boolean']['output'];
  clearAdCache: Scalars['Boolean']['output'];
  /** 상품 단건 수집 */
  collectProduct: Scalars['Boolean']['output'];
  /** 썸네일 단건 수집 */
  collectThumbnail: Scalars['Boolean']['output'];
  createAd: Ad;
  deleteAd: Scalars['Boolean']['output'];
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
  trackAdClick: Scalars['Boolean']['output'];
  trackAdImpression: Scalars['Boolean']['output'];
  updateAd: Ad;
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
  /** 매핑 검증 수행 (승인 또는 거부) */
  verifyProductMapping: Scalars['Boolean']['output'];
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

export type MutationAddUserDeviceArgs = {
  deviceId: Scalars['String']['input'];
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

export type MutationBatchVerifyProductMappingArgs = {
  feedback?: InputMaybe<Scalars['String']['input']>;
  productMappingIds: Array<Scalars['Int']['input']>;
  result: ProductMappingVerificationStatus;
};

export type MutationCancelVerificationArgs = {
  productMappingId: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClearAdCacheArgs = {
  slot: AdSlotType;
};

export type MutationCollectProductArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationCollectThumbnailArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationCreateAdArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endAt: Scalars['DateTime']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: Scalars['Boolean']['input'];
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  slotType: AdSlotType;
  startAt: Scalars['DateTime']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  weight?: Scalars['Int']['input'];
};

export type MutationDeleteAdArgs = {
  id: Scalars['Int']['input'];
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

export type MutationTrackAdClickArgs = {
  id: Scalars['Int']['input'];
};

export type MutationTrackAdImpressionArgs = {
  id: Scalars['Int']['input'];
};

export type MutationUpdateAdArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['Int']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  slotType?: InputMaybe<AdSlotType>;
  startAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
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

export type MutationVerifyProductMappingArgs = {
  feedback?: InputMaybe<Scalars['String']['input']>;
  productMappingId: Scalars['Int']['input'];
  result: ProductMappingVerificationStatus;
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

export type ProductCommentSummary = {
  __typename?: 'ProductCommentSummary';
  additionalInfo?: Maybe<Scalars['String']['output']>;
  option?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  productId: Scalars['ID']['output'];
  purchaseMethod?: Maybe<Scalars['String']['output']>;
  satisfaction?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
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
  correctPcode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  danawaUrl?: Maybe<Scalars['String']['output']>;
  extractedProductInfo?: Maybe<Scalars['String']['output']>;
  feedbackAt?: Maybe<Scalars['DateTime']['output']>;
  feedbackBy?: Maybe<Scalars['Int']['output']>;
  feedbackReason?: Maybe<Scalars['String']['output']>;
  feedbackType?: Maybe<ProductMappingFeedbackType>;
  id: Scalars['ID']['output'];
  matchStatus?: Maybe<ProductMappingMatchStatus>;
  matchingCandidates?: Maybe<Scalars['String']['output']>;
  matchingConfidence?: Maybe<Scalars['Int']['output']>;
  matchingReasoning?: Maybe<Scalars['String']['output']>;
  matchingSource?: Maybe<Scalars['String']['output']>;
  metadataContext?: Maybe<Scalars['String']['output']>;
  productId: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  searchKeyword?: Maybe<Scalars['String']['output']>;
  target?: Maybe<ProductMappingTarget>;
  targetId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verificationNote?: Maybe<Scalars['String']['output']>;
  verificationStatus?: Maybe<ProductMappingVerificationStatus>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
  /** 검증자 ID */
  verifiedById?: Maybe<Scalars['Int']['output']>;
};

export enum ProductMappingFeedbackType {
  Confirmed = 'CONFIRMED',
  Corrected = 'CORRECTED',
  Rejected = 'REJECTED',
}

export type ProductMappingInfoOutput = {
  __typename?: 'ProductMappingInfoOutput';
  amount: Scalars['String']['output'];
  brandProductId: Scalars['Int']['output'];
  quantity: Scalars['String']['output'];
};

export enum ProductMappingMatchStatus {
  Matched = 'MATCHED',
  NotMatchable = 'NOT_MATCHABLE',
  NoMatchedProduct = 'NO_MATCHED_PRODUCT',
  NoPriceComparison = 'NO_PRICE_COMPARISON',
}

export type ProductMappingOutput = {
  __typename?: 'ProductMappingOutput';
  brandProduct?: Maybe<Scalars['String']['output']>;
  correctPcode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  danawaUrl?: Maybe<Scalars['String']['output']>;
  extractedProductInfo?: Maybe<Scalars['String']['output']>;
  feedbackAt?: Maybe<Scalars['DateTime']['output']>;
  feedbackBy?: Maybe<Scalars['Int']['output']>;
  feedbackReason?: Maybe<Scalars['String']['output']>;
  feedbackType?: Maybe<ProductMappingFeedbackType>;
  id: Scalars['ID']['output'];
  matchStatus?: Maybe<ProductMappingMatchStatus>;
  matchingCandidates?: Maybe<Scalars['String']['output']>;
  matchingConfidence?: Maybe<Scalars['Int']['output']>;
  matchingReasoning?: Maybe<Scalars['String']['output']>;
  matchingSource?: Maybe<Scalars['String']['output']>;
  metadataContext?: Maybe<Scalars['String']['output']>;
  /** 매핑된 상품 정보 */
  product?: Maybe<ProductOutput>;
  productId: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  searchKeyword?: Maybe<Scalars['String']['output']>;
  target?: Maybe<ProductMappingTarget>;
  targetId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verificationNote?: Maybe<Scalars['String']['output']>;
  verificationStatus?: Maybe<ProductMappingVerificationStatus>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
  /** 검증자 정보 */
  verifiedBy?: Maybe<AdminUser>;
  /** 검증자 ID */
  verifiedById?: Maybe<Scalars['Int']['output']>;
};

export enum ProductMappingTarget {
  BrandItem = 'BRAND_ITEM',
  BrandProduct = 'BRAND_PRODUCT',
  BrandProductItem = 'BRAND_PRODUCT_ITEM',
}

export enum ProductMappingVerificationStatus {
  PendingVerification = 'PENDING_VERIFICATION',
  Rejected = 'REJECTED',
  Verified = 'VERIFIED',
}

export enum ProductOrderType {
  CommentCount = 'COMMENT_COUNT',
  CommunityRanking = 'COMMUNITY_RANKING',
  ExpiringSoon = 'EXPIRING_SOON',
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
  categoryId: Scalars['Int']['output'];
  /** 서비스 카테고리 */
  categoryName?: Maybe<Scalars['String']['output']>;
  commentSummary?: Maybe<ProductCommentSummary>;
  consumptionDate?: Maybe<Scalars['DateTime']['output']>;
  detailUrl?: Maybe<Scalars['String']['output']>;
  dislikeCount: Scalars['Int']['output'];
  distributionDate?: Maybe<Scalars['DateTime']['output']>;
  earliestExpiryDate?: Maybe<Scalars['DateTime']['output']>;
  /**
   * 핫딜 정보 요약
   * @deprecated productGuides 쿼리를 사용해주세요.
   */
  guides?: Maybe<Array<ProductGuide>>;
  hotDealAt?: Maybe<Scalars['DateTime']['output']>;
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
  parsedPrice?: Maybe<Scalars['Float']['output']>;
  positiveCommunityReactionCount: Scalars['Int']['output'];
  postedAt: Scalars['DateTime']['output'];
  precomputedRankingScore?: Maybe<Scalars['Float']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  /** 상품 가격 목록 */
  prices?: Maybe<Array<ProductPrice>>;
  productMapping?: Maybe<ProductMapping>;
  provider: Provider;
  providerId: Scalars['Int']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  ship?: Maybe<Scalars['String']['output']>;
  /** 유사도 */
  similarity?: Maybe<Scalars['Float']['output']>;
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
  adStats: Array<AdStats>;
  adminMe: AdminUser;
  ads: Array<Ad>;
  analysisTitleByDanawa: Scalars['Boolean']['output'];
  /** 특정 브랜드 상품의 매핑 개수 조회 */
  brandProductMatchCount: Scalars['Int']['output'];
  /** 매칭된 브랜드 상품 전체 개수 조회 */
  brandProductsByMatchCountTotalCount: Scalars['Int']['output'];
  /** 매칭된 개수가 많은 순으로 브랜드 상품 목록 조회 (커서 기반 페이지네이션) */
  brandProductsOrderByMatchCount: Array<BrandProductMatchCountOutput>;
  categories: Array<Category>;
  /** 커뮤니티 반응 카테고리별 키워드 조회 */
  categorizedReactionKeywords: CategorizedReactionKeywordsResponse;
  comments: Array<CommentOutput>;
  /** 어드민) 댓글 목록 조회 */
  commentsByAdmin: Array<Scalars['String']['output']>;
  communityProviders: Array<Provider>;
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
  /** 유통기한 임박 특가 상품 조회 */
  expiringSoonHotDealProducts: Array<ProductOutput>;
  /** 특정 사용자의 추천 상품 조회 (관리자용) */
  getPersonalizedProductsByUserId: Array<RecommendedProductOutput>;
  /** 특정 상품과 유사한 상품 조회 */
  getSimilarProducts: Array<ProductOutput>;
  homePage: PageSchema;
  /** 어드민) 핫딜 제외 키워드 목록 조회 */
  hotDealExcludeKeywordsByAdmin: Array<HotDealExcludeKeywordOutput>;
  /** 어드민) 핫딜 키워드 조회 */
  hotDealKeywordByAdmin?: Maybe<HotDealKeywordOutput>;
  /** 어드민) 핫딜 키워드 유의어 목록 조회 */
  hotDealKeywordSynonymsByAdmin: Array<HotDealKeywordSynonymOutput>;
  /** 어드민) 핫딜 키워드 목록 조회 */
  hotDealKeywordsByAdmin: Array<HotDealKeywordOutput>;
  /** 놓치면 아까운 핫딜 - 랭킹순 핫딜 상품 조회 */
  hotDealRankingProducts: Array<ProductOutput>;
  instagramPost?: Maybe<InstagramPost>;
  mallGroups: Array<MallGroup>;
  /** 로그인한 유저 정보 조회 */
  me?: Maybe<User>;
  /** 유저 알림 키워드 목록 조회 */
  notificationKeywordsByMe: Array<NotificationKeyword>;
  /** 알림 목록 조회 */
  notifications: Array<Notification>;
  /** 어드민) 알림 목록 조회 */
  notificationsByAdmin: Array<Notification>;
  /** 검증 대기 중인 매핑 목록 조회 */
  pendingVerifications: Array<ProductMappingOutput>;
  /** 검증 대기 중인 매핑 전체 개수 조회 (필터 적용 가능) */
  pendingVerificationsTotalCount: Scalars['Int']['output'];
  /** 개인화 추천 상품 조회 (로그인 필요) */
  personalizedProducts: Array<RecommendedProductOutput>;
  /** 상품 조회 */
  product?: Maybe<ProductOutput>;
  productGuides?: Maybe<Array<ProductGuide>>;
  productKeywords: Array<Scalars['String']['output']>;
  /** 상품 목록 조회 */
  products: Array<ProductOutput>;
  /** 키워드로 상품 목록 조회 */
  productsByKeyword: Array<ProductOutput>;
  /** 푸시 세팅 조회 */
  pushSetting: UserPushSetting;
  /** 알림 키워드 추천 목록 조회 */
  recommendedNotificationKeywords: Array<Scalars['String']['output']>;
  /** 신고한 사용자 목록 조회 (마스킹) */
  reportUserNames: Array<Scalars['String']['output']>;
  /** 유사 상품 목록 조회 */
  similarProducts: Array<ProductOutput>;
  /** 제목으로 유사 상품 목록 조회 */
  similarProductsByTitle: Array<ProductOutput>;
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
  /** 검증 완료/거부된 매핑 목록 조회 */
  verificationHistory: Array<ProductMappingOutput>;
  /** 검증 통계 조회 (대기/완료/거부 개수) */
  verificationStatistics: VerificationStatistics;
  /** 위시리스트 개수 조회 */
  wishlistCount: Scalars['Int']['output'];
  /** 위시리스트 목록 조회 */
  wishlists: Array<WishlistOutput>;
};

export type QueryAdStatsArgs = {
  adId?: InputMaybe<Scalars['Int']['input']>;
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type QueryAdsArgs = {
  slots: Array<AdSlotType>;
};

export type QueryBrandProductMatchCountArgs = {
  brandProductId: Scalars['Int']['input'];
};

export type QueryBrandProductsByMatchCountTotalCountArgs = {
  brandItemId?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBrandProductsOrderByMatchCountArgs = {
  brandItemId?: InputMaybe<Scalars['Int']['input']>;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
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

export type QueryExpiringSoonHotDealProductsArgs = {
  daysUntilExpiry: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryGetPersonalizedProductsByUserIdArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['Int']['input'];
};

export type QueryGetSimilarProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
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

export type QueryHotDealRankingProductsArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
};

export type QueryInstagramPostArgs = {
  id: Scalars['Int']['input'];
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

export type QueryPendingVerificationsArgs = {
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  limit: Scalars['Int']['input'];
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  orderBy?: InputMaybe<OrderOptionType>;
  prioritizeOld?: InputMaybe<Scalars['Boolean']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<Array<ProductMappingVerificationStatus>>;
};

export type QueryPendingVerificationsTotalCountArgs = {
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<Array<ProductMappingVerificationStatus>>;
};

export type QueryPersonalizedProductsArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  excludeProductIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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
  mallGroupId?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProductOrderType>;
  orderOption?: InputMaybe<OrderOptionType>;
  providerId?: InputMaybe<Scalars['Int']['input']>;
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

export type QuerySimilarProductsArgs = {
  id: Scalars['Int']['input'];
};

export type QuerySimilarProductsByTitleArgs = {
  limit?: Scalars['Int']['input'];
  minRankingScore?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
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

export type QueryVerificationHistoryArgs = {
  limit: Scalars['Int']['input'];
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  orderBy?: InputMaybe<OrderOptionType>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<Array<ProductMappingVerificationStatus>>;
  verifiedBy?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryWishlistsArgs = {
  limit: Scalars['Int']['input'];
  orderBy: WishlistOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RecommendedProductOutput = {
  __typename?: 'RecommendedProductOutput';
  product: ProductOutput;
  recommendationReason?: Maybe<Scalars['String']['output']>;
  recommendationScore?: Maybe<Scalars['Float']['output']>;
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

export type VerificationStatistics = {
  __typename?: 'VerificationStatistics';
  pending: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  verified: Scalars['Int']['output'];
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

export type MutationAdminLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type MutationAdminLoginMutation = {
  __typename?: 'Mutation';
  adminLogin: { __typename?: 'TokenOutput'; accessToken: string; refreshToken?: string | null };
};

export type QueryBrandProductsOrderByMatchCountQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  brandItemId?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryBrandProductsOrderByMatchCountQuery = {
  __typename?: 'Query';
  brandProductsOrderByMatchCount: Array<{
    __typename?: 'BrandProductMatchCountOutput';
    id: string;
    danawaProductId: number;
    brandItemId: number;
    brandName: string;
    productName: string;
    volume: string;
    amount: string;
    matchCount: number;
    pendingVerificationCount: number;
    createdAt: any;
    searchAfter?: Array<string> | null;
  }>;
};

export type QuerySimilarProductsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QuerySimilarProductsQuery = {
  __typename?: 'Query';
  similarProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    url?: string | null;
    thumbnail?: string | null;
    price?: string | null;
    categoryId: number;
    providerId: number;
    postedAt: any;
    provider: { __typename?: 'Provider'; name: string };
  }>;
};

export type QueryBrandProductsByMatchCountTotalCountQueryVariables = Exact<{
  brandItemId?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryBrandProductsByMatchCountTotalCountQuery = {
  __typename?: 'Query';
  brandProductsByMatchCountTotalCount: number;
};

export type QueryBrandProductMatchCountQueryVariables = Exact<{
  brandProductId: Scalars['Int']['input'];
}>;

export type QueryBrandProductMatchCountQuery = {
  __typename?: 'Query';
  brandProductMatchCount: number;
};

export type CommentsByAdminQueryVariables = Exact<{
  hotDealKeywordId: Scalars['Int']['input'];
  synonyms?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type CommentsByAdminQuery = { __typename?: 'Query'; commentsByAdmin: Array<string> };

export type QueryHotDealKeywordsByAdminQueryVariables = Exact<{
  type?: InputMaybe<HotDealKeywordType>;
  orderBy: HotDealKeywordOrderType;
  orderOption: OrderOptionType;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryHotDealKeywordsByAdminQuery = {
  __typename?: 'Query';
  hotDealKeywordsByAdmin: Array<{
    __typename?: 'HotDealKeywordOutput';
    id: string;
    type: HotDealKeywordType;
    keyword: string;
    weight: number;
    isMajor: boolean;
    lastUpdatedAt: any;
    synonymCount: number;
    excludeKeywordCount: number;
    searchAfter?: Array<string> | null;
  }>;
};

export type MutationAddHotDealKeywordByAdminMutationVariables = Exact<{
  type: HotDealKeywordType;
  keyword: Scalars['String']['input'];
  weight: Scalars['Float']['input'];
  isMajor: Scalars['Boolean']['input'];
}>;

export type MutationAddHotDealKeywordByAdminMutation = {
  __typename?: 'Mutation';
  addHotDealKeywordByAdmin: number;
};

export type MutationRemoveHotDealKeywordByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationRemoveHotDealKeywordByAdminMutation = {
  __typename?: 'Mutation';
  removeHotDealKeywordByAdmin: boolean;
};

export type MutationUpdateHotDealKeywordByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  keyword?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  isMajor?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type MutationUpdateHotDealKeywordByAdminMutation = {
  __typename?: 'Mutation';
  updateHotDealKeywordByAdmin: boolean;
};

export type QueryHotDealKeywordByAdminQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryHotDealKeywordByAdminQuery = {
  __typename?: 'Query';
  hotDealKeywordByAdmin?: {
    __typename?: 'HotDealKeywordOutput';
    id: string;
    type: HotDealKeywordType;
    keyword: string;
    weight: number;
    isMajor: boolean;
    synonyms: Array<{
      __typename?: 'HotDealKeywordSynonymOutput';
      id: string;
      hotDealKeywordId: number;
      keyword: string;
    }>;
    excludeKeywords: Array<{
      __typename?: 'HotDealExcludeKeywordOutput';
      id: string;
      hotDealKeywordId: number;
      excludeKeyword: string;
    }>;
  } | null;
};

export type QueryHotDealKeywordDetailByAdminQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryHotDealKeywordDetailByAdminQuery = {
  __typename?: 'Query';
  hotDealKeywordByAdmin?: {
    __typename?: 'HotDealKeywordOutput';
    id: string;
    type: HotDealKeywordType;
    keyword: string;
    weight: number;
    isMajor: boolean;
  } | null;
};

export type MutationAddHotDealKeywordSynonymByAdminMutationVariables = Exact<{
  hotDealKeywordId: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type MutationAddHotDealKeywordSynonymByAdminMutation = {
  __typename?: 'Mutation';
  addHotDealKeywordSynonymByAdmin: boolean;
};

export type MutationAddHotDealExcludeKeywordByAdminMutationVariables = Exact<{
  hotDealKeywordId: Scalars['Int']['input'];
  excludeKeywords: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type MutationAddHotDealExcludeKeywordByAdminMutation = {
  __typename?: 'Mutation';
  addHotDealExcludeKeywordByAdmin: boolean;
};

export type MutationRemoveHotDealKeywordSynonymByAdminMutationVariables = Exact<{
  ids: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;

export type MutationRemoveHotDealKeywordSynonymByAdminMutation = {
  __typename?: 'Mutation';
  removeHotDealKeywordSynonymByAdmin: boolean;
};

export type MutationRemoveHotDealExcludeKeywordByAdminMutationVariables = Exact<{
  ids: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;

export type MutationRemoveHotDealExcludeKeywordByAdminMutation = {
  __typename?: 'Mutation';
  removeHotDealExcludeKeywordByAdmin: boolean;
};

export type QueryPendingVerificationsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  prioritizeOld?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<OrderOptionType>;
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  verificationStatus?: InputMaybe<
    Array<ProductMappingVerificationStatus> | ProductMappingVerificationStatus
  >;
}>;

export type QueryPendingVerificationsQuery = {
  __typename?: 'Query';
  pendingVerifications: Array<{
    __typename?: 'ProductMappingOutput';
    id: string;
    productId: number;
    brandProduct?: string | null;
    danawaUrl?: string | null;
    verificationStatus?: ProductMappingVerificationStatus | null;
    verifiedAt?: any | null;
    verificationNote?: string | null;
    createdAt: any;
    searchAfter?: Array<string> | null;
    product?: { __typename?: 'ProductOutput'; title: string; thumbnail?: string | null } | null;
    verifiedBy?: { __typename?: 'AdminUser'; id: string; name: string; email: string } | null;
  }>;
};

export type QueryVerificationStatisticsQueryVariables = Exact<{ [key: string]: never }>;

export type QueryVerificationStatisticsQuery = {
  __typename?: 'Query';
  verificationStatistics: {
    __typename?: 'VerificationStatistics';
    pending: number;
    verified: number;
    rejected: number;
    total: number;
  };
};

export type QueryVerificationHistoryQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  verificationStatus?: InputMaybe<
    Array<ProductMappingVerificationStatus> | ProductMappingVerificationStatus
  >;
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus> | ProductMappingMatchStatus>;
  target?: InputMaybe<ProductMappingTarget>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  verifiedBy?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OrderOptionType>;
}>;

export type QueryVerificationHistoryQuery = {
  __typename?: 'Query';
  verificationHistory: Array<{
    __typename?: 'ProductMappingOutput';
    id: string;
    productId: number;
    brandProduct?: string | null;
    danawaUrl?: string | null;
    verificationStatus?: ProductMappingVerificationStatus | null;
    verifiedAt?: any | null;
    verificationNote?: string | null;
    createdAt: any;
    searchAfter?: Array<string> | null;
    product?: { __typename?: 'ProductOutput'; title: string; thumbnail?: string | null } | null;
    verifiedBy?: { __typename?: 'AdminUser'; id: string; name: string; email: string } | null;
  }>;
};

export type MutationVerifyProductMappingMutationVariables = Exact<{
  productMappingId: Scalars['Int']['input'];
  result: ProductMappingVerificationStatus;
  feedback?: InputMaybe<Scalars['String']['input']>;
}>;

export type MutationVerifyProductMappingMutation = {
  __typename?: 'Mutation';
  verifyProductMapping: boolean;
};

export type MutationBatchVerifyProductMappingMutationVariables = Exact<{
  productMappingIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  result: ProductMappingVerificationStatus;
  feedback?: InputMaybe<Scalars['String']['input']>;
}>;

export type MutationBatchVerifyProductMappingMutation = {
  __typename?: 'Mutation';
  batchVerifyProductMapping: number;
};

export type MutationRemoveProductMappingMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type MutationRemoveProductMappingMutation = {
  __typename?: 'Mutation';
  removeProductMapping: boolean;
};

export type MutationCancelVerificationMutationVariables = Exact<{
  productMappingId: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;

export type MutationCancelVerificationMutation = {
  __typename?: 'Mutation';
  cancelVerification: boolean;
};

export type QueryPendingVerificationsTotalCountQueryVariables = Exact<{
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus> | ProductMappingMatchStatus>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<
    Array<ProductMappingVerificationStatus> | ProductMappingVerificationStatus
  >;
}>;

export type QueryPendingVerificationsTotalCountQuery = {
  __typename?: 'Query';
  pendingVerificationsTotalCount: number;
};

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

export const MutationAdminLoginDocument = new TypedDocumentString(`
    mutation MutationAdminLogin($email: String!, $password: String!) {
  adminLogin(email: $email, password: $password) {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<
  MutationAdminLoginMutation,
  MutationAdminLoginMutationVariables
>;
export const QueryBrandProductsOrderByMatchCountDocument = new TypedDocumentString(`
    query QueryBrandProductsOrderByMatchCount($limit: Int!, $searchAfter: [String!], $brandItemId: Int, $title: String) {
  brandProductsOrderByMatchCount(
    limit: $limit
    searchAfter: $searchAfter
    brandItemId: $brandItemId
    title: $title
  ) {
    id
    danawaProductId
    brandItemId
    brandName
    productName
    volume
    amount
    matchCount
    pendingVerificationCount
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryBrandProductsOrderByMatchCountQuery,
  QueryBrandProductsOrderByMatchCountQueryVariables
>;
export const QuerySimilarProductsDocument = new TypedDocumentString(`
    query QuerySimilarProducts($id: Int!) {
  similarProducts(id: $id) {
    id
    title
    url
    thumbnail
    price
    categoryId
    providerId
    provider {
      name
    }
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  QuerySimilarProductsQuery,
  QuerySimilarProductsQueryVariables
>;
export const QueryBrandProductsByMatchCountTotalCountDocument = new TypedDocumentString(`
    query QueryBrandProductsByMatchCountTotalCount($brandItemId: Int, $title: String) {
  brandProductsByMatchCountTotalCount(brandItemId: $brandItemId, title: $title)
}
    `) as unknown as TypedDocumentString<
  QueryBrandProductsByMatchCountTotalCountQuery,
  QueryBrandProductsByMatchCountTotalCountQueryVariables
>;
export const QueryBrandProductMatchCountDocument = new TypedDocumentString(`
    query QueryBrandProductMatchCount($brandProductId: Int!) {
  brandProductMatchCount(brandProductId: $brandProductId)
}
    `) as unknown as TypedDocumentString<
  QueryBrandProductMatchCountQuery,
  QueryBrandProductMatchCountQueryVariables
>;
export const CommentsByAdminDocument = new TypedDocumentString(`
    query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {
  commentsByAdmin(
    hotDealKeywordId: $hotDealKeywordId
    synonyms: $synonyms
    excludes: $excludes
  )
}
    `) as unknown as TypedDocumentString<CommentsByAdminQuery, CommentsByAdminQueryVariables>;
export const QueryHotDealKeywordsByAdminDocument = new TypedDocumentString(`
    query QueryHotDealKeywordsByAdmin($type: HotDealKeywordType, $orderBy: HotDealKeywordOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {
  hotDealKeywordsByAdmin(
    type: $type
    orderBy: $orderBy
    orderOption: $orderOption
    limit: $limit
    searchAfter: $searchAfter
  ) {
    id
    type
    keyword
    weight
    isMajor
    lastUpdatedAt
    synonymCount
    excludeKeywordCount
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryHotDealKeywordsByAdminQuery,
  QueryHotDealKeywordsByAdminQueryVariables
>;
export const MutationAddHotDealKeywordByAdminDocument = new TypedDocumentString(`
    mutation MutationAddHotDealKeywordByAdmin($type: HotDealKeywordType!, $keyword: String!, $weight: Float!, $isMajor: Boolean!) {
  addHotDealKeywordByAdmin(
    type: $type
    keyword: $keyword
    weight: $weight
    isMajor: $isMajor
  )
}
    `) as unknown as TypedDocumentString<
  MutationAddHotDealKeywordByAdminMutation,
  MutationAddHotDealKeywordByAdminMutationVariables
>;
export const MutationRemoveHotDealKeywordByAdminDocument = new TypedDocumentString(`
    mutation MutationRemoveHotDealKeywordByAdmin($id: Int!) {
  removeHotDealKeywordByAdmin(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveHotDealKeywordByAdminMutation,
  MutationRemoveHotDealKeywordByAdminMutationVariables
>;
export const MutationUpdateHotDealKeywordByAdminDocument = new TypedDocumentString(`
    mutation MutationUpdateHotDealKeywordByAdmin($id: Int!, $keyword: String, $weight: Float, $isMajor: Boolean) {
  updateHotDealKeywordByAdmin(
    id: $id
    keyword: $keyword
    weight: $weight
    isMajor: $isMajor
  )
}
    `) as unknown as TypedDocumentString<
  MutationUpdateHotDealKeywordByAdminMutation,
  MutationUpdateHotDealKeywordByAdminMutationVariables
>;
export const QueryHotDealKeywordByAdminDocument = new TypedDocumentString(`
    query QueryHotDealKeywordByAdmin($id: Int!) {
  hotDealKeywordByAdmin(id: $id) {
    id
    type
    keyword
    weight
    isMajor
    synonyms {
      id
      hotDealKeywordId
      keyword
    }
    excludeKeywords {
      id
      hotDealKeywordId
      excludeKeyword
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryHotDealKeywordByAdminQuery,
  QueryHotDealKeywordByAdminQueryVariables
>;
export const QueryHotDealKeywordDetailByAdminDocument = new TypedDocumentString(`
    query QueryHotDealKeywordDetailByAdmin($id: Int!) {
  hotDealKeywordByAdmin(id: $id) {
    id
    type
    keyword
    weight
    isMajor
  }
}
    `) as unknown as TypedDocumentString<
  QueryHotDealKeywordDetailByAdminQuery,
  QueryHotDealKeywordDetailByAdminQueryVariables
>;
export const MutationAddHotDealKeywordSynonymByAdminDocument = new TypedDocumentString(`
    mutation MutationAddHotDealKeywordSynonymByAdmin($hotDealKeywordId: Int!, $keywords: [String!]!) {
  addHotDealKeywordSynonymByAdmin(
    hotDealKeywordId: $hotDealKeywordId
    keywords: $keywords
  )
}
    `) as unknown as TypedDocumentString<
  MutationAddHotDealKeywordSynonymByAdminMutation,
  MutationAddHotDealKeywordSynonymByAdminMutationVariables
>;
export const MutationAddHotDealExcludeKeywordByAdminDocument = new TypedDocumentString(`
    mutation MutationAddHotDealExcludeKeywordByAdmin($hotDealKeywordId: Int!, $excludeKeywords: [String!]!) {
  addHotDealExcludeKeywordByAdmin(
    hotDealKeywordId: $hotDealKeywordId
    excludeKeywords: $excludeKeywords
  )
}
    `) as unknown as TypedDocumentString<
  MutationAddHotDealExcludeKeywordByAdminMutation,
  MutationAddHotDealExcludeKeywordByAdminMutationVariables
>;
export const MutationRemoveHotDealKeywordSynonymByAdminDocument = new TypedDocumentString(`
    mutation MutationRemoveHotDealKeywordSynonymByAdmin($ids: [Int!]!) {
  removeHotDealKeywordSynonymByAdmin(ids: $ids)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveHotDealKeywordSynonymByAdminMutation,
  MutationRemoveHotDealKeywordSynonymByAdminMutationVariables
>;
export const MutationRemoveHotDealExcludeKeywordByAdminDocument = new TypedDocumentString(`
    mutation MutationRemoveHotDealExcludeKeywordByAdmin($ids: [Int!]!) {
  removeHotDealExcludeKeywordByAdmin(ids: $ids)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveHotDealExcludeKeywordByAdminMutation,
  MutationRemoveHotDealExcludeKeywordByAdminMutationVariables
>;
export const QueryPendingVerificationsDocument = new TypedDocumentString(`
    query QueryPendingVerifications($limit: Int!, $searchAfter: [String!], $prioritizeOld: Boolean, $orderBy: OrderOptionType, $brandProductId: Int, $verificationStatus: [ProductMappingVerificationStatus!]) {
  pendingVerifications(
    limit: $limit
    searchAfter: $searchAfter
    prioritizeOld: $prioritizeOld
    orderBy: $orderBy
    brandProductId: $brandProductId
    verificationStatus: $verificationStatus
  ) {
    id
    productId
    brandProduct
    product {
      title
      thumbnail
    }
    danawaUrl
    verificationStatus
    verifiedBy {
      id
      name
      email
    }
    verifiedAt
    verificationNote
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryPendingVerificationsQuery,
  QueryPendingVerificationsQueryVariables
>;
export const QueryVerificationStatisticsDocument = new TypedDocumentString(`
    query QueryVerificationStatistics {
  verificationStatistics {
    pending
    verified
    rejected
    total
  }
}
    `) as unknown as TypedDocumentString<
  QueryVerificationStatisticsQuery,
  QueryVerificationStatisticsQueryVariables
>;
export const QueryVerificationHistoryDocument = new TypedDocumentString(`
    query QueryVerificationHistory($limit: Int!, $searchAfter: [String!], $verificationStatus: [ProductMappingVerificationStatus!], $matchStatus: [ProductMappingMatchStatus!], $target: ProductMappingTarget, $productId: Int, $verifiedBy: Int, $orderBy: OrderOptionType) {
  verificationHistory(
    limit: $limit
    searchAfter: $searchAfter
    verificationStatus: $verificationStatus
    matchStatus: $matchStatus
    target: $target
    productId: $productId
    verifiedBy: $verifiedBy
    orderBy: $orderBy
  ) {
    id
    productId
    brandProduct
    product {
      title
      thumbnail
    }
    danawaUrl
    verificationStatus
    verifiedBy {
      id
      name
      email
    }
    verifiedAt
    verificationNote
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryVerificationHistoryQuery,
  QueryVerificationHistoryQueryVariables
>;
export const MutationVerifyProductMappingDocument = new TypedDocumentString(`
    mutation MutationVerifyProductMapping($productMappingId: Int!, $result: ProductMappingVerificationStatus!, $feedback: String) {
  verifyProductMapping(
    productMappingId: $productMappingId
    result: $result
    feedback: $feedback
  )
}
    `) as unknown as TypedDocumentString<
  MutationVerifyProductMappingMutation,
  MutationVerifyProductMappingMutationVariables
>;
export const MutationBatchVerifyProductMappingDocument = new TypedDocumentString(`
    mutation MutationBatchVerifyProductMapping($productMappingIds: [Int!]!, $result: ProductMappingVerificationStatus!, $feedback: String) {
  batchVerifyProductMapping(
    productMappingIds: $productMappingIds
    result: $result
    feedback: $feedback
  )
}
    `) as unknown as TypedDocumentString<
  MutationBatchVerifyProductMappingMutation,
  MutationBatchVerifyProductMappingMutationVariables
>;
export const MutationRemoveProductMappingDocument = new TypedDocumentString(`
    mutation MutationRemoveProductMapping($productId: Int!) {
  removeProductMapping(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveProductMappingMutation,
  MutationRemoveProductMappingMutationVariables
>;
export const MutationCancelVerificationDocument = new TypedDocumentString(`
    mutation MutationCancelVerification($productMappingId: Int!, $reason: String) {
  cancelVerification(productMappingId: $productMappingId, reason: $reason)
}
    `) as unknown as TypedDocumentString<
  MutationCancelVerificationMutation,
  MutationCancelVerificationMutationVariables
>;
export const QueryPendingVerificationsTotalCountDocument = new TypedDocumentString(`
    query QueryPendingVerificationsTotalCount($brandProductId: Int, $matchStatus: [ProductMappingMatchStatus!], $target: ProductMappingTarget, $verificationStatus: [ProductMappingVerificationStatus!]) {
  pendingVerificationsTotalCount(
    brandProductId: $brandProductId
    matchStatus: $matchStatus
    target: $target
    verificationStatus: $verificationStatus
  )
}
    `) as unknown as TypedDocumentString<
  QueryPendingVerificationsTotalCountQuery,
  QueryPendingVerificationsTotalCountQueryVariables
>;
