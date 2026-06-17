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

export type AgeGroupCountOutput = {
  __typename?: 'AgeGroupCountOutput';
  /** 연령대 (예: 10대, 20대, 30대, 미설정) */
  ageGroup: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type ApiQuery = {
  __typename?: 'ApiQuery';
  queryName: Scalars['String']['output'];
  type: DataSourceType;
  variables?: Maybe<Scalars['JSONObject']['output']>;
};

export type BaseSection = {
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type BrandItemMatchCountOutput = {
  __typename?: 'BrandItemMatchCountOutput';
  brandName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pendingVerificationCount: Scalars['Int']['output'];
  productName: Scalars['String']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  totalMatchCount: Scalars['Int']['output'];
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

export type CategoryCountOutput = {
  __typename?: 'CategoryCountOutput';
  categoryId: Scalars['Int']['output'];
  categoryName: Scalars['String']['output'];
  count: Scalars['Int']['output'];
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
  isMyReported: Scalars['Boolean']['output'];
  isNotice: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Float']['output']>;
  productId?: Maybe<Scalars['Int']['output']>;
  /** 댓글에 달린 대댓글 수 */
  replyCount: Scalars['Int']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  taggedProduct?: Maybe<ProductOutput>;
  title?: Maybe<Scalars['String']['output']>;
  trendedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['Float']['output'];
  viewCount: Scalars['Int']['output'];
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

export enum DataSourceType {
  GraphqlQuery = 'GRAPHQL_QUERY',
}

export type DateCountOutput = {
  __typename?: 'DateCountOutput';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

/** 날짜 간격 */
export enum DateInterval {
  /** 일별 */
  Daily = 'DAILY',
  /** 월별 */
  Monthly = 'MONTHLY',
  /** 주별 */
  Weekly = 'WEEKLY',
}

export type ExistsUserOutput = {
  __typename?: 'ExistsUserOutput';
  email: Scalars['Boolean']['output'];
  social: Scalars['Boolean']['output'];
};

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
}

export type GenderCountOutput = {
  __typename?: 'GenderCountOutput';
  count: Scalars['Int']['output'];
  gender?: Maybe<Gender>;
};

export type GridTabbedSection = BaseSection & {
  __typename?: 'GridTabbedSection';
  dataSource: ApiQuery;
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  tabs: Array<LayoutTab>;
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type GroupSection = BaseSection & {
  __typename?: 'GroupSection';
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  sections: Array<BaseSection>;
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type HorizontalScrollSection = BaseSection & {
  __typename?: 'HorizontalScrollSection';
  dataSource: ApiQuery;
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
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

export enum HotDealKeywordCandidateOrderType {
  CreatedAt = 'CREATED_AT',
  Frequency = 'FREQUENCY',
  Id = 'ID',
}

export type HotDealKeywordCandidateOutput = {
  __typename?: 'HotDealKeywordCandidateOutput';
  approvedKeywordId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expression: Scalars['String']['output'];
  frequency: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['Int']['output']>;
  sampleComments: Array<Scalars['String']['output']>;
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
  status: HotDealKeywordCandidateStatus;
  suggestedGroupId?: Maybe<Scalars['Int']['output']>;
  suggestedType: HotDealKeywordType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum HotDealKeywordCandidateStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

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

export type HotDealRatioOutput = {
  __typename?: 'HotDealRatioOutput';
  date: Scalars['String']['output'];
  hotDealCount: Scalars['Int']['output'];
  ratio: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

/** 핫딜 타입 */
export enum HotDealType {
  /** 핫딜 */
  HotDeal = 'HOT_DEAL',
  /** 대박딜 */
  SuperDeal = 'SUPER_DEAL',
  /** 초대박딜 */
  UltraDeal = 'ULTRA_DEAL',
}

export type HotDealTypeCountOutput = {
  __typename?: 'HotDealTypeCountOutput';
  count: Scalars['Int']['output'];
  hotDealType: HotDealType;
};

export type KeywordCountOutput = {
  __typename?: 'KeywordCountOutput';
  count: Scalars['Int']['output'];
  keyword: Scalars['String']['output'];
};

export type KeywordMapEntry = {
  __typename?: 'KeywordMapEntry';
  groupId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  keyword: Scalars['String']['output'];
};

export enum KeywordMapGroupOrderType {
  Id = 'ID',
  Name = 'NAME',
}

export type KeywordMapGroupOutput = {
  __typename?: 'KeywordMapGroupOutput';
  description?: Maybe<Scalars['String']['output']>;
  entries: Array<KeywordMapEntry>;
  entryCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  searchAfter?: Maybe<Array<Scalars['String']['output']>>;
};

export enum KeywordProductOrderType {
  PostedAt = 'POSTED_AT',
}

export type LayoutTab = {
  __typename?: 'LayoutTab';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  variables?: Maybe<Scalars['JSONObject']['output']>;
};

export type ListSection = BaseSection & {
  __typename?: 'ListSection';
  dataSource: ApiQuery;
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type MallGroup = {
  __typename?: 'MallGroup';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Float']['output'];
  isActive: Scalars['Boolean']['output'];
  site?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
};

export type MatchRun = {
  __typename?: 'MatchRun';
  createdAt: Scalars['DateTime']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  finishedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  productId: Scalars['Int']['output'];
  /** 최종 선택된 다나와 pcode */
  selectedPcode?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: MatchRunStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum MatchRunStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Skipped = 'SKIPPED',
  Success = 'SUCCESS',
}

export type MatchRunsByAdminOutput = {
  __typename?: 'MatchRunsByAdminOutput';
  /** 매칭 실행 목록 */
  runs: Array<MatchRun>;
  /** 전체 개수(페이징용) */
  total: Scalars['Int']['output'];
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
  /** 어드민) 키워드 맵 엔트리 벌크 추가 */
  addKeywordMapEntriesByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 키워드 맵 엔트리 추가 */
  addKeywordMapEntryByAdmin: Scalars['Int']['output'];
  /** 어드민) 키워드 맵 그룹 추가 */
  addKeywordMapGroupByAdmin: Scalars['Int']['output'];
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
  /** 사용자 신고 */
  addUserReport: Scalars['Boolean']['output'];
  /** wishlist 추가 */
  addWishlist: Scalars['Boolean']['output'];
  /** 어드민) 로그인 */
  adminLogin: TokenOutput;
  /** 어드민) 리액션 키워드 후보 승인 (synonym 으로 등록) */
  approveHotDealKeywordCandidateByAdmin: Scalars['Boolean']['output'];
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
  /** 유저 등록 상품 썸네일 업로드용 presigned URL 발급 */
  createProductImageUploadUrl: ProductImageUploadUrlOutput;
  /** 유저가 직접 핫딜 상품 등록 (등록된 productId 반환) */
  createUserProduct: Scalars['Int']['output'];
  deleteAd: Scalars['Boolean']['output'];
  /** 어드민) 상품 hard delete */
  hardDeleteProductByAdmin: Scalars['Boolean']['output'];
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
  /** 상품 노출(impression) 기록 — 프론트 viewport 가 보고. CTR 분모. */
  recordProductImpressions: Scalars['Boolean']['output'];
  /** 어드민) 리액션 키워드 후보 거절 */
  rejectHotDealKeywordCandidateByAdmin: Scalars['Boolean']['output'];
  /** 모든 알림 삭제 */
  removeAllNotifications: Scalars['Boolean']['output'];
  removeComment: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 제외 키워드 추가 */
  removeHotDealExcludeKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 키워드 제거 */
  removeHotDealKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 유의어 제거 */
  removeHotDealKeywordSynonymByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 키워드 맵 엔트리 삭제 */
  removeKeywordMapEntryByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 키워드 맵 그룹 삭제 */
  removeKeywordMapGroupByAdmin: Scalars['Boolean']['output'];
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
  /** 어드민) 알림 발송 */
  sendNotificationByAdmin: Scalars['Boolean']['output'];
  /** 대표 매핑 지정 (id 기준) */
  setPrimaryProductMapping: Scalars['Boolean']['output'];
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
  /** 어드민) 키워드 맵 그룹 수정 */
  updateKeywordMapGroupByAdmin: Scalars['Boolean']['output'];
  /** 알림 키워드 상태 수정 */
  updateNotificationKeywordStatus: Scalars['Boolean']['output'];
  /** 비밀번호 업데이트 */
  updatePassword: Scalars['Boolean']['output'];
  /** 계정 별로 관리되는 푸시 설정 업데이트 */
  updatePushSetting: Scalars['Boolean']['output'];
  /** 유저 프로필 수정 */
  updateUserProfile: Scalars['Boolean']['output'];
  /** 매핑 검증 수행 (승인 또는 거부) */
  verifyProductMapping: Scalars['Boolean']['output'];
  /** 회원 탈퇴 */
  withdraw: Scalars['Boolean']['output'];
};

export type MutationAddCommentArgs = {
  content: Scalars['String']['input'];
  isNotice?: InputMaybe<Scalars['Boolean']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
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

export type MutationAddKeywordMapEntriesByAdminArgs = {
  groupId: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
};

export type MutationAddKeywordMapEntryByAdminArgs = {
  groupId: Scalars['Int']['input'];
  keyword: Scalars['String']['input'];
};

export type MutationAddKeywordMapGroupByAdminArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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

export type MutationAddUserReportArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  reason: UserReportReason;
  target: UserReportTarget;
  targetId: Scalars['Float']['input'];
};

export type MutationAddWishlistArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationAdminLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationApproveHotDealKeywordCandidateByAdminArgs = {
  hotDealKeywordId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
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
  position?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCollectThumbnailArgs = {
  position?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
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

export type MutationCreateProductImageUploadUrlArgs = {
  contentType: Scalars['String']['input'];
};

export type MutationCreateUserProductArgs = {
  categoryId: Scalars['Int']['input'];
  content?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type MutationDeleteAdArgs = {
  id: Scalars['Int']['input'];
};

export type MutationHardDeleteProductByAdminArgs = {
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

export type MutationRecordProductImpressionsArgs = {
  impressions: Array<ProductImpressionInput>;
  source: Scalars['String']['input'];
};

export type MutationRejectHotDealKeywordCandidateByAdminArgs = {
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

export type MutationRemoveKeywordMapEntryByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type MutationRemoveKeywordMapGroupByAdminArgs = {
  id: Scalars['Int']['input'];
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

export type MutationSendNotificationByAdminArgs = {
  message: Scalars['String']['input'];
  target?: InputMaybe<NotificationTarget>;
  targetId?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  type: NotificationType;
  url?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type MutationSetPrimaryProductMappingArgs = {
  productMappingId: Scalars['Int']['input'];
};

export type MutationSignupArgs = {
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  email: Scalars['String']['input'];
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  gender?: InputMaybe<Gender>;
  marketingAgreed?: InputMaybe<Scalars['Boolean']['input']>;
  nickname: Scalars['String']['input'];
  nightAlertsAgreed?: InputMaybe<Scalars['Boolean']['input']>;
  password: Scalars['String']['input'];
};

export type MutationSocialLoginArgs = {
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  gender?: InputMaybe<Gender>;
  marketingAgreed?: InputMaybe<Scalars['Boolean']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nightAlertsAgreed?: InputMaybe<Scalars['Boolean']['input']>;
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
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateHotDealKeywordByAdminArgs = {
  id: Scalars['Int']['input'];
  isMajor?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type MutationUpdateKeywordMapGroupByAdminArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateNotificationKeywordStatusArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationUpdatePasswordArgs = {
  password: Scalars['String']['input'];
};

export type MutationUpdatePushSettingArgs = {
  communityAlert?: InputMaybe<Scalars['Boolean']['input']>;
  hotDealAlert?: InputMaybe<Scalars['Boolean']['input']>;
  info?: InputMaybe<Scalars['Boolean']['input']>;
  keywordAlert?: InputMaybe<Scalars['Boolean']['input']>;
  marketing?: InputMaybe<Scalars['Boolean']['input']>;
  nightAlerts?: InputMaybe<Scalars['Boolean']['input']>;
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

export type NotificationByAdminOutput = {
  __typename?: 'NotificationByAdminOutput';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  searchAfter: Array<Scalars['String']['output']>;
  target: Scalars['String']['output'];
  targetId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
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
  Comment = 'COMMENT',
  Info = 'INFO',
  Notice = 'NOTICE',
  Product = 'PRODUCT',
}

export enum NotificationTopic {
  CommunityAlert = 'COMMUNITY_ALERT',
  HotDealAlert = 'HOT_DEAL_ALERT',
  Info = 'INFO',
  KeywordAlert = 'KEYWORD_ALERT',
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

export type PaginatedGridSection = BaseSection & {
  __typename?: 'PaginatedGridSection';
  dataSource: ApiQuery;
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type PriceRangeCountOutput = {
  __typename?: 'PriceRangeCountOutput';
  count: Scalars['Int']['output'];
  maxPrice: Scalars['Float']['output'];
  minPrice: Scalars['Float']['output'];
  /** 가격 구간 라벨 (예: 1만~3만) */
  priceRange: Scalars['String']['output'];
};

export type PriceVisualConfig = {
  __typename?: 'PriceVisualConfig';
  isClustered: Scalars['Boolean']['output'];
  markerPct: Scalars['Float']['output'];
  medianPct: Scalars['Float']['output'];
  q1Pct: Scalars['Float']['output'];
  q3Pct: Scalars['Float']['output'];
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
  visualConfig?: Maybe<PriceVisualConfig>;
};

export type ProductImageUploadUrlOutput = {
  __typename?: 'ProductImageUploadUrlOutput';
  /** 업로드 완료 후 상품 thumbnail 로 쓸 CDN URL */
  imageUrl: Scalars['String']['output'];
  /** 이미지를 PUT 업로드할 presigned URL (1시간 만료) */
  uploadUrl: Scalars['String']['output'];
};

export type ProductImpressionInput = {
  position: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
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
  isPrimary: Scalars['Boolean']['output'];
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
  isPrimary: Scalars['Boolean']['output'];
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
  /** 상품 설명(유저 등록 상품) */
  content?: Maybe<Scalars['String']['output']>;
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
  /** 업로드 주체 */
  uploaderType: UploaderType;
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

export type ProviderCountOutput = {
  __typename?: 'ProviderCountOutput';
  count: Scalars['Int']['output'];
  providerId: Scalars['Int']['output'];
  providerName: Scalars['String']['output'];
};

export type ProviderDateCountOutput = {
  __typename?: 'ProviderDateCountOutput';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  providerId: Scalars['Int']['output'];
  providerName: Scalars['String']['output'];
};

export type ProviderHealthOutput = {
  __typename?: 'ProviderHealthOutput';
  last1hCount: Scalars['Int']['output'];
  last7dCount: Scalars['Int']['output'];
  last24hCount: Scalars['Int']['output'];
  latestCollectedAt?: Maybe<Scalars['DateTime']['output']>;
  /** 마지막 수집 후 경과 분. null이면 7일 내 수집 이력 없음 */
  minutesSinceLatest?: Maybe<Scalars['Int']['output']>;
  providerId: Scalars['Int']['output'];
  providerName: Scalars['String']['output'];
  providerType: ProviderType;
};

export enum ProviderType {
  Community = 'COMMUNITY',
  Danawa = 'DANAWA',
  Mall = 'MALL',
}

export type Query = {
  __typename?: 'Query';
  adStats: Array<AdStats>;
  adminMe: AdminUser;
  ads: Array<Ad>;
  analysisTitleByDanawa: Scalars['Boolean']['output'];
  /** BrandItem 단위 매칭된 전체 개수 조회 */
  brandItemsByMatchCountTotalCount: Scalars['Int']['output'];
  /** BrandItem 단위 매칭 합산 목록 조회 (커서 기반 페이지네이션) */
  brandItemsOrderByTotalMatchCount: Array<BrandItemMatchCountOutput>;
  /** 특정 브랜드 상품의 매핑 개수 조회 */
  brandProductMatchCount: Scalars['Int']['output'];
  /** 매칭된 브랜드 상품 전체 개수 조회 */
  brandProductsByMatchCountTotalCount: Scalars['Int']['output'];
  /** 매칭된 개수가 많은 순으로 브랜드 상품 목록 조회 (커서 기반 페이지네이션) */
  brandProductsOrderByMatchCount: Array<BrandProductMatchCountOutput>;
  categories: Array<Category>;
  /** 커뮤니티 반응 카테고리별 키워드 조회 */
  categorizedReactionKeywords: CategorizedReactionKeywordsResponse;
  comment: CommentOutput;
  comments: Array<CommentOutput>;
  /** 어드민) 댓글 목록 조회 */
  commentsByAdmin: Array<Scalars['String']['output']>;
  communityProviders: Array<Provider>;
  /** 상품 랭킹 랜덤 조회 */
  communityRandomRankingProducts: Array<ProductOutput>;
  /** 어드민) 일별 서비스 조회수 합계 */
  dailyServiceViewStats: Array<DateCountOutput>;
  danawaProduct: DanawaProductOutput;
  danawaProducts: Array<DanawaProductOutput>;
  /** 안읽은 알림 존재 여부 조회 */
  existUnreadNotification: Scalars['Boolean']['output'];
  existsUnreadNotice: Scalars['Boolean']['output'];
  /** 유저 존재 여부 조회 */
  existsUser: ExistsUserOutput;
  /** 해당 상품 신고된 횟수 조회 */
  expireProductReportCount: Scalars['Int']['output'];
  /** 종료된 상품 제보 내역 조회 */
  expireProductReports: Array<ProductExpireReport>;
  /** 유통기한 임박 특가 상품 조회 */
  expiringSoonHotDealProducts: Array<ProductOutput>;
  /** 게이트 차단 매핑 목록 조회 (추출오염/묶음글 등, not_matchable) */
  gatedMappings: Array<ProductMappingOutput>;
  /** 특정 사용자의 추천 상품 조회 (관리자용) */
  getPersonalizedProductsByUserId: Array<RecommendedProductOutput>;
  /** 특정 상품과 유사한 상품 조회 */
  getSimilarProducts: Array<ProductOutput>;
  /** 게스트 카테고리 선호 기반 추천 핫딜 (비로그인 허용, 선호 없으면 인기순 폴백) */
  guestRecommendedHotDeals: Array<ProductOutput>;
  homePage: Array<BaseSection>;
  /** 어드민) 핫딜 제외 키워드 목록 조회 */
  hotDealExcludeKeywordsByAdmin: Array<HotDealExcludeKeywordOutput>;
  /** 어드민) 핫딜 키워드 조회 */
  hotDealKeywordByAdmin?: Maybe<HotDealKeywordOutput>;
  /** 어드민) 리액션 키워드 후보 목록 조회 */
  hotDealKeywordCandidatesByAdmin: Array<HotDealKeywordCandidateOutput>;
  /** 어드민) 핫딜 키워드 유의어 목록 조회 */
  hotDealKeywordSynonymsByAdmin: Array<HotDealKeywordSynonymOutput>;
  /** 어드민) 핫딜 키워드 목록 조회 */
  hotDealKeywordsByAdmin: Array<HotDealKeywordOutput>;
  /** 놓치면 아까운 핫딜 - 랭킹순 핫딜 상품 조회 */
  hotDealRankingProducts: Array<ProductOutput>;
  /** 어드민) 일별 핫딜 비율 추이 */
  hotDealRatioStats: Array<HotDealRatioOutput>;
  /** 어드민) 핫딜 유형별 분포 */
  hotDealTypeDistribution: Array<HotDealTypeCountOutput>;
  /** 어드민) 키워드 맵 그룹 조회 */
  keywordMapGroupByAdmin?: Maybe<KeywordMapGroupOutput>;
  /** 어드민) 키워드 맵 그룹 목록 조회 */
  keywordMapGroupsByAdmin: Array<KeywordMapGroupOutput>;
  mallGroups: Array<MallGroup>;
  /** 어드민) 매칭 실행 상세 조회 (스텝 포함) */
  matchRunByAdmin?: Maybe<MatchRun>;
  /** 어드민) 매칭 실행 목록 조회 (페이징) */
  matchRunsByAdmin: MatchRunsByAdminOutput;
  /** 로그인한 유저 정보 조회 */
  me?: Maybe<User>;
  /** 유저 알림 키워드 목록 조회 */
  notificationKeywordsByMe: Array<NotificationKeyword>;
  /** 어드민) 개별 알림 목록 조회 */
  notificationListByAdmin: Array<Notification>;
  /** 알림 목록 조회 */
  notifications: Array<Notification>;
  /** 어드민) 알림 발송 이력 조회 */
  notificationsByAdmin: Array<NotificationByAdminOutput>;
  /** 검증 대기 중인 매핑 목록 조회 */
  pendingVerifications: Array<ProductMappingOutput>;
  /** 검증 대기 중인 매핑 전체 개수 조회 (필터 적용 가능) */
  pendingVerificationsTotalCount: Scalars['Int']['output'];
  /** 개인화 추천 상품 조회 (로그인 필요) */
  personalizedProducts: Array<RecommendedProductOutput>;
  /** 상품 조회 */
  product?: Maybe<ProductOutput>;
  /** 어드민) 카테고리별 상품 수 */
  productCountByCategory: Array<CategoryCountOutput>;
  /** 어드민) 제공자별 상품 수 */
  productCountByProvider: Array<ProviderCountOutput>;
  productGuides?: Maybe<Array<ProductGuide>>;
  productKeywords: Array<Scalars['String']['output']>;
  /** 어드민) 가격대별 상품 분포 */
  productPriceDistribution: Array<PriceRangeCountOutput>;
  /** 어드민) 일별 신규 상품 등록 수 */
  productRegistrationStats: Array<DateCountOutput>;
  /** 어드민) provider별 시계열 신규 상품 수 (커뮤니티 크롤러 health) */
  productRegistrationStatsByProvider: Array<ProviderDateCountOutput>;
  /** 상품 목록 조회 */
  products: Array<ProductOutput>;
  /** 키워드로 상품 목록 조회 */
  productsByKeyword: Array<ProductOutput>;
  /** 어드민) provider별 최근 수집 활동 (1h/24h/7d count + 마지막 수집 시각) */
  providerHealthStatus: Array<ProviderHealthOutput>;
  /** 푸시 세팅 조회 */
  pushSetting: UserPushSetting;
  /** 최근에 본 상품 N개 조회 */
  recentViewedProducts: Array<ProductOutput>;
  /** 알림 키워드 추천 목록 조회 */
  recommendedNotificationKeywords: Array<Scalars['String']['output']>;
  /** 신고한 사용자 목록 조회 (마스킹) */
  reportUserNames: Array<Scalars['String']['output']>;
  /** 자동완성용 추천 검색어 목록. prefix로 시작하는 인기 검색어 + 상품 title prefix 매칭. */
  searchSuggestions: Array<Scalars['String']['output']>;
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
  /** 어드민) 썸네일 수집 통계 (타입 분포 + mall별 분포 + 미수집 카운트) */
  thumbnailStats: ThumbnailStatsOutput;
  /** 같이 본 상품 목록 조회 */
  togetherViewedProducts: Array<ProductOutput>;
  /** 어드민) 인기 관심 카테고리 TOP N */
  topFavoriteCategories: Array<CategoryCountOutput>;
  /** 어드민) 알림 키워드 TOP N */
  topNotificationKeywords: Array<KeywordCountOutput>;
  /** 안읽은 알림 수 목록 조회 */
  unreadNotificationsCount: Scalars['Int']['output'];
  /** 유저 조회 */
  user: User;
  /** 어드민) 사용자 상세 조회 */
  userByAdmin: User;
  /** 이메일로 유저 조회 */
  userByEmail: User;
  /** 어드민) 성별/연령대 분포 */
  userDemographicStats: UserDemographicStatsOutput;
  /** 어드민) 일별/주별/월별 가입자 수 추이 */
  userRegistrationStats: Array<DateCountOutput>;
  /** 어드민) 사용자 목록 조회 */
  usersByAdmin: Array<UserByAdminOutput>;
  /** 어드민) 사용자 총 인원수 조회 */
  usersTotalCountByAdmin: Scalars['Int']['output'];
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

export type QueryBrandItemsByMatchCountTotalCountArgs = {
  title?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBrandItemsOrderByTotalMatchCountArgs = {
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
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

export type QueryCommentArgs = {
  id: Scalars['Int']['input'];
};

export type QueryCommentsArgs = {
  isNotice?: InputMaybe<Scalars['Boolean']['input']>;
  isRoot?: InputMaybe<Scalars['Boolean']['input']>;
  isTrending?: InputMaybe<Scalars['Boolean']['input']>;
  limit: Scalars['Int']['input'];
  orderBy: CommentOrder;
  orderOption: OrderOptionType;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
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

export type QueryDailyServiceViewStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
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

export type QueryGatedMappingsArgs = {
  limit: Scalars['Int']['input'];
  matchingSource?: InputMaybe<Array<Scalars['String']['input']>>;
  orderBy?: InputMaybe<OrderOptionType>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
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

export type QueryGuestRecommendedHotDealsArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
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

export type QueryHotDealKeywordCandidatesByAdminArgs = {
  limit: Scalars['Int']['input'];
  orderBy: HotDealKeywordCandidateOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<HotDealKeywordCandidateStatus>;
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

export type QueryHotDealRatioStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryHotDealTypeDistributionArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryKeywordMapGroupByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type QueryKeywordMapGroupsByAdminArgs = {
  limit: Scalars['Int']['input'];
  orderBy: KeywordMapGroupOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryMatchRunByAdminArgs = {
  runId: Scalars['Int']['input'];
};

export type QueryMatchRunsByAdminArgs = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<MatchRunStatus>;
  take?: InputMaybe<Scalars['Int']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QueryNotificationKeywordsByMeArgs = {
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryNotificationListByAdminArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  target?: InputMaybe<NotificationTarget>;
  targetId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type QueryNotificationsByAdminArgs = {
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type QueryProductPriceDistributionArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryProductRegistrationStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryProductRegistrationStatsByProviderArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  providerType?: InputMaybe<ProviderType>;
  startDate: Scalars['DateTime']['input'];
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

export type QueryProviderHealthStatusArgs = {
  providerType?: InputMaybe<ProviderType>;
};

export type QueryRecentViewedProductsArgs = {
  limit?: Scalars['Int']['input'];
};

export type QueryReportUserNamesArgs = {
  productId: Scalars['Int']['input'];
};

export type QuerySearchSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  prefix: Scalars['String']['input'];
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

export type QueryThumbnailStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryTogetherViewedProductsArgs = {
  limit: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
};

export type QueryTopFavoriteCategoriesArgs = {
  limit?: Scalars['Int']['input'];
};

export type QueryTopNotificationKeywordsArgs = {
  limit?: Scalars['Int']['input'];
  since?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};

export type QueryUserByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};

export type QueryUserRegistrationStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryUsersByAdminArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryUsersTotalCountByAdminArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
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

export enum SectionDisplayType {
  GridTabbed = 'GRID_TABBED',
  Group = 'GROUP',
  HorizontalScroll = 'HORIZONTAL_SCROLL',
  List = 'LIST',
  PaginatedGrid = 'PAGINATED_GRID',
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

export type ThumbnailMallCountOutput = {
  __typename?: 'ThumbnailMallCountOutput';
  count: Scalars['Int']['output'];
  /** detailUrl 호스트의 second-level 도메인 (예: 11st, lotteon, gmarket) */
  mallName: Scalars['String']['output'];
};

export type ThumbnailStatsOutput = {
  __typename?: 'ThumbnailStatsOutput';
  mallDistribution: Array<ThumbnailMallCountOutput>;
  /** 전체 상품 중 thumbnailType=null(=수집 안 됨) 카운트 */
  missingCount: Scalars['Int']['output'];
  /** 전체 상품 카운트 */
  totalCount: Scalars['Int']['output'];
  typeDistribution: Array<ThumbnailTypeCountOutput>;
};

export enum ThumbnailType {
  Mall = 'MALL',
  Post = 'POST',
}

export type ThumbnailTypeCountOutput = {
  __typename?: 'ThumbnailTypeCountOutput';
  count: Scalars['Int']['output'];
  /** post / mall / null(미수집) */
  thumbnailType?: Maybe<Scalars['String']['output']>;
};

export type TokenOutput = {
  __typename?: 'TokenOutput';
  accessToken: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
};

export enum TokenType {
  Apns = 'APNS',
  Fcm = 'FCM',
}

/** 상품 업로드 주체 */
export enum UploaderType {
  /** 크롤러가 수집한 상품 (기본값) */
  Crawled = 'CRAWLED',
  /** 지름알림 공식이 등록한 상품 */
  Official = 'OFFICIAL',
  /** 일반 유저가 직접 등록한 상품 */
  User = 'USER',
}

export type User = {
  __typename?: 'User';
  birthYear?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  favoriteCategories?: Maybe<Array<Scalars['Int']['output']>>;
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  lastReadNoticeAt?: Maybe<Scalars['DateTime']['output']>;
  linkedSocialProviders?: Maybe<Array<OauthProvider>>;
  nickname: Scalars['String']['output'];
};

export type UserByAdminOutput = {
  __typename?: 'UserByAdminOutput';
  birthYear?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  searchAfter: Array<Scalars['String']['output']>;
};

export type UserDemographicStatsOutput = {
  __typename?: 'UserDemographicStatsOutput';
  ageDistribution: Array<AgeGroupCountOutput>;
  genderDistribution: Array<GenderCountOutput>;
};

/** 좋아요 대상 */
export enum UserLikeTarget {
  Comment = 'COMMENT',
  Product = 'PRODUCT',
}

export type UserPushSetting = {
  __typename?: 'UserPushSetting';
  communityAlert: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  hotDealAlert: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  info: Scalars['Boolean']['output'];
  keywordAlert: Scalars['Boolean']['output'];
  marketing: Scalars['Boolean']['output'];
  marketingAgreedAt?: Maybe<Scalars['DateTime']['output']>;
  nightAlerts: Scalars['Boolean']['output'];
  nightAlertsAgreedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['Int']['output'];
};

/** 신고 사유 */
export enum UserReportReason {
  Abuse = 'ABUSE',
  Inappropriate = 'INAPPROPRIATE',
  Other = 'OTHER',
  Privacy = 'PRIVACY',
  Spam = 'SPAM',
}

/** 신고 대상 */
export enum UserReportTarget {
  Comment = 'COMMENT',
  CommentReply = 'COMMENT_REPLY',
}

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
  me?: {
    __typename?: 'User';
    id: string;
    email: string;
    nickname: string;
    birthYear?: number | null;
    gender?: Gender | null;
    favoriteCategories?: Array<number> | null;
  } | null;
};

export type QueryMyCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type QueryMyCategoriesQuery = {
  __typename?: 'Query';
  me?: { __typename?: 'User'; favoriteCategories?: Array<number> | null } | null;
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

export type MutationAddUserDeviceMutationVariables = Exact<{
  deviceId: Scalars['String']['input'];
}>;

export type MutationAddUserDeviceMutation = { __typename?: 'Mutation'; addUserDevice: boolean };

export type MutationSocialLoginMutationVariables = Exact<{
  oauthProvider: OauthProvider;
  socialAccessToken: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  gender?: InputMaybe<Gender>;
  favoriteCategories?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;

export type MutationSocialLoginMutation = {
  __typename?: 'Mutation';
  socialLogin: {
    __typename?: 'SocialLoginOutput';
    accessToken: string;
    refreshToken?: string | null;
    type: string;
  };
};

export type QuerySocialAccessTokenQueryVariables = Exact<{
  code: Scalars['String']['input'];
  oauthProvider: OauthProvider;
  state: Scalars['String']['input'];
}>;

export type QuerySocialAccessTokenQuery = { __typename?: 'Query'; socialAccessToken: string };

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
    productId?: number | null;
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

export type CommunityPostsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  isNotice?: InputMaybe<Scalars['Boolean']['input']>;
  isTrending?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy: CommentOrder;
  orderOption: OrderOptionType;
}>;

export type CommunityPostsQuery = {
  __typename?: 'Query';
  comments: Array<{
    __typename?: 'CommentOutput';
    id: string;
    productId?: number | null;
    parentId?: number | null;
    title?: string | null;
    content: string;
    createdAt: any;
    searchAfter?: Array<string> | null;
    isNotice: boolean;
    likeCount: number;
    replyCount: number;
    viewCount: number;
    isMyLike?: boolean | null;
    isMyReported: boolean;
    author?: { __typename?: 'User'; id: string; nickname: string } | null;
    taggedProduct?: {
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      thumbnail?: string | null;
      price?: string | null;
      postedAt: any;
      url?: string | null;
    } | null;
  }>;
};

export type CommunityPostQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type CommunityPostQuery = {
  __typename?: 'Query';
  comment: {
    __typename?: 'CommentOutput';
    id: string;
    title?: string | null;
    content: string;
    createdAt: any;
    likeCount: number;
    viewCount: number;
    isMyLike?: boolean | null;
    isNotice: boolean;
    isMyReported: boolean;
    productId?: number | null;
    author?: { __typename?: 'User'; id: string; nickname: string } | null;
    taggedProduct?: {
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      thumbnail?: string | null;
      price?: string | null;
      postedAt: any;
      url?: string | null;
    } | null;
  };
};

export type AddCommunityPostMutationVariables = Exact<{
  content: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type AddCommunityPostMutation = { __typename?: 'Mutation'; addComment: boolean };

export type UpdateCommunityPostMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  content: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateCommunityPostMutation = { __typename?: 'Mutation'; updateComment: boolean };

export type RemoveCommunityPostMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type RemoveCommunityPostMutation = { __typename?: 'Mutation'; removeComment: boolean };

export type ReportCommunityPostMutationVariables = Exact<{
  targetId: Scalars['Float']['input'];
  target: UserReportTarget;
  reason: UserReportReason;
  description?: InputMaybe<Scalars['String']['input']>;
}>;

export type ReportCommunityPostMutation = { __typename?: 'Mutation'; addUserReport: boolean };

export type LikeCommunityPostMutationVariables = Exact<{
  targetId: Scalars['Int']['input'];
  isLike?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type LikeCommunityPostMutation = { __typename?: 'Mutation'; addUserLikeOrDislike: boolean };

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
      categoryId: number;
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

export type MutationReadNotificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationReadNotificationMutation = {
  __typename?: 'Mutation';
  readNotification: boolean;
};

export type MutationReadAllNotificationsMutationVariables = Exact<{ [key: string]: never }>;

export type MutationReadAllNotificationsMutation = {
  __typename?: 'Mutation';
  readAllNotifications: boolean;
};

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
    categoryId: number;
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
      visualConfig?: {
        __typename?: 'PriceVisualConfig';
        markerPct: number;
        q1Pct: number;
        q3Pct: number;
        medianPct: number;
        isClustered: boolean;
      } | null;
    } | null;
  } | null;
};

export type ProductAdditionalInfoFragment = {
  __typename?: 'ProductOutput';
  id: string;
  url?: string | null;
  positiveCommunityReactionCount: number;
  negativeCommunityReactionCount: number;
  hotDealType?: HotDealType | null;
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
    visualConfig?: {
      __typename?: 'PriceVisualConfig';
      markerPct: number;
      q1Pct: number;
      q3Pct: number;
      medianPct: number;
      isClustered: boolean;
    } | null;
  } | null;
  commentSummary?: {
    __typename?: 'ProductCommentSummary';
    additionalInfo?: string | null;
    option?: string | null;
    price?: string | null;
    productId: string;
    purchaseMethod?: string | null;
    satisfaction?: string | null;
    summary?: string | null;
  } | null;
} & { ' $fragmentName'?: 'ProductAdditionalInfoFragment' };

export type ProductAdditionalInfoQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductAdditionalInfoQuery = {
  __typename?: 'Query';
  product?:
    | ({ __typename?: 'ProductOutput' } & {
        ' $fragmentRefs'?: { ProductAdditionalInfoFragment: ProductAdditionalInfoFragment };
      })
    | null;
};

export type ProductInfoFragment = {
  __typename?: 'ProductOutput';
  id: string;
  categoryId: number;
  categoryName?: string | null;
  title: string;
  url?: string | null;
  detailUrl?: string | null;
  isHot?: boolean | null;
  isEnd?: boolean | null;
  price?: string | null;
  postedAt: any;
  thumbnail?: string | null;
  uploaderType: UploaderType;
  content?: string | null;
  hotDealType?: HotDealType | null;
  viewCount: number;
  mallName?: string | null;
  author?: { __typename?: 'User'; id: string; nickname: string } | null;
  provider: {
    __typename?: 'Provider';
    id: string;
    name: string;
    nameKr: string;
    host?: string | null;
  };
} & { ' $fragmentName'?: 'ProductInfoFragment' };

export type ProductInfoQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductInfoQuery = {
  __typename?: 'Query';
  product?:
    | ({ __typename?: 'ProductOutput' } & {
        ' $fragmentRefs'?: { ProductInfoFragment: ProductInfoFragment };
      })
    | null;
};

export type ProductStatsFragment = {
  __typename?: 'ProductOutput';
  id: string;
  isHot?: boolean | null;
  isEnd?: boolean | null;
  wishlistCount: number;
  isMyLike?: boolean | null;
  isMyReported: boolean;
  likeCount: number;
  isMyWishlist?: boolean | null;
} & { ' $fragmentName'?: 'ProductStatsFragment' };

export type ProductStatsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductStatsQuery = {
  __typename?: 'Query';
  product?:
    | ({ __typename?: 'ProductOutput' } & {
        ' $fragmentRefs'?: { ProductStatsFragment: ProductStatsFragment };
      })
    | null;
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
  productGuides?: Array<{
    __typename?: 'ProductGuide';
    id: string;
    title: string;
    content: string;
  }> | null;
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
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
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
    categoryId: number;
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
    categoryId: number;
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
    categoryId: number;
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

export type CreateUserProductMutationVariables = Exact<{
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
  categoryId: Scalars['Int']['input'];
  price?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
}>;

export type CreateUserProductMutation = { __typename?: 'Mutation'; createUserProduct: number };

export type CreateProductImageUploadUrlMutationVariables = Exact<{
  contentType: Scalars['String']['input'];
}>;

export type CreateProductImageUploadUrlMutation = {
  __typename?: 'Mutation';
  createProductImageUploadUrl: {
    __typename?: 'ProductImageUploadUrlOutput';
    uploadUrl: string;
    imageUrl: string;
  };
};

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

export type QueryHotDealRankingProductsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type QueryHotDealRankingProductsQuery = {
  __typename?: 'Query';
  hotDealRankingProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type QueryGuestRecommendedHotDealsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type QueryGuestRecommendedHotDealsQuery = {
  __typename?: 'Query';
  guestRecommendedHotDeals: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
};

export type QueryExpiringSoonHotDealProductsQueryVariables = Exact<{
  daysUntilExpiry: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryExpiringSoonHotDealProductsQuery = {
  __typename?: 'Query';
  expiringSoonHotDealProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    earliestExpiryDate?: any | null;
    provider: { __typename?: 'Provider'; nameKr: string };
  }>;
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
      categoryId: number;
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
export const ProductAdditionalInfoFragmentDoc = new TypedDocumentString(
  `
    fragment ProductAdditionalInfo on ProductOutput {
  id
  url
  positiveCommunityReactionCount
  negativeCommunityReactionCount
  provider {
    id
    name
    nameKr
    host
  }
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
    visualConfig {
      markerPct
      q1Pct
      q3Pct
      medianPct
      isClustered
    }
  }
  commentSummary {
    additionalInfo
    option
    price
    productId
    purchaseMethod
    satisfaction
    summary
  }
}
    `,
  { fragmentName: 'ProductAdditionalInfo' },
) as unknown as TypedDocumentString<ProductAdditionalInfoFragment, unknown>;
export const ProductInfoFragmentDoc = new TypedDocumentString(
  `
    fragment ProductInfo on ProductOutput {
  id
  categoryId
  categoryName
  title
  url
  detailUrl
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
}
    `,
  { fragmentName: 'ProductInfo' },
) as unknown as TypedDocumentString<ProductInfoFragment, unknown>;
export const ProductStatsFragmentDoc = new TypedDocumentString(
  `
    fragment ProductStats on ProductOutput {
  id
  isHot
  isEnd
  wishlistCount
  isMyLike
  isMyReported
  likeCount
  isMyWishlist
}
    `,
  { fragmentName: 'ProductStats' },
) as unknown as TypedDocumentString<ProductStatsFragment, unknown>;
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
export const MutationAddUserDeviceDocument = new TypedDocumentString(`
    mutation MutationAddUserDevice($deviceId: String!) {
  addUserDevice(deviceId: $deviceId)
}
    `) as unknown as TypedDocumentString<
  MutationAddUserDeviceMutation,
  MutationAddUserDeviceMutationVariables
>;
export const MutationSocialLoginDocument = new TypedDocumentString(`
    mutation MutationSocialLogin($oauthProvider: OauthProvider!, $socialAccessToken: String!, $email: String, $nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {
  socialLogin(
    oauthProvider: $oauthProvider
    socialAccessToken: $socialAccessToken
    email: $email
    nickname: $nickname
    birthYear: $birthYear
    gender: $gender
    favoriteCategories: $favoriteCategories
  ) {
    accessToken
    refreshToken
    type
  }
}
    `) as unknown as TypedDocumentString<
  MutationSocialLoginMutation,
  MutationSocialLoginMutationVariables
>;
export const QuerySocialAccessTokenDocument = new TypedDocumentString(`
    query QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {
  socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)
}
    `) as unknown as TypedDocumentString<
  QuerySocialAccessTokenQuery,
  QuerySocialAccessTokenQueryVariables
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
export const CommunityPostsDocument = new TypedDocumentString(`
    query CommunityPosts($limit: Int!, $searchAfter: [String!], $isNotice: Boolean, $isTrending: Boolean, $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {
  comments(
    limit: $limit
    searchAfter: $searchAfter
    isNotice: $isNotice
    isTrending: $isTrending
    isRoot: true
    orderBy: $orderBy
    orderOption: $orderOption
  ) {
    id
    productId
    parentId
    title
    content
    createdAt
    searchAfter
    isNotice
    likeCount
    replyCount
    viewCount
    isMyLike
    isMyReported
    author {
      id
      nickname
    }
    taggedProduct {
      id
      title
      thumbnail
      price
      postedAt
      url
    }
  }
}
    `) as unknown as TypedDocumentString<CommunityPostsQuery, CommunityPostsQueryVariables>;
export const CommunityPostDocument = new TypedDocumentString(`
    query CommunityPost($id: Int!) {
  comment(id: $id) {
    id
    title
    content
    createdAt
    likeCount
    viewCount
    isMyLike
    isNotice
    isMyReported
    productId
    author {
      id
      nickname
    }
    taggedProduct {
      id
      title
      thumbnail
      price
      postedAt
      url
    }
  }
}
    `) as unknown as TypedDocumentString<CommunityPostQuery, CommunityPostQueryVariables>;
export const AddCommunityPostDocument = new TypedDocumentString(`
    mutation AddCommunityPost($content: String!, $title: String, $productId: Int) {
  addComment(content: $content, title: $title, productId: $productId)
}
    `) as unknown as TypedDocumentString<
  AddCommunityPostMutation,
  AddCommunityPostMutationVariables
>;
export const UpdateCommunityPostDocument = new TypedDocumentString(`
    mutation UpdateCommunityPost($id: Int!, $content: String!, $title: String) {
  updateComment(id: $id, content: $content, title: $title)
}
    `) as unknown as TypedDocumentString<
  UpdateCommunityPostMutation,
  UpdateCommunityPostMutationVariables
>;
export const RemoveCommunityPostDocument = new TypedDocumentString(`
    mutation RemoveCommunityPost($id: Int!) {
  removeComment(id: $id)
}
    `) as unknown as TypedDocumentString<
  RemoveCommunityPostMutation,
  RemoveCommunityPostMutationVariables
>;
export const ReportCommunityPostDocument = new TypedDocumentString(`
    mutation ReportCommunityPost($targetId: Float!, $target: UserReportTarget!, $reason: UserReportReason!, $description: String) {
  addUserReport(
    target: $target
    targetId: $targetId
    reason: $reason
    description: $description
  )
}
    `) as unknown as TypedDocumentString<
  ReportCommunityPostMutation,
  ReportCommunityPostMutationVariables
>;
export const LikeCommunityPostDocument = new TypedDocumentString(`
    mutation LikeCommunityPost($targetId: Int!, $isLike: Boolean) {
  addUserLikeOrDislike(target: COMMENT, targetId: $targetId, isLike: $isLike)
}
    `) as unknown as TypedDocumentString<
  LikeCommunityPostMutation,
  LikeCommunityPostMutationVariables
>;
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
export const MutationReadNotificationDocument = new TypedDocumentString(`
    mutation MutationReadNotification($id: Int!) {
  readNotification(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationReadNotificationMutation,
  MutationReadNotificationMutationVariables
>;
export const MutationReadAllNotificationsDocument = new TypedDocumentString(`
    mutation MutationReadAllNotifications {
  readAllNotifications
}
    `) as unknown as TypedDocumentString<
  MutationReadAllNotificationsMutation,
  MutationReadAllNotificationsMutationVariables
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
      visualConfig {
        markerPct
        q1Pct
        q3Pct
        medianPct
        isClustered
      }
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
export const ProductAdditionalInfoDocument = new TypedDocumentString(`
    query ProductAdditionalInfo($id: Int!) {
  product(id: $id) {
    ...ProductAdditionalInfo
  }
}
    fragment ProductAdditionalInfo on ProductOutput {
  id
  url
  positiveCommunityReactionCount
  negativeCommunityReactionCount
  provider {
    id
    name
    nameKr
    host
  }
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
    visualConfig {
      markerPct
      q1Pct
      q3Pct
      medianPct
      isClustered
    }
  }
  commentSummary {
    additionalInfo
    option
    price
    productId
    purchaseMethod
    satisfaction
    summary
  }
}`) as unknown as TypedDocumentString<
  ProductAdditionalInfoQuery,
  ProductAdditionalInfoQueryVariables
>;
export const ProductInfoDocument = new TypedDocumentString(`
    query ProductInfo($id: Int!) {
  product(id: $id) {
    ...ProductInfo
  }
}
    fragment ProductInfo on ProductOutput {
  id
  categoryId
  categoryName
  title
  url
  detailUrl
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
}`) as unknown as TypedDocumentString<ProductInfoQuery, ProductInfoQueryVariables>;
export const ProductStatsDocument = new TypedDocumentString(`
    query ProductStats($id: Int!) {
  product(id: $id) {
    ...ProductStats
  }
}
    fragment ProductStats on ProductOutput {
  id
  isHot
  isEnd
  wishlistCount
  isMyLike
  isMyReported
  likeCount
  isMyWishlist
}`) as unknown as TypedDocumentString<ProductStatsQuery, ProductStatsQueryVariables>;
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
export const CreateUserProductDocument = new TypedDocumentString(`
    mutation CreateUserProduct($title: String!, $url: String!, $categoryId: Int!, $price: String, $thumbnail: String, $content: String) {
  createUserProduct(
    title: $title
    url: $url
    categoryId: $categoryId
    price: $price
    thumbnail: $thumbnail
    content: $content
  )
}
    `) as unknown as TypedDocumentString<
  CreateUserProductMutation,
  CreateUserProductMutationVariables
>;
export const CreateProductImageUploadUrlDocument = new TypedDocumentString(`
    mutation CreateProductImageUploadUrl($contentType: String!) {
  createProductImageUploadUrl(contentType: $contentType) {
    uploadUrl
    imageUrl
  }
}
    `) as unknown as TypedDocumentString<
  CreateProductImageUploadUrlMutation,
  CreateProductImageUploadUrlMutationVariables
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
export const QueryHotDealRankingProductsDocument = new TypedDocumentString(`
    query QueryHotDealRankingProducts($page: Int!, $limit: Int!) {
  hotDealRankingProducts(page: $page, limit: $limit) {
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
  QueryHotDealRankingProductsQuery,
  QueryHotDealRankingProductsQueryVariables
>;
export const QueryGuestRecommendedHotDealsDocument = new TypedDocumentString(`
    query QueryGuestRecommendedHotDeals($page: Int!, $limit: Int!) {
  guestRecommendedHotDeals(page: $page, limit: $limit) {
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
  QueryGuestRecommendedHotDealsQuery,
  QueryGuestRecommendedHotDealsQueryVariables
>;
export const QueryExpiringSoonHotDealProductsDocument = new TypedDocumentString(`
    query QueryExpiringSoonHotDealProducts($daysUntilExpiry: Int!, $limit: Int!, $searchAfter: [String!]) {
  expiringSoonHotDealProducts(
    daysUntilExpiry: $daysUntilExpiry
    limit: $limit
    searchAfter: $searchAfter
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
    earliestExpiryDate
  }
}
    `) as unknown as TypedDocumentString<
  QueryExpiringSoonHotDealProductsQuery,
  QueryExpiringSoonHotDealProductsQueryVariables
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
