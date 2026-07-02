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

export type AdAssetUploadUrlOutput = {
  __typename?: 'AdAssetUploadUrlOutput';
  /** 업로드 완료 후 graphic.assetUrl 로 쓸 CDN URL */
  assetUrl: Scalars['String']['output'];
  /** 이미지를 PUT 업로드할 presigned URL */
  uploadUrl: Scalars['String']['output'];
};

export type AdReportRow = {
  __typename?: 'AdReportRow';
  clicks: Scalars['Int']['output'];
  creativeId: Scalars['Int']['output'];
  /** clicks / impressions (impressions=0 이면 0) */
  ctr: Scalars['Float']['output'];
  impressions: Scalars['Int']['output'];
  internalId: Scalars['String']['output'];
  slotLocation: Scalars['String']['output'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AdvertiseCreative = {
  __typename?: 'AdvertiseCreative';
  createdAt: Scalars['DateTime']['output'];
  displayPrice?: Maybe<AdvertisePrice>;
  displayTitle?: Maybe<Scalars['String']['output']>;
  endAt: Scalars['DateTime']['output'];
  /** ResponsiveAdvertiseGraphic (프론트가 렌더) */
  graphic: Scalars['JSONObject']['output'];
  id: Scalars['ID']['output'];
  /** 내부 식별자 (예: 얼라이브-260625-배너) */
  internalId: Scalars['String']['output'];
  /** 즉시 on/off 킬스위치 */
  isActive: Scalars['Boolean']['output'];
  modifiedAt: Scalars['DateTime']['output'];
  /** 노출 위치 (여러 곳 가능) */
  slotLocation: Array<AdvertiseSlotLocation>;
  /** 높을수록 먼저 노출 */
  slotPriority: Scalars['Int']['output'];
  slotType: AdvertiseSlotType;
  startAt: Scalars['DateTime']['output'];
  /** 클릭 시 목적지 URL */
  targetUrl: Scalars['String']['output'];
};

export type AdvertiseImpressionInput = {
  creativeId: Scalars['Int']['input'];
  slotLocation: AdvertiseSlotLocation;
};

export type AdvertisePrice = {
  __typename?: 'AdvertisePrice';
  /** 예: "28% 할인" */
  discountText?: Maybe<Scalars['String']['output']>;
  /** 예: "299,000원" / "299,000원~" / "최대 30% 할인" */
  displayPrice: Scalars['String']['output'];
  /** 예: "999,000원" */
  originalPrice?: Maybe<Scalars['String']['output']>;
};

export type AdvertisePriceInput = {
  discountText?: InputMaybe<Scalars['String']['input']>;
  displayPrice: Scalars['String']['input'];
  originalPrice?: InputMaybe<Scalars['String']['input']>;
};

export enum AdvertiseSlotLocation {
  HomeCarouselBanner = 'home_carousel_banner',
  HomeMainBanner = 'home_main_banner',
  HomeRankingProduct = 'home_ranking_product',
  ProductMainBanner = 'product_main_banner',
  SiwolPromotionEnter = 'siwol_promotion_enter',
}

export enum AdvertiseSlotType {
  Banner = 'banner',
  PinnedProduct = 'pinnedProduct',
}

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

export type CreateAdvertiseInput = {
  displayPrice?: InputMaybe<AdvertisePriceInput>;
  displayTitle?: InputMaybe<Scalars['String']['input']>;
  endAt: Scalars['DateTime']['input'];
  /** ResponsiveAdvertiseGraphic */
  graphic: Scalars['JSONObject']['input'];
  internalId: Scalars['String']['input'];
  isActive?: Scalars['Boolean']['input'];
  slotLocation: Array<AdvertiseSlotLocation>;
  slotPriority?: Scalars['Int']['input'];
  slotType: AdvertiseSlotType;
  startAt: Scalars['DateTime']['input'];
  targetUrl: Scalars['String']['input'];
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

export type ModelPageAdminItemOutput = {
  __typename?: 'ModelPageAdminItemOutput';
  brand?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  heroImage?: Maybe<Scalars['String']['output']>;
  heroMinPrice?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  isPublished: Scalars['Boolean']['output'];
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  modelName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type ModelPageListItemOutput = {
  __typename?: 'ModelPageListItemOutput';
  brand?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  heroImage?: Maybe<Scalars['String']['output']>;
  heroMinPrice?: Maybe<Scalars['Int']['output']>;
  modelName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  unitLabel?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Int']['output']>;
};

export type ModelPageOutput = {
  __typename?: 'ModelPageOutput';
  brand?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  id?: Maybe<Scalars['Int']['output']>;
  isPublished?: Maybe<Scalars['Boolean']['output']>;
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  modelName: Scalars['String']['output'];
  payload?: Maybe<Scalars['JSONObject']['output']>;
  slug: Scalars['String']['output'];
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
  /** 상품 단건 수집 */
  collectProduct: Scalars['Boolean']['output'];
  /** 썸네일 단건 수집 */
  collectThumbnail: Scalars['Boolean']['output'];
  /** 어드민) 광고 생성 (생성된 id 반환) */
  createAd: Scalars['Int']['output'];
  /** 어드민) 광고 에셋 업로드 presigned URL */
  createAdAssetUploadUrl: AdAssetUploadUrlOutput;
  /** 유저 등록 상품 썸네일 업로드용 presigned URL 발급 */
  createProductImageUploadUrl: ProductImageUploadUrlOutput;
  /** 유저가 직접 핫딜 상품 등록 (등록된 productId 반환) */
  createUserProduct: Scalars['Int']['output'];
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
  /** 광고 클릭 계측 */
  recordAdClick: Scalars['Boolean']['output'];
  /** 광고 노출 계측 (bulk) */
  recordAdImpressions: Scalars['Boolean']['output'];
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
  /** 어드민) 광고 on/off (킬스위치) */
  setAdActive: Scalars['Boolean']['output'];
  /** 어드민) 모델 페이지 발행 토글 */
  setModelPagePublishedByAdmin: Scalars['Boolean']['output'];
  /** 대표 매핑 지정 (id 기준) */
  setPrimaryProductMapping: Scalars['Boolean']['output'];
  /** 회원가입 */
  signup: SignupOutput;
  /** 소셜 로그인 */
  socialLogin: SocialLoginOutput;
  /** 알림 묶음(테마) 구독 — 키워드 시점 매칭, 멱등 */
  subscribeNotificationTheme: Scalars['Boolean']['output'];
  /** 알림 묶음(테마) 구독 해지 */
  unsubscribeNotificationTheme: Scalars['Boolean']['output'];
  /** 어드민) 광고 수정 */
  updateAd: Scalars['Boolean']['output'];
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
  input: CreateAdvertiseInput;
};

export type MutationCreateAdAssetUploadUrlArgs = {
  contentType: Scalars['String']['input'];
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

export type MutationRecordAdClickArgs = {
  creativeId: Scalars['Int']['input'];
  slotLocation: AdvertiseSlotLocation;
};

export type MutationRecordAdImpressionsArgs = {
  events: Array<AdvertiseImpressionInput>;
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

export type MutationSetAdActiveArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationSetModelPagePublishedByAdminArgs = {
  id: Scalars['Int']['input'];
  isPublished: Scalars['Boolean']['input'];
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

export type MutationSubscribeNotificationThemeArgs = {
  themeId: Scalars['Int']['input'];
};

export type MutationUnsubscribeNotificationThemeArgs = {
  themeId: Scalars['Int']['input'];
};

export type MutationUpdateAdArgs = {
  id: Scalars['Int']['input'];
  input: UpdateAdvertiseInput;
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

export type PriceComparison = {
  __typename?: 'PriceComparison';
  /** 가격비교 출처(DANAWA | COMMUNITY_CLUSTER) */
  basis: PriceComparisonBasis;
  /** DANAWA 전용 상세 */
  danawa?: Maybe<PriceContext>;
  /** 우리 딜가(원) */
  dealPrice: Scalars['Float']['output'];
  /** 할인율 0~1 (1 - dealPrice/lowestPrice) */
  delta: Scalars['Float']['output'];
  /** 비교 최저가 — 다나와가 또는 클러스터 최저가 */
  lowestPrice: Scalars['Float']['output'];
  /** COMMUNITY_CLUSTER 전용 판매처별 글 */
  sellers?: Maybe<Array<ProductOutput>>;
};

export enum PriceComparisonBasis {
  CommunityCluster = 'COMMUNITY_CLUSTER',
  Danawa = 'DANAWA',
}

export type PriceContext = {
  __typename?: 'PriceContext';
  danawaPrice: Scalars['Float']['output'];
  danawaProductName?: Maybe<Scalars['String']['output']>;
  dealPrice: Scalars['Float']['output'];
  delta: Scalars['Float']['output'];
  normalPriceMax?: Maybe<Scalars['Float']['output']>;
  normalPriceMedian?: Maybe<Scalars['Float']['output']>;
  normalPriceMin?: Maybe<Scalars['Float']['output']>;
  verificationStatus?: Maybe<Scalars['String']['output']>;
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
  aiSuggestion?: Maybe<ProductMappingAiSuggestion>;
  aiSuggestionConfidence?: Maybe<Scalars['Int']['output']>;
  aiSuggestionReason?: Maybe<Scalars['String']['output']>;
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

export enum ProductMappingAiSuggestion {
  Approve = 'APPROVE',
  Reject = 'REJECT',
}

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
  aiSuggestion?: Maybe<ProductMappingAiSuggestion>;
  aiSuggestionConfidence?: Maybe<Scalars['Int']['output']>;
  aiSuggestionReason?: Maybe<Scalars['String']['output']>;
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
  mallName?: Maybe<Scalars['String']['output']>;
  mappingInfo?: Maybe<Array<ProductMappingInfoOutput>>;
  negativeCommunityReactionCount: Scalars['Int']['output'];
  parsedPrice?: Maybe<Scalars['Float']['output']>;
  positiveCommunityReactionCount: Scalars['Int']['output'];
  postedAt: Scalars['DateTime']['output'];
  precomputedRankingScore?: Maybe<Scalars['Float']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  /** 통합 가격비교(DANAWA 배지 또는 COMMUNITY_CLUSTER 블록, 상세 전용) */
  priceComparison?: Maybe<PriceComparison>;
  /** 왜 핫딜인지 가격 컨텍스트 (게이트 통과 시에만, 상세 전용) */
  priceContext?: Maybe<PriceContext>;
  priceCurrency?: Maybe<Scalars['String']['output']>;
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
  /** 슬롯 위치의 현재 노출 가능한 광고 (우선순위순) */
  activeAds: Array<AdvertiseCreative>;
  /** 어드민) 광고 노출/클릭 정산 리포트 */
  adReport: Array<AdReportRow>;
  adminMe: AdminUser;
  /** 어드민) 광고 목록 */
  adsByAdmin: Array<AdvertiseCreative>;
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
  /** 같은 상품의 다른 커뮤니티 글 조회 (Track B 클러스터, 최저가순) */
  clusteredProducts: Array<ProductOutput>;
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
  modelPage?: Maybe<ModelPageOutput>;
  /** 어드민) 모델 페이지 미리보기 */
  modelPagePreviewByAdmin?: Maybe<ModelPageOutput>;
  /** 어드민) 모델 페이지 검수 목록 */
  modelPagesByAdmin: Array<ModelPageAdminItemOutput>;
  /** 내가 구독한 묶음(테마) id 목록 */
  mySubscribedThemeIds: Array<Scalars['Int']['output']>;
  /** 유저 알림 키워드 목록 조회 */
  notificationKeywordsByMe: Array<NotificationKeyword>;
  /** 어드민) 개별 알림 목록 조회 */
  notificationListByAdmin: Array<Notification>;
  /** 묶음 라이브 딜(상세 진입 시 실시간 조회) */
  notificationThemeLiveDeals: Array<ProductOutput>;
  /** 활성 알림 묶음(테마) 목록 + 대표 키워드 */
  notificationThemes: Array<ThemeWithKeywords>;
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
  publishedModelPages: Array<ModelPageListItemOutput>;
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

export type QueryActiveAdsArgs = {
  slotLocation: AdvertiseSlotLocation;
};

export type QueryAdReportArgs = {
  creativeId?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};

export type QueryAdsByAdminArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  slotLocation?: InputMaybe<AdvertiseSlotLocation>;
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

export type QueryClusteredProductsArgs = {
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

export type QueryModelPageArgs = {
  slug: Scalars['String']['input'];
};

export type QueryModelPagePreviewByAdminArgs = {
  slug: Scalars['String']['input'];
};

export type QueryModelPagesByAdminArgs = {
  onlyDrafts?: InputMaybe<Scalars['Boolean']['input']>;
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

export type QueryNotificationThemeLiveDealsArgs = {
  themeId: Scalars['Int']['input'];
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
  aiSuggestion?: InputMaybe<ProductMappingAiSuggestion>;
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  limit: Scalars['Int']['input'];
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<OrderOptionType>;
  prioritizeOld?: InputMaybe<Scalars['Boolean']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  suspiciousFirst?: InputMaybe<Scalars['Boolean']['input']>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<Array<ProductMappingVerificationStatus>>;
};

export type QueryPendingVerificationsTotalCountArgs = {
  aiSuggestion?: InputMaybe<ProductMappingAiSuggestion>;
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
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

export type ThemeWithKeywords = {
  __typename?: 'ThemeWithKeywords';
  description: Scalars['String']['output'];
  emoji?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  representativeKeywords: Array<Scalars['String']['output']>;
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

export type UpdateAdvertiseInput = {
  displayPrice?: InputMaybe<AdvertisePriceInput>;
  displayTitle?: InputMaybe<Scalars['String']['input']>;
  endAt?: InputMaybe<Scalars['DateTime']['input']>;
  graphic?: InputMaybe<Scalars['JSONObject']['input']>;
  internalId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  slotLocation?: InputMaybe<Array<AdvertiseSlotLocation>>;
  slotPriority?: InputMaybe<Scalars['Int']['input']>;
  slotType?: InputMaybe<AdvertiseSlotType>;
  startAt?: InputMaybe<Scalars['DateTime']['input']>;
  targetUrl?: InputMaybe<Scalars['String']['input']>;
};

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

export type AdsByAdminQueryVariables = Exact<{
  slotLocation?: InputMaybe<AdvertiseSlotLocation>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type AdsByAdminQuery = {
  __typename?: 'Query';
  adsByAdmin: Array<{
    __typename?: 'AdvertiseCreative';
    id: string;
    internalId: string;
    startAt: any;
    endAt: any;
    slotType: AdvertiseSlotType;
    slotLocation: Array<AdvertiseSlotLocation>;
    slotPriority: number;
    graphic: any;
    displayTitle?: string | null;
    targetUrl: string;
    isActive: boolean;
    createdAt: any;
    modifiedAt: any;
    displayPrice?: {
      __typename?: 'AdvertisePrice';
      discountText?: string | null;
      originalPrice?: string | null;
      displayPrice: string;
    } | null;
  }>;
};

export type AdReportQueryVariables = Exact<{
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
  creativeId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type AdReportQuery = {
  __typename?: 'Query';
  adReport: Array<{
    __typename?: 'AdReportRow';
    creativeId: number;
    internalId: string;
    slotLocation: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
};

export type ActiveAdsQueryVariables = Exact<{
  slotLocation: AdvertiseSlotLocation;
}>;

export type ActiveAdsQuery = {
  __typename?: 'Query';
  activeAds: Array<{
    __typename?: 'AdvertiseCreative';
    id: string;
    internalId: string;
    startAt: any;
    endAt: any;
    slotType: AdvertiseSlotType;
    slotLocation: Array<AdvertiseSlotLocation>;
    slotPriority: number;
    graphic: any;
    displayTitle?: string | null;
    targetUrl: string;
    isActive: boolean;
    createdAt: any;
    modifiedAt: any;
    displayPrice?: {
      __typename?: 'AdvertisePrice';
      discountText?: string | null;
      originalPrice?: string | null;
      displayPrice: string;
    } | null;
  }>;
};

export type RecordAdImpressionsMutationVariables = Exact<{
  events: Array<AdvertiseImpressionInput> | AdvertiseImpressionInput;
}>;

export type RecordAdImpressionsMutation = { __typename?: 'Mutation'; recordAdImpressions: boolean };

export type RecordAdClickMutationVariables = Exact<{
  creativeId: Scalars['Int']['input'];
  slotLocation: AdvertiseSlotLocation;
}>;

export type RecordAdClickMutation = { __typename?: 'Mutation'; recordAdClick: boolean };

export type CreateAdAssetUploadUrlMutationVariables = Exact<{
  contentType: Scalars['String']['input'];
}>;

export type CreateAdAssetUploadUrlMutation = {
  __typename?: 'Mutation';
  createAdAssetUploadUrl: {
    __typename?: 'AdAssetUploadUrlOutput';
    uploadUrl: string;
    assetUrl: string;
  };
};

export type CreateAdMutationVariables = Exact<{
  input: CreateAdvertiseInput;
}>;

export type CreateAdMutation = { __typename?: 'Mutation'; createAd: number };

export type UpdateAdMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateAdvertiseInput;
}>;

export type UpdateAdMutation = { __typename?: 'Mutation'; updateAd: boolean };

export type SetAdActiveMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
}>;

export type SetAdActiveMutation = { __typename?: 'Mutation'; setAdActive: boolean };

export type MutationAdminLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type MutationAdminLoginMutation = {
  __typename?: 'Mutation';
  adminLogin: { __typename?: 'TokenOutput'; accessToken: string; refreshToken?: string | null };
};

export type QueryAdminMeQueryVariables = Exact<{ [key: string]: never }>;

export type QueryAdminMeQuery = {
  __typename?: 'Query';
  adminMe: { __typename?: 'AdminUser'; id: string; name: string; email: string };
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

export type QueryBrandItemsOrderByTotalMatchCountQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryBrandItemsOrderByTotalMatchCountQuery = {
  __typename?: 'Query';
  brandItemsOrderByTotalMatchCount: Array<{
    __typename?: 'BrandItemMatchCountOutput';
    id: string;
    brandName: string;
    productName: string;
    totalMatchCount: number;
    pendingVerificationCount: number;
    searchAfter?: Array<string> | null;
  }>;
};

export type QueryBrandItemsByMatchCountTotalCountQueryVariables = Exact<{
  title?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryBrandItemsByMatchCountTotalCountQuery = {
  __typename?: 'Query';
  brandItemsByMatchCountTotalCount: number;
};

export type QueryCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type QueryCategoriesQuery = {
  __typename?: 'Query';
  categories: Array<{ __typename?: 'Category'; id: string; name: string }>;
};

export type CommentsByAdminQueryVariables = Exact<{
  hotDealKeywordId: Scalars['Int']['input'];
  synonyms?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type CommentsByAdminQuery = { __typename?: 'Query'; commentsByAdmin: Array<string> };

export type QueryGatedMappingsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  matchingSource?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<OrderOptionType>;
}>;

export type QueryGatedMappingsQuery = {
  __typename?: 'Query';
  gatedMappings: Array<{
    __typename?: 'ProductMappingOutput';
    id: string;
    productId: number;
    matchStatus?: ProductMappingMatchStatus | null;
    matchingSource?: string | null;
    matchingReasoning?: string | null;
    extractedProductInfo?: string | null;
    createdAt: any;
    searchAfter?: Array<string> | null;
    product?: {
      __typename?: 'ProductOutput';
      title: string;
      thumbnail?: string | null;
      price?: string | null;
      url?: string | null;
      provider: { __typename?: 'Provider'; name: string };
    } | null;
  }>;
};

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

export type QueryKeywordMapGroupsByAdminQueryVariables = Exact<{
  orderBy: KeywordMapGroupOrderType;
  orderOption: OrderOptionType;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryKeywordMapGroupsByAdminQuery = {
  __typename?: 'Query';
  keywordMapGroupsByAdmin: Array<{
    __typename?: 'KeywordMapGroupOutput';
    id: string;
    name: string;
    description?: string | null;
    entryCount: number;
    searchAfter?: Array<string> | null;
  }>;
};

export type QueryKeywordMapGroupByAdminQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryKeywordMapGroupByAdminQuery = {
  __typename?: 'Query';
  keywordMapGroupByAdmin?: {
    __typename?: 'KeywordMapGroupOutput';
    id: string;
    name: string;
    description?: string | null;
    entryCount: number;
    entries: Array<{ __typename?: 'KeywordMapEntry'; id: string; keyword: string }>;
  } | null;
};

export type MutationAddKeywordMapGroupByAdminMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;

export type MutationAddKeywordMapGroupByAdminMutation = {
  __typename?: 'Mutation';
  addKeywordMapGroupByAdmin: number;
};

export type MutationUpdateKeywordMapGroupByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;

export type MutationUpdateKeywordMapGroupByAdminMutation = {
  __typename?: 'Mutation';
  updateKeywordMapGroupByAdmin: boolean;
};

export type MutationRemoveKeywordMapGroupByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationRemoveKeywordMapGroupByAdminMutation = {
  __typename?: 'Mutation';
  removeKeywordMapGroupByAdmin: boolean;
};

export type MutationAddKeywordMapEntryByAdminMutationVariables = Exact<{
  groupId: Scalars['Int']['input'];
  keyword: Scalars['String']['input'];
}>;

export type MutationAddKeywordMapEntryByAdminMutation = {
  __typename?: 'Mutation';
  addKeywordMapEntryByAdmin: number;
};

export type MutationAddKeywordMapEntriesByAdminMutationVariables = Exact<{
  groupId: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type MutationAddKeywordMapEntriesByAdminMutation = {
  __typename?: 'Mutation';
  addKeywordMapEntriesByAdmin: boolean;
};

export type MutationRemoveKeywordMapEntryByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationRemoveKeywordMapEntryByAdminMutation = {
  __typename?: 'Mutation';
  removeKeywordMapEntryByAdmin: boolean;
};

export type QueryModelPagesByAdminQueryVariables = Exact<{
  onlyDrafts?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type QueryModelPagesByAdminQuery = {
  __typename?: 'Query';
  modelPagesByAdmin: Array<{
    __typename?: 'ModelPageAdminItemOutput';
    id: number;
    slug: string;
    brand?: string | null;
    modelName: string;
    dealCount: number;
    lastDealAt?: any | null;
    heroImage?: string | null;
    heroMinPrice?: number | null;
    isPublished: boolean;
  }>;
};

export type QueryModelPagePreviewByAdminQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type QueryModelPagePreviewByAdminQuery = {
  __typename?: 'Query';
  modelPagePreviewByAdmin?: {
    __typename?: 'ModelPageOutput';
    id?: number | null;
    isPublished?: boolean | null;
    slug: string;
    brand?: string | null;
    modelName: string;
    dealCount: number;
    lastDealAt?: any | null;
    metaDescription?: string | null;
    payload?: any | null;
  } | null;
};

export type MutationSetModelPagePublishedByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  isPublished: Scalars['Boolean']['input'];
}>;

export type MutationSetModelPagePublishedByAdminMutation = {
  __typename?: 'Mutation';
  setModelPagePublishedByAdmin: boolean;
};

export type QueryNotificationsByAdminQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type QueryNotificationsByAdminQuery = {
  __typename?: 'Query';
  notificationsByAdmin: Array<{
    __typename?: 'NotificationByAdminOutput';
    id: string;
    title?: string | null;
    message: string;
    target: string;
    targetId?: string | null;
    createdAt: any;
    searchAfter: Array<string>;
  }>;
};

export type MutationSendNotificationByAdminMutationVariables = Exact<{
  title: Scalars['String']['input'];
  message: Scalars['String']['input'];
  type: NotificationType;
  target?: InputMaybe<NotificationTarget>;
  targetId?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;

export type MutationSendNotificationByAdminMutation = {
  __typename?: 'Mutation';
  sendNotificationByAdmin: boolean;
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

export type MutationHardDeleteProductByAdminMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationHardDeleteProductByAdminMutation = {
  __typename?: 'Mutation';
  hardDeleteProductByAdmin: boolean;
};

export type QueryProductQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryProductQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    providerId: number;
    category?: string | null;
    categoryId: number;
    categoryName?: string | null;
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
    likeCount: number;
    dislikeCount: number;
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

export type QueryUserRegistrationStatsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryUserRegistrationStatsQuery = {
  __typename?: 'Query';
  userRegistrationStats: Array<{ __typename?: 'DateCountOutput'; date: string; count: number }>;
};

export type QueryUserDemographicStatsQueryVariables = Exact<{ [key: string]: never }>;

export type QueryUserDemographicStatsQuery = {
  __typename?: 'Query';
  userDemographicStats: {
    __typename?: 'UserDemographicStatsOutput';
    genderDistribution: Array<{
      __typename?: 'GenderCountOutput';
      gender?: Gender | null;
      count: number;
    }>;
    ageDistribution: Array<{ __typename?: 'AgeGroupCountOutput'; ageGroup: string; count: number }>;
  };
};

export type QueryTopFavoriteCategoriesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type QueryTopFavoriteCategoriesQuery = {
  __typename?: 'Query';
  topFavoriteCategories: Array<{
    __typename?: 'CategoryCountOutput';
    categoryId: number;
    categoryName: string;
    count: number;
  }>;
};

export type QueryProductRegistrationStatsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryProductRegistrationStatsQuery = {
  __typename?: 'Query';
  productRegistrationStats: Array<{ __typename?: 'DateCountOutput'; date: string; count: number }>;
};

export type QueryHotDealRatioStatsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryHotDealRatioStatsQuery = {
  __typename?: 'Query';
  hotDealRatioStats: Array<{
    __typename?: 'HotDealRatioOutput';
    date: string;
    totalCount: number;
    hotDealCount: number;
    ratio: number;
  }>;
};

export type QueryHotDealTypeDistributionQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryHotDealTypeDistributionQuery = {
  __typename?: 'Query';
  hotDealTypeDistribution: Array<{
    __typename?: 'HotDealTypeCountOutput';
    hotDealType: HotDealType;
    count: number;
  }>;
};

export type QueryProductCountByCategoryQueryVariables = Exact<{ [key: string]: never }>;

export type QueryProductCountByCategoryQuery = {
  __typename?: 'Query';
  productCountByCategory: Array<{
    __typename?: 'CategoryCountOutput';
    categoryId: number;
    categoryName: string;
    count: number;
  }>;
};

export type QueryProductCountByProviderQueryVariables = Exact<{ [key: string]: never }>;

export type QueryProductCountByProviderQuery = {
  __typename?: 'Query';
  productCountByProvider: Array<{
    __typename?: 'ProviderCountOutput';
    providerId: number;
    providerName: string;
    count: number;
  }>;
};

export type QueryProductPriceDistributionQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryProductPriceDistributionQuery = {
  __typename?: 'Query';
  productPriceDistribution: Array<{
    __typename?: 'PriceRangeCountOutput';
    priceRange: string;
    minPrice: number;
    maxPrice: number;
    count: number;
  }>;
};

export type QueryDailyServiceViewStatsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryDailyServiceViewStatsQuery = {
  __typename?: 'Query';
  dailyServiceViewStats: Array<{ __typename?: 'DateCountOutput'; date: string; count: number }>;
};

export type QueryTopNotificationKeywordsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  since?: InputMaybe<Scalars['DateTime']['input']>;
}>;

export type QueryTopNotificationKeywordsQuery = {
  __typename?: 'Query';
  topNotificationKeywords: Array<{
    __typename?: 'KeywordCountOutput';
    keyword: string;
    count: number;
  }>;
};

export type QueryProductRegistrationStatsByProviderQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
  providerType?: InputMaybe<ProviderType>;
}>;

export type QueryProductRegistrationStatsByProviderQuery = {
  __typename?: 'Query';
  productRegistrationStatsByProvider: Array<{
    __typename?: 'ProviderDateCountOutput';
    date: string;
    providerId: number;
    providerName: string;
    count: number;
  }>;
};

export type QueryProviderHealthStatusQueryVariables = Exact<{
  providerType?: InputMaybe<ProviderType>;
}>;

export type QueryProviderHealthStatusQuery = {
  __typename?: 'Query';
  providerHealthStatus: Array<{
    __typename?: 'ProviderHealthOutput';
    providerId: number;
    providerName: string;
    providerType: ProviderType;
    last1hCount: number;
    last24hCount: number;
    last7dCount: number;
    latestCollectedAt?: any | null;
    minutesSinceLatest?: number | null;
  }>;
};

export type QueryThumbnailStatsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  interval: DateInterval;
}>;

export type QueryThumbnailStatsQuery = {
  __typename?: 'Query';
  thumbnailStats: {
    __typename?: 'ThumbnailStatsOutput';
    missingCount: number;
    totalCount: number;
    typeDistribution: Array<{
      __typename?: 'ThumbnailTypeCountOutput';
      thumbnailType?: string | null;
      count: number;
    }>;
    mallDistribution: Array<{
      __typename?: 'ThumbnailMallCountOutput';
      mallName: string;
      count: number;
    }>;
  };
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

export type QueryUsersByAdminQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryUsersByAdminQuery = {
  __typename?: 'Query';
  usersByAdmin: Array<{
    __typename?: 'UserByAdminOutput';
    id: string;
    email: string;
    nickname?: string | null;
    birthYear?: number | null;
    gender?: Gender | null;
    createdAt: any;
    searchAfter: Array<string>;
  }>;
};

export type QueryUserByAdminQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type QueryUserByAdminQuery = {
  __typename?: 'Query';
  userByAdmin: {
    __typename?: 'User';
    id: string;
    email: string;
    nickname: string;
    birthYear?: number | null;
    gender?: Gender | null;
    favoriteCategories?: Array<number> | null;
    linkedSocialProviders?: Array<OauthProvider> | null;
    createdAt: any;
  };
};

export type QueryUsersTotalCountByAdminQueryVariables = Exact<{
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;

export type QueryUsersTotalCountByAdminQuery = {
  __typename?: 'Query';
  usersTotalCountByAdmin: number;
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
  aiSuggestion?: InputMaybe<ProductMappingAiSuggestion>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  suspiciousFirst?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type QueryPendingVerificationsQuery = {
  __typename?: 'Query';
  pendingVerifications: Array<{
    __typename?: 'ProductMappingOutput';
    id: string;
    productId: number;
    brandProduct?: string | null;
    danawaUrl?: string | null;
    matchingConfidence?: number | null;
    matchingReasoning?: string | null;
    aiSuggestion?: ProductMappingAiSuggestion | null;
    aiSuggestionConfidence?: number | null;
    aiSuggestionReason?: string | null;
    verificationStatus?: ProductMappingVerificationStatus | null;
    verifiedAt?: any | null;
    verificationNote?: string | null;
    createdAt: any;
    searchAfter?: Array<string> | null;
    product?: {
      __typename?: 'ProductOutput';
      title: string;
      thumbnail?: string | null;
      price?: string | null;
      url?: string | null;
      provider: { __typename?: 'Provider'; name: string };
    } | null;
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
  aiSuggestion?: InputMaybe<ProductMappingAiSuggestion>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
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

export const AdsByAdminDocument = new TypedDocumentString(`
    query AdsByAdmin($slotLocation: AdvertiseSlotLocation, $isActive: Boolean) {
  adsByAdmin(slotLocation: $slotLocation, isActive: $isActive) {
    id
    internalId
    startAt
    endAt
    slotType
    slotLocation
    slotPriority
    graphic
    displayPrice {
      discountText
      originalPrice
      displayPrice
    }
    displayTitle
    targetUrl
    isActive
    createdAt
    modifiedAt
  }
}
    `) as unknown as TypedDocumentString<AdsByAdminQuery, AdsByAdminQueryVariables>;
export const AdReportDocument = new TypedDocumentString(`
    query AdReport($from: DateTime!, $to: DateTime!, $creativeId: Int) {
  adReport(from: $from, to: $to, creativeId: $creativeId) {
    creativeId
    internalId
    slotLocation
    impressions
    clicks
    ctr
  }
}
    `) as unknown as TypedDocumentString<AdReportQuery, AdReportQueryVariables>;
export const ActiveAdsDocument = new TypedDocumentString(`
    query ActiveAds($slotLocation: AdvertiseSlotLocation!) {
  activeAds(slotLocation: $slotLocation) {
    id
    internalId
    startAt
    endAt
    slotType
    slotLocation
    slotPriority
    graphic
    displayPrice {
      discountText
      originalPrice
      displayPrice
    }
    displayTitle
    targetUrl
    isActive
    createdAt
    modifiedAt
  }
}
    `) as unknown as TypedDocumentString<ActiveAdsQuery, ActiveAdsQueryVariables>;
export const RecordAdImpressionsDocument = new TypedDocumentString(`
    mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {
  recordAdImpressions(events: $events)
}
    `) as unknown as TypedDocumentString<
  RecordAdImpressionsMutation,
  RecordAdImpressionsMutationVariables
>;
export const RecordAdClickDocument = new TypedDocumentString(`
    mutation RecordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {
  recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)
}
    `) as unknown as TypedDocumentString<RecordAdClickMutation, RecordAdClickMutationVariables>;
export const CreateAdAssetUploadUrlDocument = new TypedDocumentString(`
    mutation CreateAdAssetUploadUrl($contentType: String!) {
  createAdAssetUploadUrl(contentType: $contentType) {
    uploadUrl
    assetUrl
  }
}
    `) as unknown as TypedDocumentString<
  CreateAdAssetUploadUrlMutation,
  CreateAdAssetUploadUrlMutationVariables
>;
export const CreateAdDocument = new TypedDocumentString(`
    mutation CreateAd($input: CreateAdvertiseInput!) {
  createAd(input: $input)
}
    `) as unknown as TypedDocumentString<CreateAdMutation, CreateAdMutationVariables>;
export const UpdateAdDocument = new TypedDocumentString(`
    mutation UpdateAd($id: Int!, $input: UpdateAdvertiseInput!) {
  updateAd(id: $id, input: $input)
}
    `) as unknown as TypedDocumentString<UpdateAdMutation, UpdateAdMutationVariables>;
export const SetAdActiveDocument = new TypedDocumentString(`
    mutation SetAdActive($id: Int!, $isActive: Boolean!) {
  setAdActive(id: $id, isActive: $isActive)
}
    `) as unknown as TypedDocumentString<SetAdActiveMutation, SetAdActiveMutationVariables>;
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
export const QueryAdminMeDocument = new TypedDocumentString(`
    query QueryAdminMe {
  adminMe {
    id
    name
    email
  }
}
    `) as unknown as TypedDocumentString<QueryAdminMeQuery, QueryAdminMeQueryVariables>;
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
export const QueryBrandItemsOrderByTotalMatchCountDocument = new TypedDocumentString(`
    query QueryBrandItemsOrderByTotalMatchCount($limit: Int!, $searchAfter: [String!], $title: String) {
  brandItemsOrderByTotalMatchCount(
    limit: $limit
    searchAfter: $searchAfter
    title: $title
  ) {
    id
    brandName
    productName
    totalMatchCount
    pendingVerificationCount
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryBrandItemsOrderByTotalMatchCountQuery,
  QueryBrandItemsOrderByTotalMatchCountQueryVariables
>;
export const QueryBrandItemsByMatchCountTotalCountDocument = new TypedDocumentString(`
    query QueryBrandItemsByMatchCountTotalCount($title: String) {
  brandItemsByMatchCountTotalCount(title: $title)
}
    `) as unknown as TypedDocumentString<
  QueryBrandItemsByMatchCountTotalCountQuery,
  QueryBrandItemsByMatchCountTotalCountQueryVariables
>;
export const QueryCategoriesDocument = new TypedDocumentString(`
    query QueryCategories {
  categories {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<QueryCategoriesQuery, QueryCategoriesQueryVariables>;
export const CommentsByAdminDocument = new TypedDocumentString(`
    query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {
  commentsByAdmin(
    hotDealKeywordId: $hotDealKeywordId
    synonyms: $synonyms
    excludes: $excludes
  )
}
    `) as unknown as TypedDocumentString<CommentsByAdminQuery, CommentsByAdminQueryVariables>;
export const QueryGatedMappingsDocument = new TypedDocumentString(`
    query QueryGatedMappings($limit: Int!, $searchAfter: [String!], $matchingSource: [String!], $productTitle: String, $orderBy: OrderOptionType) {
  gatedMappings(
    limit: $limit
    searchAfter: $searchAfter
    matchingSource: $matchingSource
    productTitle: $productTitle
    orderBy: $orderBy
  ) {
    id
    productId
    product {
      title
      thumbnail
      price
      url
      provider {
        name
      }
    }
    matchStatus
    matchingSource
    matchingReasoning
    extractedProductInfo
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<QueryGatedMappingsQuery, QueryGatedMappingsQueryVariables>;
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
export const QueryKeywordMapGroupsByAdminDocument = new TypedDocumentString(`
    query QueryKeywordMapGroupsByAdmin($orderBy: KeywordMapGroupOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {
  keywordMapGroupsByAdmin(
    orderBy: $orderBy
    orderOption: $orderOption
    limit: $limit
    searchAfter: $searchAfter
  ) {
    id
    name
    description
    entryCount
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryKeywordMapGroupsByAdminQuery,
  QueryKeywordMapGroupsByAdminQueryVariables
>;
export const QueryKeywordMapGroupByAdminDocument = new TypedDocumentString(`
    query QueryKeywordMapGroupByAdmin($id: Int!) {
  keywordMapGroupByAdmin(id: $id) {
    id
    name
    description
    entryCount
    entries {
      id
      keyword
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryKeywordMapGroupByAdminQuery,
  QueryKeywordMapGroupByAdminQueryVariables
>;
export const MutationAddKeywordMapGroupByAdminDocument = new TypedDocumentString(`
    mutation MutationAddKeywordMapGroupByAdmin($name: String!, $description: String) {
  addKeywordMapGroupByAdmin(name: $name, description: $description)
}
    `) as unknown as TypedDocumentString<
  MutationAddKeywordMapGroupByAdminMutation,
  MutationAddKeywordMapGroupByAdminMutationVariables
>;
export const MutationUpdateKeywordMapGroupByAdminDocument = new TypedDocumentString(`
    mutation MutationUpdateKeywordMapGroupByAdmin($id: Int!, $name: String, $description: String) {
  updateKeywordMapGroupByAdmin(id: $id, name: $name, description: $description)
}
    `) as unknown as TypedDocumentString<
  MutationUpdateKeywordMapGroupByAdminMutation,
  MutationUpdateKeywordMapGroupByAdminMutationVariables
>;
export const MutationRemoveKeywordMapGroupByAdminDocument = new TypedDocumentString(`
    mutation MutationRemoveKeywordMapGroupByAdmin($id: Int!) {
  removeKeywordMapGroupByAdmin(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveKeywordMapGroupByAdminMutation,
  MutationRemoveKeywordMapGroupByAdminMutationVariables
>;
export const MutationAddKeywordMapEntryByAdminDocument = new TypedDocumentString(`
    mutation MutationAddKeywordMapEntryByAdmin($groupId: Int!, $keyword: String!) {
  addKeywordMapEntryByAdmin(groupId: $groupId, keyword: $keyword)
}
    `) as unknown as TypedDocumentString<
  MutationAddKeywordMapEntryByAdminMutation,
  MutationAddKeywordMapEntryByAdminMutationVariables
>;
export const MutationAddKeywordMapEntriesByAdminDocument = new TypedDocumentString(`
    mutation MutationAddKeywordMapEntriesByAdmin($groupId: Int!, $keywords: [String!]!) {
  addKeywordMapEntriesByAdmin(groupId: $groupId, keywords: $keywords)
}
    `) as unknown as TypedDocumentString<
  MutationAddKeywordMapEntriesByAdminMutation,
  MutationAddKeywordMapEntriesByAdminMutationVariables
>;
export const MutationRemoveKeywordMapEntryByAdminDocument = new TypedDocumentString(`
    mutation MutationRemoveKeywordMapEntryByAdmin($id: Int!) {
  removeKeywordMapEntryByAdmin(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveKeywordMapEntryByAdminMutation,
  MutationRemoveKeywordMapEntryByAdminMutationVariables
>;
export const QueryModelPagesByAdminDocument = new TypedDocumentString(`
    query QueryModelPagesByAdmin($onlyDrafts: Boolean) {
  modelPagesByAdmin(onlyDrafts: $onlyDrafts) {
    id
    slug
    brand
    modelName
    dealCount
    lastDealAt
    heroImage
    heroMinPrice
    isPublished
  }
}
    `) as unknown as TypedDocumentString<
  QueryModelPagesByAdminQuery,
  QueryModelPagesByAdminQueryVariables
>;
export const QueryModelPagePreviewByAdminDocument = new TypedDocumentString(`
    query QueryModelPagePreviewByAdmin($slug: String!) {
  modelPagePreviewByAdmin(slug: $slug) {
    id
    isPublished
    slug
    brand
    modelName
    dealCount
    lastDealAt
    metaDescription
    payload
  }
}
    `) as unknown as TypedDocumentString<
  QueryModelPagePreviewByAdminQuery,
  QueryModelPagePreviewByAdminQueryVariables
>;
export const MutationSetModelPagePublishedByAdminDocument = new TypedDocumentString(`
    mutation MutationSetModelPagePublishedByAdmin($id: Int!, $isPublished: Boolean!) {
  setModelPagePublishedByAdmin(id: $id, isPublished: $isPublished)
}
    `) as unknown as TypedDocumentString<
  MutationSetModelPagePublishedByAdminMutation,
  MutationSetModelPagePublishedByAdminMutationVariables
>;
export const QueryNotificationsByAdminDocument = new TypedDocumentString(`
    query QueryNotificationsByAdmin($limit: Int!, $searchAfter: [String!]) {
  notificationsByAdmin(limit: $limit, searchAfter: $searchAfter) {
    id
    title
    message
    target
    targetId
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<
  QueryNotificationsByAdminQuery,
  QueryNotificationsByAdminQueryVariables
>;
export const MutationSendNotificationByAdminDocument = new TypedDocumentString(`
    mutation MutationSendNotificationByAdmin($title: String!, $message: String!, $type: NotificationType!, $target: NotificationTarget, $targetId: Int, $url: String, $userIds: [Int!]) {
  sendNotificationByAdmin(
    title: $title
    message: $message
    type: $type
    target: $target
    targetId: $targetId
    url: $url
    userIds: $userIds
  )
}
    `) as unknown as TypedDocumentString<
  MutationSendNotificationByAdminMutation,
  MutationSendNotificationByAdminMutationVariables
>;
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
export const MutationHardDeleteProductByAdminDocument = new TypedDocumentString(`
    mutation MutationHardDeleteProductByAdmin($id: Int!) {
  hardDeleteProductByAdmin(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationHardDeleteProductByAdminMutation,
  MutationHardDeleteProductByAdminMutationVariables
>;
export const QueryProductDocument = new TypedDocumentString(`
    query QueryProduct($id: Int!) {
  product(id: $id) {
    id
    providerId
    category
    categoryId
    categoryName
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
    likeCount
    dislikeCount
  }
}
    `) as unknown as TypedDocumentString<QueryProductQuery, QueryProductQueryVariables>;
export const QueryUserRegistrationStatsDocument = new TypedDocumentString(`
    query QueryUserRegistrationStats($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  userRegistrationStats(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
  ) {
    date
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryUserRegistrationStatsQuery,
  QueryUserRegistrationStatsQueryVariables
>;
export const QueryUserDemographicStatsDocument = new TypedDocumentString(`
    query QueryUserDemographicStats {
  userDemographicStats {
    genderDistribution {
      gender
      count
    }
    ageDistribution {
      ageGroup
      count
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryUserDemographicStatsQuery,
  QueryUserDemographicStatsQueryVariables
>;
export const QueryTopFavoriteCategoriesDocument = new TypedDocumentString(`
    query QueryTopFavoriteCategories($limit: Int) {
  topFavoriteCategories(limit: $limit) {
    categoryId
    categoryName
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryTopFavoriteCategoriesQuery,
  QueryTopFavoriteCategoriesQueryVariables
>;
export const QueryProductRegistrationStatsDocument = new TypedDocumentString(`
    query QueryProductRegistrationStats($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  productRegistrationStats(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
  ) {
    date
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductRegistrationStatsQuery,
  QueryProductRegistrationStatsQueryVariables
>;
export const QueryHotDealRatioStatsDocument = new TypedDocumentString(`
    query QueryHotDealRatioStats($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  hotDealRatioStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
    date
    totalCount
    hotDealCount
    ratio
  }
}
    `) as unknown as TypedDocumentString<
  QueryHotDealRatioStatsQuery,
  QueryHotDealRatioStatsQueryVariables
>;
export const QueryHotDealTypeDistributionDocument = new TypedDocumentString(`
    query QueryHotDealTypeDistribution($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  hotDealTypeDistribution(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
  ) {
    hotDealType
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryHotDealTypeDistributionQuery,
  QueryHotDealTypeDistributionQueryVariables
>;
export const QueryProductCountByCategoryDocument = new TypedDocumentString(`
    query QueryProductCountByCategory {
  productCountByCategory {
    categoryId
    categoryName
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductCountByCategoryQuery,
  QueryProductCountByCategoryQueryVariables
>;
export const QueryProductCountByProviderDocument = new TypedDocumentString(`
    query QueryProductCountByProvider {
  productCountByProvider {
    providerId
    providerName
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductCountByProviderQuery,
  QueryProductCountByProviderQueryVariables
>;
export const QueryProductPriceDistributionDocument = new TypedDocumentString(`
    query QueryProductPriceDistribution($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  productPriceDistribution(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
  ) {
    priceRange
    minPrice
    maxPrice
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductPriceDistributionQuery,
  QueryProductPriceDistributionQueryVariables
>;
export const QueryDailyServiceViewStatsDocument = new TypedDocumentString(`
    query QueryDailyServiceViewStats($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  dailyServiceViewStats(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
  ) {
    date
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryDailyServiceViewStatsQuery,
  QueryDailyServiceViewStatsQueryVariables
>;
export const QueryTopNotificationKeywordsDocument = new TypedDocumentString(`
    query QueryTopNotificationKeywords($limit: Int, $since: DateTime) {
  topNotificationKeywords(limit: $limit, since: $since) {
    keyword
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryTopNotificationKeywordsQuery,
  QueryTopNotificationKeywordsQueryVariables
>;
export const QueryProductRegistrationStatsByProviderDocument = new TypedDocumentString(`
    query QueryProductRegistrationStatsByProvider($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!, $providerType: ProviderType) {
  productRegistrationStatsByProvider(
    startDate: $startDate
    endDate: $endDate
    interval: $interval
    providerType: $providerType
  ) {
    date
    providerId
    providerName
    count
  }
}
    `) as unknown as TypedDocumentString<
  QueryProductRegistrationStatsByProviderQuery,
  QueryProductRegistrationStatsByProviderQueryVariables
>;
export const QueryProviderHealthStatusDocument = new TypedDocumentString(`
    query QueryProviderHealthStatus($providerType: ProviderType) {
  providerHealthStatus(providerType: $providerType) {
    providerId
    providerName
    providerType
    last1hCount
    last24hCount
    last7dCount
    latestCollectedAt
    minutesSinceLatest
  }
}
    `) as unknown as TypedDocumentString<
  QueryProviderHealthStatusQuery,
  QueryProviderHealthStatusQueryVariables
>;
export const QueryThumbnailStatsDocument = new TypedDocumentString(`
    query QueryThumbnailStats($startDate: DateTime!, $endDate: DateTime!, $interval: DateInterval!) {
  thumbnailStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
    typeDistribution {
      thumbnailType
      count
    }
    mallDistribution {
      mallName
      count
    }
    missingCount
    totalCount
  }
}
    `) as unknown as TypedDocumentString<
  QueryThumbnailStatsQuery,
  QueryThumbnailStatsQueryVariables
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
export const QueryUsersByAdminDocument = new TypedDocumentString(`
    query QueryUsersByAdmin($limit: Int!, $searchAfter: [String!], $keyword: String) {
  usersByAdmin(limit: $limit, searchAfter: $searchAfter, keyword: $keyword) {
    id
    email
    nickname
    birthYear
    gender
    createdAt
    searchAfter
  }
}
    `) as unknown as TypedDocumentString<QueryUsersByAdminQuery, QueryUsersByAdminQueryVariables>;
export const QueryUserByAdminDocument = new TypedDocumentString(`
    query QueryUserByAdmin($id: Int!) {
  userByAdmin(id: $id) {
    id
    email
    nickname
    birthYear
    gender
    favoriteCategories
    linkedSocialProviders
    createdAt
  }
}
    `) as unknown as TypedDocumentString<QueryUserByAdminQuery, QueryUserByAdminQueryVariables>;
export const QueryUsersTotalCountByAdminDocument = new TypedDocumentString(`
    query QueryUsersTotalCountByAdmin($keyword: String) {
  usersTotalCountByAdmin(keyword: $keyword)
}
    `) as unknown as TypedDocumentString<
  QueryUsersTotalCountByAdminQuery,
  QueryUsersTotalCountByAdminQueryVariables
>;
export const QueryPendingVerificationsDocument = new TypedDocumentString(`
    query QueryPendingVerifications($limit: Int!, $searchAfter: [String!], $prioritizeOld: Boolean, $orderBy: OrderOptionType, $brandProductId: Int, $verificationStatus: [ProductMappingVerificationStatus!], $aiSuggestion: ProductMappingAiSuggestion, $onlyActive: Boolean, $suspiciousFirst: Boolean) {
  pendingVerifications(
    limit: $limit
    searchAfter: $searchAfter
    prioritizeOld: $prioritizeOld
    orderBy: $orderBy
    brandProductId: $brandProductId
    verificationStatus: $verificationStatus
    aiSuggestion: $aiSuggestion
    onlyActive: $onlyActive
    suspiciousFirst: $suspiciousFirst
  ) {
    id
    productId
    brandProduct
    product {
      title
      thumbnail
      price
      url
      provider {
        name
      }
    }
    danawaUrl
    matchingConfidence
    matchingReasoning
    aiSuggestion
    aiSuggestionConfidence
    aiSuggestionReason
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
    query QueryPendingVerificationsTotalCount($brandProductId: Int, $matchStatus: [ProductMappingMatchStatus!], $target: ProductMappingTarget, $verificationStatus: [ProductMappingVerificationStatus!], $aiSuggestion: ProductMappingAiSuggestion, $onlyActive: Boolean) {
  pendingVerificationsTotalCount(
    brandProductId: $brandProductId
    matchStatus: $matchStatus
    target: $target
    verificationStatus: $verificationStatus
    aiSuggestion: $aiSuggestion
    onlyActive: $onlyActive
  )
}
    `) as unknown as TypedDocumentString<
  QueryPendingVerificationsTotalCountQuery,
  QueryPendingVerificationsTotalCountQueryVariables
>;
