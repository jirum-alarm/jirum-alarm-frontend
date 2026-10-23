/* eslint-disable */
import {DocumentTypeDecoration} from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends {[key: string]: unknown}> = {[K in keyof T]: T[K]};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {[key: string]: unknown}, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | {[P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: {input: string; output: string};
  String: {input: string; output: string};
  Boolean: {input: boolean; output: boolean};
  Int: {input: number; output: number};
  Float: {input: number; output: number};
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: {input: any; output: any};
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: {input: any; output: any};
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

export type AdminAccessOutput = {
  __typename?: 'AdminAccessOutput';
  /** admin(시스템) 역할 — 모든 섹션 + 권한 관리 */
  isAdmin: Scalars['Boolean']['output'];
  /** 역할 없으면 null = 아무 섹션도 못 봄 */
  roleName?: Maybe<Scalars['String']['output']>;
  sections: Array<Scalars['String']['output']>;
};

export type AdminRoleOutput = {
  __typename?: 'AdminRoleOutput';
  id: Scalars['Int']['output'];
  isSystem: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sections: Array<Scalars['String']['output']>;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AdminUserRoleOutput = {
  __typename?: 'AdminUserRoleOutput';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  roleId?: Maybe<Scalars['Int']['output']>;
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

export type AffiliateSalesDailyOutput = {
  __typename?: 'AffiliateSalesDailyOutput';
  /** 합계 */
  commissionSum: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  provider: Scalars['String']['output'];
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

export type AttemptsCountOutput = {
  __typename?: 'AttemptsCountOutput';
  attempts: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
};

export type BaseSection = {
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type BlockedTitleKeywordMatchOutput = {
  __typename?: 'BlockedTitleKeywordMatchOutput';
  id: Scalars['Int']['output'];
  postedAt?: Maybe<Scalars['DateTime']['output']>;
  providerId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type BlockedTitleKeywordOutput = {
  __typename?: 'BlockedTitleKeywordOutput';
  createdAt: Scalars['DateTime']['output'];
  /** 추가할 때 숨긴 기존 딜 수 */
  hiddenCount: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  keyword: Scalars['String']['output'];
};

export type BlockedTitleKeywordPreviewOutput = {
  __typename?: 'BlockedTitleKeywordPreviewOutput';
  /** 지금 공개 중이라 추가하면 숨겨질 딜 수 */
  count: Scalars['Int']['output'];
  /** 최근 딜부터 최대 20건 */
  samples: Array<BlockedTitleKeywordMatchOutput>;
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

export type CatalogProductOutput = {
  __typename?: 'CatalogProductOutput';
  /** 다나와 공식 최저가(원). 없으면 이 타입 자체가 안 내려간다. */
  danawaPrice: Scalars['Int']['output'];
  /** brand_product.id */
  id: Scalars['Int']['output'];
  /** Meilisearch 관련도 점수 0~1 */
  rankingScore?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
};

export type CategorizedReactionKeywords = {
  __typename?: 'CategorizedReactionKeywords';
  count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  role: HotDealKeywordGroupRole;
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

export type ConceptMapDealLayer = {
  __typename?: 'ConceptMapDealLayer';
  /** 30일 딜 중 같은 상품 노드에 묶인 것 */
  inNode30d: Scalars['Int']['output'];
  last24h: Scalars['Int']['output'];
  /** 최근 30일 수집 딜 */
  last30d: Scalars['Int']['output'];
};

export type ConceptMapDeliveryLayer = {
  __typename?: 'ConceptMapDeliveryLayer';
  /** 최근 7일 푸시 실패 */
  failed7d: Scalars['Int']['output'];
  /** 최근 7일 푸시 성공 */
  sent7d: Scalars['Int']['output'];
};

export type ConceptMapHubItem = {
  __typename?: 'ConceptMapHubItem';
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type ConceptMapHubLayer = {
  __typename?: 'ConceptMapHubLayer';
  approved: Scalars['Int']['output'];
  /** 공개 허브 중 활성 테마 키워드에 든 것 */
  approvedInTheme: Scalars['Int']['output'];
  candidate: Scalars['Int']['output'];
  /** 테마에 안 든 공개 허브(값 = 구독자, 많은 순) */
  outsideTheme: Array<ConceptMapHubItem>;
  rejected: Scalars['Int']['output'];
  /** 허브 통계 배치 마지막 갱신 */
  statsUpdatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** 공개 허브 구독자 합(배치 값) */
  subscriberSum: Scalars['Int']['output'];
  /** 30일 딜이 적은 공개 허브(값 = 30일 딜) */
  thin: Array<ConceptMapHubItem>;
};

export type ConceptMapModelPageLayer = {
  __typename?: 'ConceptMapModelPageLayer';
  published: Scalars['Int']['output'];
  /** 발행됐는데 30일 넘게 새 딜이 없는 것 */
  publishedStale: Scalars['Int']['output'];
  /** 발행된 것 중 공개 허브에 걸리는 것(모델 페이지 「상위 키워드」 링크와 같은 매칭) */
  publishedWithHub: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ConceptMapNodeLayer = {
  __typename?: 'ConceptMapNodeLayer';
  /** 살아 있는(은퇴·병합 안 된) 노드 */
  active: Scalars['Int']['output'];
};

export type ConceptMapOutput = {
  __typename?: 'ConceptMapOutput';
  deal: ConceptMapDealLayer;
  delivery: ConceptMapDeliveryLayer;
  keywordHub: ConceptMapHubLayer;
  modelPage: ConceptMapModelPageLayer;
  node: ConceptMapNodeLayer;
  theme: ConceptMapThemeLayer;
  watch: ConceptMapWatchLayer;
};

export type ConceptMapTheme = {
  __typename?: 'ConceptMapTheme';
  emoji?: Maybe<Scalars['String']['output']>;
  /** 키워드 중 공개 허브 이름·별칭과 같은 것의 허브 수 */
  hubCount: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  keywordCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  subscribers: Scalars['Int']['output'];
};

export type ConceptMapThemeLayer = {
  __typename?: 'ConceptMapThemeLayer';
  active: Scalars['Int']['output'];
  /** 테마 구독 사람 수(중복 제외) */
  subscribers: Scalars['Int']['output'];
  themes: Array<ConceptMapTheme>;
  total: Scalars['Int']['output'];
};

export type ConceptMapUnhubbedKeyword = {
  __typename?: 'ConceptMapUnhubbedKeyword';
  /** 공개 아닌 허브(후보·탈락)에 걸리면 그 상태 */
  hubStatus?: Maybe<KeywordHubStatus>;
  keyword: Scalars['String']['output'];
  users: Scalars['Int']['output'];
};

export type ConceptMapWatchLayer = {
  __typename?: 'ConceptMapWatchLayer';
  /** 활성 알림 키워드 등록 수 */
  registrations: Scalars['Int']['output'];
  /** 그중 공개 허브 정의(별칭·제외어)를 따르는 것 */
  registrationsOnHub: Scalars['Int']['output'];
  /** 허브 없이 많이 걸린 키워드 */
  unhubbed: Array<ConceptMapUnhubbedKeyword>;
  /** 활성 키워드를 건 사람 */
  users: Scalars['Int']['output'];
  /** 그중 푸시 받을 기기가 있는 사람 */
  usersWithDevice: Scalars['Int']['output'];
};

export type CoupangSearchCtaOutput = {
  __typename?: 'CoupangSearchCtaOutput';
  /** aged = 게시 7일+ 딜(coupang_search_cta_v1) · nolink = 게시 7일 안의 수익 링크 없는 딜(nolink_coupang_cta_v1) — 문구를 고른다 */
  kind: Scalars['String']['output'];
  /** 쿠팡 검색어 */
  query: Scalars['String']['output'];
  /** 쿠팡 파트너스 링크(쿠팡 검색 결과로 간다) */
  url: Scalars['String']['output'];
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

/** 왜 핫딜인지 — 판정·다나와·커뮤니티 근거를 모아 하나를 고른 결과. 상세 가격 아래 블록 하나가 이것만 그린다. */
export type DealEvidence = {
  __typename?: 'DealEvidence';
  /** 근거끼리 엇갈리거나 딜 상태가 바뀌었을 때 한 줄 */
  caveat?: Maybe<Scalars['String']['output']>;
  /** 가격 조건 한 줄 — 카드·쿠폰·적립·배송비·행사기간 */
  condition?: Maybe<Scalars['String']['output']>;
  /** 없으면 블록 자리를 안 잡는다 */
  headline?: Maybe<DealEvidenceItem>;
  /** 정보 표에서 뺄 가이드 행 — 조건 줄로 옮겼거나 제목·쇼핑몰·가격을 그대로 반복하는 행 */
  hiddenGuideIds: Array<Scalars['ID']['output']>;
  /** 헤드라인과 종류가 다른 근거 한 줄 */
  support?: Maybe<Scalars['String']['output']>;
};

/** 근거 한 줄 */
export type DealEvidenceItem = {
  __typename?: 'DealEvidenceItem';
  detail?: Maybe<Scalars['String']['output']>;
  /** title 안에서 강조할 부분(그대로 포함돼 있다) */
  highlight?: Maybe<Scalars['String']['output']>;
  kind: DealEvidenceKind;
  /** STRONG 이면 highlight 를 강조색으로 */
  strength: DealEvidenceStrength;
  title: Scalars['String']['output'];
};

export enum DealEvidenceKind {
  Community = 'COMMUNITY',
  History = 'HISTORY',
  Market = 'MARKET',
}

export enum DealEvidenceStrength {
  Mild = 'MILD',
  Strong = 'STRONG',
}

export type DoubleRowSection = BaseSection & {
  __typename?: 'DoubleRowSection';
  dataSource: ApiQuery;
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

export type EmailDigestBodyOutput = {
  __typename?: 'EmailDigestBodyOutput';
  html?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type EmailDigestOutput = {
  __typename?: 'EmailDigestOutput';
  createdAt: Scalars['DateTime']['output'];
  digestDate: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  itemCount: Scalars['Int']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: EmailDigestStatus;
  subject?: Maybe<Scalars['String']['output']>;
  userId: Scalars['Int']['output'];
};

export enum EmailDigestStatus {
  Approved = 'APPROVED',
  Draft = 'DRAFT',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Rejected = 'REJECTED',
  Sent = 'SENT',
}

/** 커뮤니티 반응 신호 하나(사이트 × 좋아요·댓글·조회·인기글) — 매일 08:05 Mattermost 알림과 같은 계산(engagement-signal-health) */
export type EngagementSignalOutput = {
  __typename?: 'EngagementSignalOutput';
  /** 평소(7~30일 전 수집) 0 아닌 글 비율 0~1 */
  baselineRate: Scalars['Float']['output'];
  /** 꺼짐 — 최근 창이 평소 비율로 기대한 수의 10% 이하이고 우연일 확률 0.1% 미만 */
  dead: Scalars['Boolean']['output'];
  /** 평소 비율로 기대한 0 아닌 글 수 */
  expected: Scalars['Float']['output'];
  /** 좋아요 | 댓글 | 조회 | 인기글 */
  label: Scalars['String']['output'];
  providerName: Scalars['String']['output'];
  /** 그중 값이 0 아닌 글 */
  recentNonzero: Scalars['Int']['output'];
  /** 최근 창(수집된 지 windowToHours~windowFromHours 시간) 글 수 */
  recentPosts: Scalars['Int']['output'];
  /** like | comment | view | hot */
  signal: Scalars['String']['output'];
  windowFromHours: Scalars['Int']['output'];
  windowToHours: Scalars['Int']['output'];
};

export type ExistsUserOutput = {
  __typename?: 'ExistsUserOutput';
  email: Scalars['Boolean']['output'];
  social: Scalars['Boolean']['output'];
};

/** 실험·관찰 등록부 항목(src/experiment/experiment-registry.ts) */
export type ExperimentOutput = {
  __typename?: 'ExperimentOutput';
  /** 다음 판독일 */
  checkAt?: Maybe<Scalars['String']['output']>;
  code: Array<Scalars['String']['output']>;
  decisionRule: Scalars['String']['output'];
  design: Scalars['String']['output'];
  endedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** AB | OBSERVATION */
  kind: Scalars['String']['output'];
  /** 판독일이 지났는데 그날 이후 결과가 없다 */
  overdue: Scalars['Boolean']['output'];
  power: Scalars['String']['output'];
  primaryMetric: Scalars['String']['output'];
  question: Scalars['String']['output'];
  readout: Scalars['String']['output'];
  results: Array<ExperimentResultOutput>;
  startedAt?: Maybe<Scalars['String']['output']>;
  /** PLANNED | RUNNING | CONCLUDED | STOPPED | REJECTED */
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  /** 켜고 끄는 법 */
  toggle: Scalars['String']['output'];
};

/** 실험 판독 기록 한 줄 */
export type ExperimentResultOutput = {
  __typename?: 'ExperimentResultOutput';
  /** KST 날짜 YYYY-MM-DD */
  date: Scalars['String']['output'];
  /** 이 판독으로 정한 것(중간 판독이면 없음) */
  decision?: Maybe<Scalars['String']['output']>;
  /** 숫자 그대로 — 군별 분모·분자, 비율과 95% 구간 */
  summary: Scalars['String']['output'];
};

export type FiringAlertOutput = {
  __typename?: 'FiringAlertOutput';
  /** Prometheus 알람 이름 (예: JirumCronJobLastRunFailed) */
  name: Scalars['String']['output'];
  /** critical | warning */
  severity: Scalars['String']['output'];
  since?: Maybe<Scalars['DateTime']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  /** 대상 — cronjob·deployment·namespace 등 라벨 중 하나 */
  target?: Maybe<Scalars['String']['output']>;
};

/** 웹 상세 첫 방문 시트 문구 A/B(first_visit_sheet_frequency_v1) */
export type FirstVisitSheetCopyOutput = {
  __typename?: 'FirstVisitSheetCopyOutput';
  /** 제목 키워드가 90일에 3번도 안 떠서 상품 브랜드로 넓혔나 */
  broadened: Scalars['Boolean']['output'];
  /** 실험이 켜져 있으면 두 군 다 — 키워드가 지난 windowDays 일 뜬 횟수(같은 날 같은 가격은 한 번). 문구는 frequency 군만 바꾼다 */
  dealCount?: Maybe<Scalars['Int']['output']>;
  /** 시트가 걸 알림 키워드 — 넓히기가 꺼져 있거나 넓힐 필요가 없으면 받은 키워드 그대로 */
  keyword: Scalars['String']['output'];
  /** 키워드 넓히기 A/B(first_visit_keyword_fallback_v1) — 넓힐 수 있던 기기만 군(broaden|title). 그 밖·꺼짐은 null. 배정 기록의 층 표시용 */
  keywordArm?: Maybe<Scalars['String']['output']>;
  /** control(지금 문구) | frequency(「지난 90일에 N번 떴어요」) */
  variant: Scalars['String']['output'];
  windowDays: Scalars['Int']['output'];
};

export type GatedMappingRematchOutput = {
  __typename?: 'GatedMappingRematchOutput';
  productId?: Maybe<Scalars['Int']['output']>;
  /** requeued = 게이트 행 삭제 후 게이트 없이 재매칭 시작(결과는 검수 대기로) / already_mapped = 다른 matched·verified 매핑이 있어 게이트 행만 삭제 / unavailable = matching-api 미설정 */
  status: Scalars['String']['output'];
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

/** 일별 성장 지표 한 칸(business_metric_daily) */
export type GrowthMetricDailyOutput = {
  __typename?: 'GrowthMetricDailyOutput';
  /** KST 날짜 YYYY-MM-DD */
  date: Scalars['String']['output'];
  /** 채널·방 등, 없으면 빈 값 */
  dim: Scalars['String']['output'];
  metric: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type HomePage = {
  __typename?: 'HomePage';
  /** 실험 ID (예: home_hero_v1) */
  experimentId: Scalars['String']['output'];
  sections: Array<BaseSection>;
  /** 배정 변인: control | hotdeal | under10000 | mall */
  variant: Scalars['String']['output'];
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

export enum HotDealKeywordGroupRole {
  DealStatus = 'DEAL_STATUS',
  Quality = 'QUALITY',
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

/** 배지 등급 — 기준은 hot-deal-criteria.ts */
export enum HotDealType {
  /** 핫딜: 커뮤니티에서 반응이 뜨거운 딜 — 원 커뮤니티 인기글이거나 추천·댓글이 많이 달린 글 */
  HotDeal = 'HOT_DEAL',
  /** 대박딜: 평소보다 확실히 싼 딜 — 지난 1년 같은 상품 핫딜 보통가나 다나와 최저가보다 15% 이상 쌈 */
  SuperDeal = 'SUPER_DEAL',
  /** 초대박딜: 1년 중 가장 싼 딜 — 지난 1년 같은 상품 핫딜 중 최저가이면서 보통가보다 15% 이상 쌈 */
  UltraDeal = 'ULTRA_DEAL',
}

export type HotDealTypeCountOutput = {
  __typename?: 'HotDealTypeCountOutput';
  count: Scalars['Int']['output'];
  hotDealType: HotDealType;
};

export type KakaoProfitLinkOutput = {
  __typename?: 'KakaoProfitLinkOutput';
  /** 실패 시 사유. 성공이면 null. */
  error?: Maybe<Scalars['String']['output']>;
  /** 발급된 카카오쇼핑 추천리워드 링크 (clink.kakao.com/sp/…) */
  profitLink?: Maybe<Scalars['String']['output']>;
};

/** 키워드 알림 받는 기준 — ALL 올라오는 즉시 / HOT 핫딜·대박딜이 됐을 때만 */
export enum KeywordAlertLevel {
  All = 'ALL',
  Hot = 'HOT',
}

export type KeywordCountOutput = {
  __typename?: 'KeywordCountOutput';
  count: Scalars['Int']['output'];
  keyword: Scalars['String']['output'];
};

/** 키워드 미리보기 — 지난 90일 딜 횟수(키워드 알림과 같은 매칭)와, 드물면 넓힐 첫 낱말 */
export type KeywordDealFrequencyOutput = {
  __typename?: 'KeywordDealFrequencyOutput';
  /** 지난 windowDays 일 뜬 횟수 — 같은 날 같은 가격(교차 게시)은 한 번 */
  dealCount: Scalars['Int']['output'];
  /** 물어본 키워드(앞뒤 공백·겹친 공백 정리) */
  keyword: Scalars['String']['output'];
  /** 마지막으로 뜬 딜 게시 시각 */
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  /** 이 키워드로 알림이 잡았을 최근 딜(최신순, 알림과 같은 매칭·커뮤니티 풀). 키워드 탭 카드용, 최대 10 */
  recentDeals: Array<ProductOutput>;
  suggestedDealCount?: Maybe<Scalars['Int']['output']>;
  /** 3번 미만이면 넓힐 첫 낱말(대개 브랜드) — 그 낱말이 3~60번일 때만 */
  suggestedKeyword?: Maybe<Scalars['String']['output']>;
  /** 지난 7일 뜬 횟수 — 같은 날 같은 가격(교차 게시)은 한 번 */
  weekDealCount: Scalars['Int']['output'];
  windowDays: Scalars['Int']['output'];
};

/** 키워드 미리보기 — 지난 90일 딜 횟수(키워드 알림과 같은 매칭)와, 드물면 넓힐 첫 낱말 */
export type KeywordDealFrequencyOutputRecentDealsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type KeywordHubAdminDetailOutput = {
  __typename?: 'KeywordHubAdminDetailOutput';
  /** 최근 변경부터(최대 50) */
  changes: Array<KeywordHubChangeOutput>;
  hub: KeywordHubAdminOutput;
};

/** 어드민) 키워드 허브 — 정의·상태·배치 통계 */
export type KeywordHubAdminOutput = {
  __typename?: 'KeywordHubAdminOutput';
  activeDays: Scalars['Int']['output'];
  activeDealCount: Scalars['Int']['output'];
  aliases: Array<Scalars['String']['output']>;
  countCapped: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  excludes: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  /** 마지막 판정·변경 메모 */
  judgeNote: Scalars['String']['output'];
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  recentDealCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  /** seed·subscription(배치 발굴)·manual */
  source: Scalars['String']['output'];
  statsUpdatedAt?: Maybe<Scalars['DateTime']['output']>;
  status: KeywordHubStatus;
  /** 이 키워드(이름·별칭)로 알림을 건 사람 수 */
  subscriberCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum KeywordHubChangeAction {
  Create = 'CREATE',
  Judge = 'JUDGE',
  Revert = 'REVERT',
  Status = 'STATUS',
  Terms = 'TERMS',
}

/** 어드민) 키워드 허브 변경 이력 한 줄 */
export type KeywordHubChangeOutput = {
  __typename?: 'KeywordHubChangeOutput';
  action: KeywordHubChangeAction;
  /** admin:{userId} 또는 판정 잡 태그 */
  actor: Scalars['String']['output'];
  after: KeywordHubSnapshotOutput;
  /** CREATE 는 null */
  before?: Maybe<KeywordHubSnapshotOutput>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  note: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

/** 어드민) 허브 정의를 바꾸면 최근 30일 딜이 어떻게 달라지나 */
export type KeywordHubChangePreviewOutput = {
  __typename?: 'KeywordHubChangePreviewOutput';
  after: KeywordHubDefinitionCountOutput;
  /** 지금 정의(새 허브면 null) */
  before?: Maybe<KeywordHubDefinitionCountOutput>;
  /** 이름·별칭이 겹치는 다른 허브 */
  clashSlug?: Maybe<Scalars['String']['output']>;
  countCapped: Scalars['Boolean']['output'];
  /** 새로 들어오는 제목(새 허브면 빈 배열) */
  gained: Array<KeywordHubDiffTitleOutput>;
  gainedDealCount: Scalars['Int']['output'];
  /** 바꿀 정의로 남는 제목 */
  kept: Array<KeywordHubDiffTitleOutput>;
  /** 빠지는 제목 */
  lost: Array<KeywordHubDiffTitleOutput>;
  lostDealCount: Scalars['Int']['output'];
  /** 저장이 거부될 사유 */
  problem?: Maybe<Scalars['String']['output']>;
  /** 알림이 이 정의를 따르는 사람 수 — 빠지는 딜은 이들에게도 안 간다 */
  subscriberCount: Scalars['Int']['output'];
};

export type KeywordHubDefinitionCountOutput = {
  __typename?: 'KeywordHubDefinitionCountOutput';
  activeDays: Scalars['Int']['output'];
  recentDealCount: Scalars['Int']['output'];
};

export type KeywordHubDetailOutput = {
  __typename?: 'KeywordHubDetailOutput';
  /** 최근 30일 딜(진행 중 먼저, 최대 40) */
  deals: Array<ProductOutput>;
  /** 통계는 아래 deals 와 같은 묶음에서 센 값 */
  hub: KeywordHubOutput;
  /** 이 키워드의 모델별 모음(/deals/{slug}) */
  modelPages: Array<KeywordHubModelPageOutput>;
};

export type KeywordHubDiffTitleOutput = {
  __typename?: 'KeywordHubDiffTitleOutput';
  /** 같은 제목(공백·대소문자 무시) 딜 수 */
  count: Scalars['Int']['output'];
  /** 빠지는 쪽 정의에서 이 제목을 지운 제외어 */
  exclude?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type KeywordHubModelPageOutput = {
  __typename?: 'KeywordHubModelPageOutput';
  brand?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  modelName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

/** 키워드 허브(웹 /keywords/{slug}) — "삼다수 핫딜" 같은 검색어 그대로의 모음 */
export type KeywordHubOutput = {
  __typename?: 'KeywordHubOutput';
  /** 최근 30일 중 딜이 올라온 날 수(KST) */
  activeDays: Scalars['Int']['output'];
  /** recentDealCount 중 진행 중 */
  activeDealCount: Scalars['Int']['output'];
  /** 제목에 이게 있어도 같은 상품(표기 흔들림) */
  aliases: Array<Scalars['String']['output']>;
  /** 수집 상한에 걸려 실제보다 적게 셌다 — "N건+" 로 표시 */
  countCapped: Scalars['Boolean']['output'];
  /** 제목에 이게 있으면 뺀다(부분 문자열 오탐) */
  excludes: Array<Scalars['String']['output']>;
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  /** 화면·제목용 이름 */
  name: Scalars['String']['output'];
  /** 최근 30일 올라온 딜 수(종료 포함) */
  recentDealCount: Scalars['Int']['output'];
  /** URL 세그먼트. 소문자·공백 없음 */
  slug: Scalars['String']['output'];
  /** 이 키워드로 알림을 건 사람 수 */
  subscriberCount: Scalars['Int']['output'];
  /** 많이 올라온 곳 최대 2곳(몫 15%+) */
  topSources: Array<KeywordHubSourceOutput>;
};

export type KeywordHubSnapshotOutput = {
  __typename?: 'KeywordHubSnapshotOutput';
  aliases: Array<Scalars['String']['output']>;
  /** 그 정의로 센 30일 딜 수 */
  dealCount?: Maybe<Scalars['Int']['output']>;
  excludes: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: KeywordHubStatus;
};

export type KeywordHubSourceOutput = {
  __typename?: 'KeywordHubSourceOutput';
  name: Scalars['String']['output'];
  /** % */
  share: Scalars['Int']['output'];
};

export enum KeywordHubStatus {
  Approved = 'APPROVED',
  Candidate = 'CANDIDATE',
  Rejected = 'REJECTED',
}

export enum KeywordProductOrderType {
  PostedAt = 'POSTED_AT',
}

export type LayoutTab = {
  __typename?: 'LayoutTab';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  variables?: Maybe<Scalars['JSONObject']['output']>;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
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

export type LiveAlternativeDealOutput = {
  __typename?: 'LiveAlternativeDealOutput';
  /** same=같은 상품(다른 곳·다른 값), related=같은 라인(용량·구성·색이 다름) */
  kind: Scalars['String']['output'];
  /** 이 딜 값 − 지금 보는 딜 값(원). 같은 상품이고 둘 다 원화일 때만, 아니면 null */
  priceDiff?: Maybe<Scalars['Int']['output']>;
  product: ProductOutput;
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

export type MappingCoverageOutput = {
  __typename?: 'MappingCoverageOutput';
  /** 그중 매핑이 하나라도 생긴 딜 */
  mapped: Scalars['Int']['output'];
  /** 판정 창(수집 48~72h 전)·게이트 카테고리의 딜 수 */
  products: Scalars['Int']['output'];
  /** ok | low(60% 미만 — 파이프라인 정지 의심) | too_few(50건 미만, 판정 생략). 감시 배치와 같은 판정 */
  verdict: Scalars['String']['output'];
  /** 그중 사용자에게 보이는(verified) 매핑이 있는 딜 */
  verified: Scalars['Int']['output'];
  windowFromHours: Scalars['Int']['output'];
  windowToHours: Scalars['Int']['output'];
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

export type McpAuthorizationRequestOutput = {
  __typename?: 'McpAuthorizationRequestOutput';
  /** 연결하려는 AI 비서 이름(클라이언트가 등록 때 보낸 값 — 꾸밀 수 있다) */
  clientName: Scalars['String']['output'];
  /** 승인 뒤 돌아갈 주소의 호스트 — 동의 화면이 «어디로 보내는지» 보여 준다 */
  redirectHost: Scalars['String']['output'];
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
  activeDealCount: Scalars['Int']['output'];
  activePostedAt?: Maybe<Scalars['DateTime']['output']>;
  activePrice?: Maybe<Scalars['Int']['output']>;
  brand?: Maybe<Scalars['String']['output']>;
  buyLine?: Maybe<Scalars['Int']['output']>;
  buyLineUnitLabel?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['Int']['output']>;
  categoryName?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  heroImage?: Maybe<Scalars['String']['output']>;
  heroMinPrice?: Maybe<Scalars['Int']['output']>;
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  modelName: Scalars['String']['output'];
  priceTone?: Maybe<Scalars['String']['output']>;
  savePct?: Maybe<Scalars['Int']['output']>;
  slug: Scalars['String']['output'];
  trendPrices: Array<Scalars['Float']['output']>;
  unitLabel?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Int']['output']>;
};

export type ModelPageOutput = {
  __typename?: 'ModelPageOutput';
  brand?: Maybe<Scalars['String']['output']>;
  dealCount: Scalars['Int']['output'];
  id?: Maybe<Scalars['Int']['output']>;
  isPublished?: Maybe<Scalars['Boolean']['output']>;
  /** 이 모델 페이지가 속한 공개 키워드 허브(걸리는 것 중 가장 좁은 것). 없으면 null */
  keywordHub?: Maybe<KeywordHubOutput>;
  lastDealAt?: Maybe<Scalars['DateTime']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  modelName: Scalars['String']['output'];
  payload?: Maybe<Scalars['JSONObject']['output']>;
  priceVerdict?: Maybe<ModelPagePriceVerdictOutput>;
  recentDeals?: Maybe<Array<ModelPageRecentDealOutput>>;
  slug: Scalars['String']['output'];
};

export type ModelPagePriceVerdictOutput = {
  __typename?: 'ModelPagePriceVerdictOutput';
  activeDealCount: Scalars['Int']['output'];
  activePrice?: Maybe<Scalars['Int']['output']>;
  activeProductIds: Array<Scalars['Int']['output']>;
  avgPrice?: Maybe<Scalars['Float']['output']>;
  basisUnitLabel?: Maybe<Scalars['String']['output']>;
  bestPackLabel?: Maybe<Scalars['String']['output']>;
  bestProductId?: Maybe<Scalars['Int']['output']>;
  bundleProductIds: Array<Scalars['Int']['output']>;
  buyLine?: Maybe<Scalars['Float']['output']>;
  comparePrice?: Maybe<Scalars['Float']['output']>;
  historyPoints: Scalars['Int']['output'];
  mallPrice?: Maybe<Scalars['Int']['output']>;
  pendingReason?: Maybe<Scalars['String']['output']>;
  savePct?: Maybe<Scalars['Int']['output']>;
  tone?: Maybe<Scalars['String']['output']>;
};

export type ModelPageRecentDealOutput = {
  __typename?: 'ModelPageRecentDealOutput';
  isEnd: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  mallName?: Maybe<Scalars['String']['output']>;
  postedAt: Scalars['DateTime']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  priceCurrency?: Maybe<Scalars['String']['output']>;
  productId: Scalars['Int']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** 어드민) 상품명 차단 — 걸리는 기존 딜을 비공개로 돌리고, 앞으로 수집하지 않는다 */
  addBlockedTitleKeywordByAdmin: BlockedTitleKeywordOutput;
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
  /** 사용자 신고 */
  addUserReport: Scalars['Boolean']['output'];
  /** 「이 가격 오면 알려줘」(허용 유저만) — 판정을 서버에서 다시 내 그 키워드 알림을 건다. 좋은 가격을 말할 수 있으면 하락만 받기 + 단위 기준가 */
  addWaitWatch: WaitWatchOutput;
  /** 상세 카드 「이 가격 오면 알려줘」 — 서버가 카드를 다시 꺼내 그 키워드를 좋은 가격 이하만 받게 건다(카드 군 기기만, 게스트 가능) */
  addWaitWatchForProduct: WaitWatchOutput;
  /** wishlist 추가 */
  addWishlist: Scalars['Boolean']['output'];
  /** 어드민) 로그인 */
  adminLogin: TokenOutput;
  /** 내 키워드를 「좋은 가격만 받기」로 — 하락만 받기 + 단위 기준가(서버가 판정). 사용자 제외어는 그대로 */
  applyGoodPriceOnly: WaitWatchOutput;
  /** 어드민) 리액션 키워드 후보 승인 (synonym 으로 등록) */
  approveHotDealKeywordCandidateByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 계정에 역할 지정(null = 해제) */
  assignAdminRole: Scalars['Boolean']['output'];
  /** 여러 매핑을 한 번에 검증 수행 */
  batchVerifyProductMapping: Scalars['Int']['output'];
  /** 검증 취소 (검증 완료/거부된 항목을 다시 대기 상태로 되돌림) */
  cancelVerification: Scalars['Boolean']['output'];
  /** 상세 가격 맥락(판정 카드·가격 추이) 클릭 기록 */
  collectPriceContextClick: Scalars['Boolean']['output'];
  /** 상세 가격 맥락(판정 카드·가격 추이) 노출 기록 — 상세 진입당 종류별 1회 */
  collectPriceContextImpression: Scalars['Boolean']['output'];
  /** 상품 단건 수집 */
  collectProduct: Scalars['Boolean']['output'];
  /** 구매(수익링크) 버튼 클릭 기록 — source 에 화면(예: detail_mobile) */
  collectPurchaseClick: Scalars['Boolean']['output'];
  /** 어드민) 썸네일 단건 수집 */
  collectThumbnail: Scalars['Boolean']['output'];
  /** 어드민) 광고 생성 (생성된 id 반환) */
  createAd: Scalars['Int']['output'];
  /** 어드민) 광고 에셋 업로드 presigned URL */
  createAdAssetUploadUrl: AdAssetUploadUrlOutput;
  /** 어드민) 역할 생성 */
  createAdminRole: AdminRoleOutput;
  /** 어드민) 키워드 허브 등록(후보로) */
  createKeywordHubByAdmin: KeywordHubAdminOutput;
  /** 어드민) 새 테마 — 꺼진 채로 만든다 */
  createNotificationThemeByAdmin: NotificationThemeAdminOutput;
  /** 유저 등록 상품 썸네일 업로드용 presigned URL 발급 */
  createProductImageUploadUrl: ProductImageUploadUrlOutput;
  /** 유저가 직접 핫딜 상품 등록 (등록된 productId 반환) */
  createUserProduct: Scalars['Int']['output'];
  /** AI 비서 연결 허용·거절 → 돌아갈 주소(웹이 그리로 보낸다). 요청이 없거나 만료면 null */
  decideMcpAuthorization?: Maybe<Scalars['String']['output']>;
  /** 어드민) 역할 삭제 — 소속 계정은 역할 없음이 된다 */
  deleteAdminRole: Scalars['Boolean']['output'];
  /** 게스트 로그인 — 로그인 없이 키워드 알림을 받는 기기 계정(x-device-id 필수). 실제 로그인하면 그 계정으로 합쳐진다 */
  guestLogin: TokenOutput;
  /** 어드민) 상품 hard delete */
  hardDeleteProductByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 카카오쇼핑 상품 URL 로 링크 발급(product 에는 쓰지 않음) */
  issueKakaoProfitLink: KakaoProfitLinkOutput;
  /** 어드민) 오늘의집 상품 URL 로 링크 발급(product 에는 쓰지 않음) */
  issueOhouProfitLink: OhouProfitLinkOutput;
  /** 어드민) 토스 상품 URL 로 링크 발급(product 에는 쓰지 않음) */
  issueTossProfitLink: TossProfitLinkOutput;
  /** 로그인 */
  login: TokenOutput;
  /** 리프레시 토큰으로 로그인 */
  loginByRefreshToken: TokenOutput;
  /** 로그아웃 */
  logout: Scalars['Boolean']['output'];
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
  /** 게이트 차단 매핑 오판 → 게이트 행 삭제 후 재매칭 (결과는 검수 대기로) */
  rematchGatedMapping: GatedMappingRematchOutput;
  /** 모든 알림 삭제 */
  removeAllNotifications: Scalars['Boolean']['output'];
  /** 어드민) 차단 해제 — 앞으로 다시 수집한다. 이미 숨긴 딜은 그대로 둔다 */
  removeBlockedTitleKeywordByAdmin: Scalars['Boolean']['output'];
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
  /** 어드민) 사람의 판정을 거둔다 */
  removeProductPairVerdictByAdmin: Scalars['Boolean']['output'];
  /** 토큰에 연결된 `userId` 연결 해제 */
  removeTokenLinkage: Scalars['Boolean']['output'];
  /** wishlist 제거 */
  removeWishlist: Scalars['Boolean']['output'];
  /** 종료된 상품 제보 */
  reportExpiredProduct: Scalars['Boolean']['output'];
  /** 어드민) 키워드 허브 변경 하나를 그 전 정의·상태로 되돌림 */
  revertKeywordHubChangeByAdmin: KeywordHubAdminOutput;
  /** 어드민) 이메일 요약 초안 승인·반려 (바뀐 수) */
  reviewEmailDigestsByAdmin: Scalars['Int']['output'];
  /** 어드민) 알림 발송 */
  sendNotificationByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 광고 on/off (킬스위치) */
  setAdActive: Scalars['Boolean']['output'];
  /** 어드민) 카카오쇼핑 세션 갱신 */
  setKakaoSession: Scalars['Boolean']['output'];
  /** 어드민) 키워드 허브 공개·후보·탈락 */
  setKeywordHubStatusByAdmin: KeywordHubAdminOutput;
  /** 어드민) 모델 페이지 발행 토글 */
  setModelPagePublishedByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 네이버 세션 갱신 */
  setNaverBcSession: Scalars['Boolean']['output'];
  /** 어드민) 테마 켜기·끄기 */
  setNotificationThemeActiveByAdmin: NotificationThemeAdminOutput;
  /** 어드민) 오늘의집 세션 갱신 */
  setOhouSession: Scalars['Boolean']['output'];
  /** 대표 매핑 지정 (id 기준) */
  setPrimaryProductMapping: Scalars['Boolean']['output'];
  /** 어드민) 두 딜이 같은 상품인지 정한다 — 다음 묶음 배치가 떼거나 잇는다 */
  setProductPairVerdictByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 세시간전 세션 갱신 */
  setThreeHaSession: Scalars['Boolean']['output'];
  /** 어드민) 토스 세션 갱신 */
  setTossSession: Scalars['Boolean']['output'];
  /** 회원가입 */
  signup: SignupOutput;
  /** 소셜 로그인 */
  socialLogin: SocialLoginOutput;
  /** 알림 묶음(테마) 구독 — 키워드 시점 매칭, 멱등 */
  subscribeNotificationTheme: Scalars['Boolean']['output'];
  /** 토스 미니앱 게스트 로그인 — 토스 사용자 식별키(anonKey)로 키워드 알림용 게스트 세션을 받는다 */
  tossGuestLogin: TokenOutput;
  /** 알림 묶음(테마) 구독 해지 */
  unsubscribeNotificationTheme: Scalars['Boolean']['output'];
  /** 어드민) 광고 수정 */
  updateAd: Scalars['Boolean']['output'];
  /** 어드민) 역할 이름·섹션 수정 */
  updateAdminRole: AdminRoleOutput;
  updateComment: Scalars['Boolean']['output'];
  /** 어드민) 핫딜 키워드 수정 */
  updateHotDealKeywordByAdmin: Scalars['Boolean']['output'];
  /** 어드민) 키워드 허브 이름·별칭·제외어 수정 — 알림·테마도 다음 딜부터 따른다 */
  updateKeywordHubByAdmin: KeywordHubAdminOutput;
  /** 이 키워드 알림에서 제외할 단어 설정 (전체 교체, 빈 배열 = 해제) */
  updateNotificationKeywordExcludeKeywords: Scalars['Boolean']['output'];
  /** 이 키워드는 등록 시점보다 가격이 내려간 딜만 알림 받기 */
  updateNotificationKeywordPriceDropOnly: Scalars['Boolean']['output'];
  /** 이 키워드는 지정한 가격 범위 안의 딜만 알림 받기 (null = 그 방향 해제) */
  updateNotificationKeywordPriceRange: Scalars['Boolean']['output'];
  /** 알림 키워드 상태 수정 */
  updateNotificationKeywordStatus: Scalars['Boolean']['output'];
  /** 어드민) 테마 이름·설명·이모지·키워드(목록 통째)·제외 단어 바꾸기 */
  updateNotificationThemeByAdmin: NotificationThemeAdminOutput;
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

export type MutationAddBlockedTitleKeywordByAdminArgs = {
  keyword: Scalars['String']['input'];
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

export type MutationAddNotificationKeywordArgs = {
  excludeKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  fromRecommendation?: InputMaybe<Scalars['Boolean']['input']>;
  keyword: Scalars['String']['input'];
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  priceDropOnly?: InputMaybe<Scalars['Boolean']['input']>;
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

export type MutationAddWaitWatchArgs = {
  text: Scalars['String']['input'];
};

export type MutationAddWaitWatchForProductArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationAddWishlistArgs = {
  productId: Scalars['Int']['input'];
};

export type MutationAdminLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationApplyGoodPriceOnlyArgs = {
  keyword: Scalars['String']['input'];
};

export type MutationApproveHotDealKeywordCandidateByAdminArgs = {
  hotDealKeywordId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
};

export type MutationAssignAdminRoleArgs = {
  adminUserId: Scalars['Int']['input'];
  roleId?: InputMaybe<Scalars['Int']['input']>;
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

export type MutationCollectPriceContextClickArgs = {
  detail: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCollectPriceContextImpressionArgs = {
  detail: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCollectProductArgs = {
  entry?: InputMaybe<Scalars['String']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCollectPurchaseClickArgs = {
  entry?: InputMaybe<Scalars['String']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCollectThumbnailArgs = {
  entry?: InputMaybe<Scalars['String']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
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

export type MutationCreateAdminRoleArgs = {
  name: Scalars['String']['input'];
  sections: Array<Scalars['String']['input']>;
};

export type MutationCreateKeywordHubByAdminArgs = {
  aliases: Array<Scalars['String']['input']>;
  excludes: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  note: Scalars['String']['input'];
};

export type MutationCreateNotificationThemeByAdminArgs = {
  description: Scalars['String']['input'];
  emoji?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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

export type MutationDecideMcpAuthorizationArgs = {
  approve: Scalars['Boolean']['input'];
  requestId: Scalars['String']['input'];
};

export type MutationDeleteAdminRoleArgs = {
  id: Scalars['Int']['input'];
};

export type MutationHardDeleteProductByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type MutationIssueKakaoProfitLinkArgs = {
  url: Scalars['String']['input'];
};

export type MutationIssueOhouProfitLinkArgs = {
  url: Scalars['String']['input'];
};

export type MutationIssueTossProfitLinkArgs = {
  url: Scalars['String']['input'];
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
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

export type MutationRematchGatedMappingArgs = {
  productMappingId: Scalars['Int']['input'];
};

export type MutationRemoveBlockedTitleKeywordByAdminArgs = {
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

export type MutationRemoveProductPairVerdictByAdminArgs = {
  dealId: Scalars['Int']['input'];
  seedId: Scalars['Int']['input'];
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

export type MutationRevertKeywordHubChangeByAdminArgs = {
  changeId: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};

export type MutationReviewEmailDigestsByAdminArgs = {
  approve: Scalars['Boolean']['input'];
  ids: Array<Scalars['Int']['input']>;
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

export type MutationSetKakaoSessionArgs = {
  curl: Scalars['String']['input'];
};

export type MutationSetKeywordHubStatusByAdminArgs = {
  note: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  status: KeywordHubStatus;
};

export type MutationSetModelPagePublishedByAdminArgs = {
  id: Scalars['Int']['input'];
  isPublished: Scalars['Boolean']['input'];
};

export type MutationSetNaverBcSessionArgs = {
  cookie: Scalars['String']['input'];
};

export type MutationSetNotificationThemeActiveByAdminArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationSetOhouSessionArgs = {
  curl: Scalars['String']['input'];
};

export type MutationSetPrimaryProductMappingArgs = {
  productMappingId: Scalars['Int']['input'];
};

export type MutationSetProductPairVerdictByAdminArgs = {
  dealId: Scalars['Int']['input'];
  note: Scalars['String']['input'];
  same: Scalars['Boolean']['input'];
  seedId: Scalars['Int']['input'];
};

export type MutationSetThreeHaSessionArgs = {
  cookie: Scalars['String']['input'];
};

export type MutationSetTossSessionArgs = {
  token: Scalars['String']['input'];
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
  authorizationCode?: InputMaybe<Scalars['String']['input']>;
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

export type MutationTossGuestLoginArgs = {
  anonKey: Scalars['String']['input'];
};

export type MutationUnsubscribeNotificationThemeArgs = {
  themeId: Scalars['Int']['input'];
};

export type MutationUpdateAdArgs = {
  id: Scalars['Int']['input'];
  input: UpdateAdvertiseInput;
};

export type MutationUpdateAdminRoleArgs = {
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  sections: Array<Scalars['String']['input']>;
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

export type MutationUpdateKeywordHubByAdminArgs = {
  aliases: Array<Scalars['String']['input']>;
  excludes: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  note: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};

export type MutationUpdateNotificationKeywordExcludeKeywordsArgs = {
  excludeKeywords: Array<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type MutationUpdateNotificationKeywordPriceDropOnlyArgs = {
  id: Scalars['Int']['input'];
  priceDropOnly: Scalars['Boolean']['input'];
};

export type MutationUpdateNotificationKeywordPriceRangeArgs = {
  id: Scalars['Int']['input'];
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationUpdateNotificationKeywordStatusArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationUpdateNotificationThemeByAdminArgs = {
  description: Scalars['String']['input'];
  emoji?: InputMaybe<Scalars['String']['input']>;
  excludeKeywords: Array<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type MutationUpdatePasswordArgs = {
  password: Scalars['String']['input'];
};

export type MutationUpdatePushSettingArgs = {
  communityAlert?: InputMaybe<Scalars['Boolean']['input']>;
  emailDigest?: InputMaybe<Scalars['Boolean']['input']>;
  hotDealAlert?: InputMaybe<Scalars['Boolean']['input']>;
  info?: InputMaybe<Scalars['Boolean']['input']>;
  keywordAlert?: InputMaybe<Scalars['Boolean']['input']>;
  keywordAlertLevel?: InputMaybe<KeywordAlertLevel>;
  marketing?: InputMaybe<Scalars['Boolean']['input']>;
  nightAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['Int']['input']>;
  quietHoursStart?: InputMaybe<Scalars['Int']['input']>;
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
  /** 알림 종류. 2026-10-14 이전 알림엔 없다(그땐 제목으로 구분) */
  kind?: Maybe<NotificationKind>;
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

/** 키워드 후보와 지난 30일 건수 */
export type NotificationIntentCandidate = {
  __typename?: 'NotificationIntentCandidate';
  keyword: Scalars['String']['output'];
  recentMatchCount: Scalars['Int']['output'];
};

/** 문장을 해석한 키워드 알림 조건 + 지난 30일 미리보기 */
export type NotificationIntentOutput = {
  __typename?: 'NotificationIntentOutput';
  /** 키워드 후보 전부(구체적인 것부터) — keyword 는 그중 지난 30일에 걸린 가장 구체적인 것 */
  candidates: Array<NotificationIntentCandidate>;
  excludeKeywords: Array<Scalars['String']['output']>;
  keyword: Scalars['String']['output'];
  maxPrice?: Maybe<Scalars['Int']['output']>;
  minPrice?: Maybe<Scalars['Int']['output']>;
  /** 지난 30일 이 조건이면 왔을 알림 수(대략 — 하락 전용·하루 상한은 빼고 셈) */
  recentMatchCount: Scalars['Int']['output'];
  /** 그중 최신 3건 */
  recentSamples: Array<NotificationIntentSample>;
};

/** 알림 미리보기용 지난 딜 */
export type NotificationIntentSample = {
  __typename?: 'NotificationIntentSample';
  id: Scalars['Int']['output'];
  /** 원화 가격. 외화·미파싱은 null */
  price?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
};

export type NotificationKeyword = {
  __typename?: 'NotificationKeyword';
  baseUnitPrice?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  excludeKeywords?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  keyword: Scalars['String']['output'];
  maxPrice?: Maybe<Scalars['Int']['output']>;
  minPrice?: Maybe<Scalars['Int']['output']>;
  priceDropOnly: Scalars['Boolean']['output'];
  priceUnit?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['Int']['output'];
};

/** 알림 종류 */
export enum NotificationKind {
  Community = 'COMMUNITY',
  GoodDeal = 'GOOD_DEAL',
  Keyword = 'KEYWORD',
  KeywordConfirm = 'KEYWORD_CONFIRM',
  KeywordHot = 'KEYWORD_HOT',
  KeywordPriceDrop = 'KEYWORD_PRICE_DROP',
  Theme = 'THEME',
}

export enum NotificationTarget {
  Comment = 'COMMENT',
  Info = 'INFO',
  Notice = 'NOTICE',
  Product = 'PRODUCT',
}

/** 어드민) 알림 테마 — 정의·구독·30일 받았을 알림 */
export type NotificationThemeAdminOutput = {
  __typename?: 'NotificationThemeAdminOutput';
  /** 지금 규칙으로 최근 30일 받았을 알림(하루 3건 상한). 꺼진 테마도 켜면 받을 수로 센다 */
  alerts30d: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  emoji?: Maybe<Scalars['String']['output']>;
  excludeKeywords: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  /** 등록 순 */
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  subscriberCount: Scalars['Int']['output'];
};

export type NotificationThemeKeywordHit = {
  __typename?: 'NotificationThemeKeywordHit';
  /** 30일 동안 이 키워드로 고른 딜(하루 상한 전) */
  deals: Scalars['Int']['output'];
  keyword: Scalars['String']['output'];
  /** 공개 키워드 허브 정의(별칭·제외어)를 따른다 */
  viaHub: Scalars['Boolean']['output'];
};

export type NotificationThemePreviewDeal = {
  __typename?: 'NotificationThemePreviewDeal';
  id: Scalars['Int']['output'];
  /** 걸린 키워드 */
  keyword: Scalars['String']['output'];
  postedAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

/** 어드민) 테마 규칙을 바꾸면 최근 30일 받았을 알림이 어떻게 달라지나(저장 안 함) */
export type NotificationThemePreviewOutput = {
  __typename?: 'NotificationThemePreviewOutput';
  currentPicked: Scalars['Int']['output'];
  entering: Array<NotificationThemePreviewDeal>;
  keywordHits: Array<NotificationThemeKeywordHit>;
  leaving: Array<NotificationThemePreviewDeal>;
  /** 하루 상한 전 걸린 딜 */
  nextMatched: Scalars['Int']['output'];
  nextPicked: Scalars['Int']['output'];
};

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

export type OhouProfitLinkOutput = {
  __typename?: 'OhouProfitLinkOutput';
  /** 실패 시 사유. 성공이면 null. */
  error?: Maybe<Scalars['String']['output']>;
  /** 발급된 오늘의집 큐레이터 링크 (ozip.me/…?af) */
  profitLink?: Maybe<Scalars['String']['output']>;
};

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
  basePriceAt?: Maybe<Scalars['String']['output']>;
  danawaPrice: Scalars['Float']['output'];
  danawaProductName?: Maybe<Scalars['String']['output']>;
  danawaTodayPrice?: Maybe<Scalars['Float']['output']>;
  dealPrice: Scalars['Float']['output'];
  dealShippingFee?: Maybe<Scalars['Float']['output']>;
  delta: Scalars['Float']['output'];
  normalPriceMax?: Maybe<Scalars['Float']['output']>;
  normalPriceMedian?: Maybe<Scalars['Float']['output']>;
  normalPriceMin?: Maybe<Scalars['Float']['output']>;
  shippingIncluded?: Maybe<Scalars['Boolean']['output']>;
  usualPriceApplied?: Maybe<Scalars['Boolean']['output']>;
  verificationStatus?: Maybe<Scalars['String']['output']>;
};

export enum PriceHistoryBasis {
  Cluster = 'CLUSTER',
  Mapping = 'MAPPING',
  Self = 'SELF',
  Similar = 'SIMILAR',
}

export enum PriceHistoryConfidence {
  High = 'HIGH',
  Low = 'LOW',
}

/** 가격 추이 점의 대표/동시 딜 정보 (호버용) */
export type PriceHistoryDeal = {
  __typename?: 'PriceHistoryDeal';
  categoryId?: Maybe<Scalars['Int']['output']>;
  displayTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  /** 현재 상세 seed 딜이면 true */
  isSeed: Scalars['Boolean']['output'];
  parsedPrice: Scalars['Float']['output'];
  postedAt: Scalars['DateTime']['output'];
  price?: Maybe<Scalars['String']['output']>;
  priceCurrency?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['Int']['output'];
  providerName?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

/** 날짜별 핫딜가 1점 (+ 그날 딜들) */
export type PriceHistoryPoint = {
  __typename?: 'PriceHistoryPoint';
  /** KST YYYY-MM-DD */
  date: Scalars['String']['output'];
  /** 대표 딜(최저가) */
  deal: PriceHistoryDeal;
  /** 같은 날 다른 딜(최대 N) */
  deals: Array<PriceHistoryDeal>;
  /** 그날 대표가(최저) */
  price: Scalars['Float']['output'];
};

export type PriceRangeCountOutput = {
  __typename?: 'PriceRangeCountOutput';
  count: Scalars['Int']['output'];
  maxPrice: Scalars['Float']['output'];
  minPrice: Scalars['Float']['output'];
  /** 가격 구간 라벨 (예: 1만~3만) */
  priceRange: Scalars['String']['output'];
};

export enum PriceSavingBasis {
  Coupang = 'COUPANG',
  Danawa = 'DANAWA',
  Usual = 'USUAL',
}

export enum PriceVerdictDisplayTier {
  Hidden = 'HIDDEN',
  Neutral = 'NEUTRAL',
  Strong = 'STRONG',
}

export enum PriceVerdictLabelKey {
  AboveTypical = 'ABOVE_TYPICAL',
  BelowTypical = 'BELOW_TYPICAL',
  NearHigh = 'NEAR_HIGH',
  NearLowest = 'NEAR_LOWEST',
  Typical = 'TYPICAL',
}

export enum PriceVerdictNullReason {
  BasisNotAllowed = 'BASIS_NOT_ALLOWED',
  CurrencyMismatch = 'CURRENCY_MISMATCH',
  InconsistentPrice = 'INCONSISTENT_PRICE',
  LowConfidence = 'LOW_CONFIDENCE',
  NoHistory = 'NO_HISTORY',
  NoMapping = 'NO_MAPPING',
  PrivateOrMissingSeed = 'PRIVATE_OR_MISSING_SEED',
  SeedPriceMissing = 'SEED_PRICE_MISSING',
  TooFewPoints = 'TOO_FEW_POINTS',
  UnitAxis = 'UNIT_AXIS',
}

export enum PriceVerdictStatus {
  Ready = 'READY',
  Unavailable = 'UNAVAILABLE',
}

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

/** 어드민) 같은 상품 묶음(동일상품 그룹) — 멤버와 사람의 판정 */
export type ProductNodeAdminOutput = {
  __typename?: 'ProductNodeAdminOutput';
  /** 묶음 id(N…). 묶음에 없으면 null */
  clusterId?: Maybe<Scalars['String']['output']>;
  /** 이 딜이 한쪽인 사람의 판정 */
  decisions: Array<ProductPairDecisionOutput>;
  memberCount: Scalars['Int']['output'];
  /** 최근 글부터(최대 300) */
  members: Array<ProductNodeDealOutput>;
  product?: Maybe<ProductNodeDealOutput>;
};

export type ProductNodeDealOutput = {
  __typename?: 'ProductNodeDealOutput';
  id: Scalars['Int']['output'];
  isEnd: Scalars['Boolean']['output'];
  postedAt: Scalars['DateTime']['output'];
  price?: Maybe<Scalars['String']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export enum ProductOrderType {
  CommentCount = 'COMMENT_COUNT',
  CommunityRanking = 'COMMUNITY_RANKING',
  ExpiringSoon = 'EXPIRING_SOON',
  Id = 'ID',
  PostedAt = 'POSTED_AT',
  Reaction = 'REACTION',
  Relevance = 'RELEVANCE',
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
  /** 소스별 확장 정보(toss 등) */
  data?: Maybe<Scalars['JSONObject']['output']>;
  /** 왜 핫딜인지 — 근거 하나 + 다른 종류 한 줄 + 엇갈림 단서 + 가격 조건(상세 전용) */
  dealEvidence?: Maybe<DealEvidence>;
  detailUrl?: Maybe<Scalars['String']['output']>;
  dislikeCount: Scalars['Int']['output'];
  distributionDate?: Maybe<Scalars['DateTime']['output']>;
  earliestExpiryDate?: Maybe<Scalars['DateTime']['output']>;
  /** 검색 결과 총량 추정(Meilisearch estimatedTotalHits, 5000 캡). keyword 검색에서만 채워지며 searchAfter처럼 모든 행에 동일 값 주입. */
  estimatedTotal?: Maybe<Scalars['Int']['output']>;
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
  /** 급상승 — 커뮤니티 랭킹 목록(홈 지름 랭킹·랭킹 탭)에서 최근 2시간 동안 붙은 댓글·추천이 큰 딜(목록당 최대 5개). 다른 목록에선 비어 있다. */
  isRising?: Maybe<Scalars['Boolean']['output']>;
  /** 지난 1년 같은 상품 딜 중 가장 싼 신기록(조건 없는 가격) — 카드 「1년 최저가」 라벨. 끝난 딜은 false */
  isYearLowest: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  mallId?: Maybe<Scalars['Int']['output']>;
  mallName?: Maybe<Scalars['String']['output']>;
  mappingInfo?: Maybe<Array<ProductMappingInfoOutput>>;
  /** 연결된 발행 모델 페이지(/deals/{slug}). trusted 매핑→brand_item→isPublished=true 일 때만 */
  modelPage?: Maybe<ModelPageOutput>;
  negativeCommunityReactionCount: Scalars['Int']['output'];
  parsedPrice?: Maybe<Scalars['Float']['output']>;
  positiveCommunityReactionCount: Scalars['Int']['output'];
  postedAt: Scalars['DateTime']['output'];
  /** 이 딜이 올라온 커뮤니티 수 — 랭킹 목록(커뮤니티 랭킹·홈 핫딜)에서 같은 딜을 한 칸으로 접으며 센다. 2 이상이면 「커뮤니티 N곳」. 다른 목록에선 비어 있다. */
  postedCommunityCount?: Maybe<Scalars['Int']['output']>;
  precomputedRankingScore?: Maybe<Scalars['Float']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  /** 통합 가격비교(DANAWA 배지 또는 COMMUNITY_CLUSTER 블록, 상세 전용) */
  priceComparison?: Maybe<PriceComparison>;
  /** 왜 핫딜인지 가격 컨텍스트 (게이트 통과 시에만, 상세 전용) */
  priceContext?: Maybe<PriceContext>;
  priceCurrency?: Maybe<Scalars['String']['output']>;
  /** 일별 핫딜가 추이 — 같은 상품 근거가 있는 딜만(brand_item 같은 변형·verified 매핑·동일상품 그룹·같은 글). 2점 미만이면 null */
  priceHistory?: Maybe<ProductPriceHistory>;
  /** 카드 「기준가 대비 X%」 — 상세 근거 헤드라인이 강한 가격 근거일 때만(보통가·쿠팡·다나와). 끝난 딜은 null */
  priceSaving?: Maybe<ProductPriceSaving>;
  /** 상세 히어로 가격 판정(지금 사도 되나). 30일 MAPPING HIGH만 READY. 프론트는 READY+STRONG만 렌더. 실패해도 객체를 내려 nullReason 계측. */
  priceVerdict?: Maybe<ProductPriceVerdict>;
  /** 상품 가격 목록 */
  prices?: Maybe<Array<ProductPrice>>;
  productMapping?: Maybe<ProductMapping>;
  profitLinkProvider?: Maybe<Scalars['String']['output']>;
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

export type ProductOutputPriceHistoryArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
};

export type ProductPairDecisionOutput = {
  __typename?: 'ProductPairDecisionOutput';
  /** admin:{userId} */
  actor: Scalars['String']['output'];
  dealId: Scalars['Int']['output'];
  note: Scalars['String']['output'];
  /** 상대 딜 */
  other?: Maybe<ProductNodeDealOutput>;
  seedId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Y 같은 상품 · N 다른 상품 */
  verdict: Scalars['String']['output'];
};

export type ProductPrice = {
  __typename?: 'ProductPrice';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  price: Scalars['Int']['output'];
  target: ProductPriceTarget;
  type: CurrencyType;
};

/** 상품 상세 가격 추이 (일별 핫딜가) */
export type ProductPriceHistory = {
  __typename?: 'ProductPriceHistory';
  basis: PriceHistoryBasis;
  confidence: PriceHistoryConfidence;
  /** KRW | USD */
  currency: Scalars['String']['output'];
  /** LOW confidence 안내 문구 */
  disclaimer?: Maybe<Scalars['String']['output']>;
  /** 가격추이 가치 실험(price_history_holdout_v1) holdout 기기 — 프론트는 차트를 그리지 않고 price_history_holdout 노출만 남긴다 */
  holdout?: Maybe<Scalars['Boolean']['output']>;
  pointCount: Scalars['Int']['output'];
  points: Array<PriceHistoryPoint>;
  /** TOTAL | UNIT — brand_item 추이 축 */
  priceAxis?: Maybe<Scalars['String']['output']>;
  rangeDays: Scalars['Int']['output'];
  /** 필터 통과 원본 딜 수 */
  sampleCount: Scalars['Int']['output'];
  /** 단위 라벨 (100ml당 등) — brand_item 추이 */
  unitLabel?: Maybe<Scalars['String']['output']>;
};

/** 카드 「기준가 대비 X%」 — 상세 근거 블록 헤드라인이 강함(STRONG)인 가격 근거일 때만. 근거 등급 배치가 수집 1·6·24시간에 다시 매긴다 */
export type ProductPriceSaving = {
  __typename?: 'ProductPriceSaving';
  basis: PriceSavingBasis;
  /** 기준가보다 싼 비율(%, 내림) */
  percent: Scalars['Int']['output'];
};

export enum ProductPriceTarget {
  Danawa = 'DANAWA',
  JirumAlarm = 'JIRUM_ALARM',
  Mall = 'MALL',
}

/** 상세 히어로 가격 판정. v1 프론트는 status=READY && displayTier=STRONG 만 렌더. UNAVAILABLE 이어도 객체를 내려 nullReason 을 계측한다. */
export type ProductPriceVerdict = {
  __typename?: 'ProductPriceVerdict';
  /** MAPPING | CLUSTER */
  basis?: Maybe<Scalars['String']['output']>;
  /** 비교 딜 가격(오름차순) — 분포 막대용 */
  comparePrices?: Maybe<Array<Scalars['Float']['output']>>;
  /** HIGH only in v1 READY */
  confidence?: Maybe<Scalars['String']['output']>;
  /** KRW | USD */
  currency?: Maybe<Scalars['String']['output']>;
  /** 비교한 지난 핫딜 수(딜 단위, 이상치 제외) */
  dealCount?: Maybe<Scalars['Int']['output']>;
  /** seedPrice - windowMinPrice. 음수 = 지금이 더 쌈 */
  deltaWon?: Maybe<Scalars['Float']['output']>;
  /** 보통가 대비 할인율(%). 음수 = 더 비쌈 */
  discountPercent?: Maybe<Scalars['Float']['output']>;
  displayTier: PriceVerdictDisplayTier;
  headline?: Maybe<Scalars['String']['output']>;
  /** v2: dealCount 와 같음(호환용) */
  historyPointCount?: Maybe<Scalars['Int']['output']>;
  labelKey?: Maybe<PriceVerdictLabelKey>;
  nullReason?: Maybe<PriceVerdictNullReason>;
  percentile?: Maybe<Scalars['Float']['output']>;
  rangeDays?: Maybe<Scalars['Int']['output']>;
  /** 좋은 딜에 필요한 할인율(%) — 비교 딜이 적을수록 커진다 */
  requiredDiscountPercent?: Maybe<Scalars['Float']['output']>;
  /** max(0, -deltaWon) */
  savingsWon?: Maybe<Scalars['Float']['output']>;
  seedPrice?: Maybe<Scalars['Float']['output']>;
  status: PriceVerdictStatus;
  subline?: Maybe<Scalars['String']['output']>;
  /** 보통가 = 비교 딜 중앙값 */
  typicalPrice?: Maybe<Scalars['Float']['output']>;
  /** KST YYYY-MM-DD */
  windowMinDate?: Maybe<Scalars['String']['output']>;
  windowMinPrice?: Maybe<Scalars['Float']['output']>;
};

export type ProfitLinkErrorCountOutput = {
  __typename?: 'ProfitLinkErrorCountOutput';
  count: Scalars['Int']['output'];
  error: Scalars['String']['output'];
};

export type ProfitLinkFunnelDailyOutput = {
  __typename?: 'ProfitLinkFunnelDailyOutput';
  date: Scalars['String']['output'];
  /** profitLink 발급 완료 */
  issued: Scalars['Int']['output'];
  /** 미발급 + attempts 소진 (영구 포기) */
  parked: Scalars['Int']['output'];
  /** 미발급 + 재시도 여지 있음 (attempts < MAX) */
  pending: Scalars['Int']['output'];
  /** 미발급 + lastError='disabled' (발급 불가 몰) */
  terminal: Scalars['Int']['output'];
  /** 해당 일 생성 딜 총수 */
  total: Scalars['Int']['output'];
};

export type ProfitLinkMissedProductOutput = {
  __typename?: 'ProfitLinkMissedProductOutput';
  attempts: Scalars['Int']['output'];
  categoryId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  detailUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  mallName?: Maybe<Scalars['String']['output']>;
  nextRetryAt?: Maybe<Scalars['DateTime']['output']>;
  parsedPrice?: Maybe<Scalars['Int']['output']>;
  rankingScore?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
};

export type ProfitLinkProviderHealthOutput = {
  __typename?: 'ProfitLinkProviderHealthOutput';
  /** 90일 중 활동이 있던 날 수 */
  activeDays90d: Scalars['Int']['output'];
  /** 최근 7d 합계 */
  commission7d?: Maybe<Scalars['Float']['output']>;
  /** 최근 30d 합계 */
  commission30d?: Maybe<Scalars['Float']['output']>;
  /** 마지막 판매 row 도착 이후 경과일 — 침묵 판정 입력 */
  daysSinceLastSale?: Maybe<Scalars['Float']['output']>;
  issued7d: Scalars['Int']['output'];
  /** 최근 24h 발급 딜 수 (딜 생성시각 기준 근사) */
  issued24h: Scalars['Int']['output'];
  /** 최근 30d 발급 딜 수 */
  issued30d: Scalars['Int']['output'];
  /** 발급 보유 딜의 마지막 생성 시각 */
  lastIssuedProductAt?: Maybe<Scalars['DateTime']['output']>;
  /** 마지막 판매 row 도착 시각 (postback 생존) */
  lastSaleAt?: Maybe<Scalars['DateTime']['output']>;
  provider: Scalars['String']['output'];
  sales7d: Scalars['Int']['output'];
  sales24h: Scalars['Int']['output'];
  sales30d: Scalars['Int']['output'];
  /** 상태: ok | silent | sparse */
  salesHealth: Scalars['String']['output'];
};

export type ProfitLinkQueueHealthOutput = {
  __typename?: 'ProfitLinkQueueHealthOutput';
  attemptsDistribution: Array<AttemptsCountOutput>;
  /** 지금 재시도 가능 (미발급 + attempts<MAX + backoff 경과). host 제외 조건 미반영 근사치 */
  eligibleNow: Scalars['Int']['output'];
  /** 재시도 가능분 중 최고령 딜 생성 시각 */
  oldestEligibleCreatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** attempts 소진 영구 포기 */
  parked: Scalars['Int']['output'];
  /** lastError='disabled' 터미널 */
  terminalDisabled: Scalars['Int']['output'];
  /** backoff 대기 중 (nextRetryAt 미래) */
  waitingBackoff: Scalars['Int']['output'];
};

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
  /** 어드민) 역할 목록 */
  adminRoles: Array<AdminRoleOutput>;
  /** 어드민) 역할에 넣을 수 있는 섹션 키 전체 */
  adminSections: Array<Scalars['String']['output']>;
  /** 어드민) 어드민 계정별 역할 */
  adminUsersWithRole: Array<AdminUserRoleOutput>;
  /** 어드민) 광고 목록 */
  adsByAdmin: Array<AdvertiseCreative>;
  /** 어드민) provider별 일간 추이 */
  affiliateSalesTrend: Array<AffiliateSalesDailyOutput>;
  /** 어드민) 이 상품명을 차단하면 숨겨질 공개 딜(저장 안 함) */
  blockedTitleKeywordPreviewByAdmin: BlockedTitleKeywordPreviewOutput;
  /** 어드민) 차단 상품명 전부(최근 것 먼저) */
  blockedTitleKeywordsByAdmin: Array<BlockedTitleKeywordOutput>;
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
  /** 브랜드 카탈로그에서 다나와 공식 최저가를 찾는다. 대표가 확실할 때만 돌려주고, 아니면 빈 배열. */
  catalogSearch: Array<CatalogProductOutput>;
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
  /** 어드민) 개념 지도 — 딜·노드·모델 페이지·키워드 허브·테마·알림 층별 수와 층 사이 연결 */
  conceptMapByAdmin: ConceptMapOutput;
  /** 딜 상세의 「쿠팡에서 지금 가격 보기」 — 실험군(게시 7일+ 딜: coupang_search_cta_v1 · 7일 안의 링크 없는 딜: nolink_coupang_cta_v1)이고 링크가 발급돼 있을 때만 */
  coupangSearchCta?: Maybe<CoupangSearchCtaOutput>;
  /** 어드민) 일별/주별/월별 서비스 조회수 합계 */
  dailyServiceViewStats: Array<DateCountOutput>;
  /** 어드민) 이메일 요약 본문 미리보기 */
  emailDigestBodyByAdmin: EmailDigestBodyOutput;
  /** 어드민) 이메일 요약 초안·발송 목록 */
  emailDigestsByAdmin: Array<EmailDigestOutput>;
  /** 안읽은 알림 존재 여부 조회 */
  existUnreadNotification: Scalars['Boolean']['output'];
  existsUnreadNotice: Scalars['Boolean']['output'];
  /** 유저 존재 여부 조회 */
  existsUser: ExistsUserOutput;
  /** 어드민) 실험·관찰 등록부 — 판독 기한 지난 것 먼저, 그다음 진행·준비·끝난 순 */
  experiments: Array<ExperimentOutput>;
  /** 해당 상품 신고된 횟수 조회 */
  expireProductReportCount: Scalars['Int']['output'];
  /** 종료된 상품 제보 내역 조회 */
  expireProductReports: Array<ProductExpireReport>;
  /** 유통기한 임박 특가 상품 조회 */
  expiringSoonHotDealProducts: Array<ProductOutput>;
  /** 웹 상세 첫 방문 시트 — 문구 A/B(first_visit_sheet_frequency_v1) 기기 배정, 알림 키워드(드물면 브랜드로 넓힘)와 90일 딜 횟수. 둘 다 꺼져 있으면 control·받은 키워드 그대로 */
  firstVisitSheetCopy: FirstVisitSheetCopyOutput;
  /** 게이트 차단 매핑 목록 조회 (추출오염/묶음글 등, not_matchable) */
  gatedMappings: Array<ProductMappingOutput>;
  /** 알림함 「좋은 가격만 받기」 권유 — 내 키워드의 좋은 가격 판정 요약. 내 키워드가 아니면 null */
  goodPriceSuggestion?: Maybe<WaitSuggestionOutput>;
  /** 게스트 카테고리 선호 기반 추천 핫딜 (비로그인 허용, 선호 없으면 인기순 폴백) */
  guestRecommendedHotDeals: Array<ProductOutput>;
  /** 어드민) 카카오쇼핑 세션 저장 여부 */
  hasKakaoSession: Scalars['Boolean']['output'];
  /** 어드민) 네이버 세션 저장 여부 */
  hasNaverBcSession: Scalars['Boolean']['output'];
  /** 어드민) 오늘의집 세션 유효 여부 */
  hasOhouSession: Scalars['Boolean']['output'];
  /** 어드민) 세시간전 세션 저장 여부 */
  hasThreeHaSession: Scalars['Boolean']['output'];
  /** 어드민) 토스 세션 유효 여부 */
  hasTossSession: Scalars['Boolean']['output'];
  /** 홈 섹션 목록 + 히어로 슬롯 실험 배정. deviceId(X-Device-Id) 기준 고정 해시. 프론트는 sections 순서를 그대로 그린다. */
  homePage: HomePage;
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
  /** 어드민) 일별/주별/월별 핫딜 비율 추이 */
  hotDealRatioStats: Array<HotDealRatioOutput>;
  /** 어드민) 핫딜 유형별 분포 */
  hotDealTypeDistribution: Array<HotDealTypeCountOutput>;
  /** 키워드 미리보기 — 지난 90일 딜 횟수·마지막 딜(키워드 알림과 같은 매칭·풀), 3번 미만이면 넓힐 첫 낱말. 한 번에 20개·50자까지 */
  keywordDealFrequencies: Array<KeywordDealFrequencyOutput>;
  /** 키워드 허브 하나. 목록 밖 slug 는 null */
  keywordHub?: Maybe<KeywordHubDetailOutput>;
  /** 어드민) 키워드 허브 하나 + 변경 이력 */
  keywordHubByAdmin?: Maybe<KeywordHubAdminDetailOutput>;
  /** 어드민) 이 정의로 바꾸면 최근 30일 딜이 어떻게 달라지나(저장 안 함). 검색을 여러 번 해서 수 초 걸린다 */
  keywordHubPreviewByAdmin: KeywordHubChangePreviewOutput;
  /** 공개 키워드 허브 목록(30일 딜 많은 순) */
  keywordHubs: Array<KeywordHubOutput>;
  /** 어드민) 키워드 허브 목록(공개→후보→탈락) */
  keywordHubsByAdmin: Array<KeywordHubAdminOutput>;
  /** 종료됐을 수 있는 딜 상세의 '최신 핫딜' — 이 글보다 새 진행 중 딜(같은 상품 먼저, 같은 라인 뒤, 최대 20) */
  latestSimilarDeals: Array<ProductOutput>;
  /** 진행 중 딜 상세의 '다른 곳 진행 중인 딜' — 최근 7일 진행 중 딜 중 같은 상품(싼 순) 먼저, 같은 라인 뒤(최대 10) */
  liveAlternativeDeals: Array<LiveAlternativeDealOutput>;
  mallGroups: Array<MallGroup>;
  /** 어드민) 매칭 실행 상세 조회 (스텝 포함) */
  matchRunByAdmin?: Maybe<MatchRun>;
  /** 어드민) 매칭 실행 목록 조회 (페이징) */
  matchRunsByAdmin: MatchRunsByAdminOutput;
  /** AI 비서 연결 승인 요청 — 10분 지났거나 이미 처리했으면 null */
  mcpAuthorizationRequest?: Maybe<McpAuthorizationRequestOutput>;
  /** 로그인한 유저 정보 조회 */
  me?: Maybe<User>;
  modelPage?: Maybe<ModelPageOutput>;
  /** 어드민) 모델 페이지 미리보기 */
  modelPagePreviewByAdmin?: Maybe<ModelPageOutput>;
  /** 어드민) 모델 페이지 검수 목록 */
  modelPagesByAdmin: Array<ModelPageAdminItemOutput>;
  /** 어드민) 내 역할·접근 가능 섹션 */
  myAdminAccess: AdminAccessOutput;
  /** 내가 구독한 묶음(테마) id 목록 */
  mySubscribedThemeIds: Array<Scalars['Int']['output']>;
  /** 유저 알림 키워드 목록 조회 */
  notificationKeywordsByMe: Array<NotificationKeyword>;
  /** 어드민) 개별 알림 목록 조회 */
  notificationListByAdmin: Array<Notification>;
  /** 어드민) 알림 테마 하나 */
  notificationThemeByAdmin: NotificationThemeAdminOutput;
  /** 묶음 상세 무한 스크롤 — 기간 제한 없이 이 묶음을 구독했다면 받았을 알림 딜(최근순, before 커서) */
  notificationThemeDeals: Array<ProductOutput>;
  /** 묶음 미리보기 — 지난 7일 이 묶음을 구독했다면 받았을 알림 딜(최근순) */
  notificationThemeLiveDeals: Array<ProductOutput>;
  /** 어드민) 이 키워드·제외 단어로 바꾸면 최근 30일 받았을 알림이 어떻게 달라지나(저장 안 함) */
  notificationThemePreviewByAdmin: NotificationThemePreviewOutput;
  /** 활성 알림 묶음(테마) 목록 + 대표 키워드 */
  notificationThemes: Array<ThemeWithKeywords>;
  /** 어드민) 알림 테마 전부(켜진 것 먼저) — 30일 받았을 알림 수 포함 */
  notificationThemesByAdmin: Array<NotificationThemeAdminOutput>;
  /** 알림 목록 조회 */
  notifications: Array<Notification>;
  /** 어드민) 알림 발송 이력 조회 */
  notificationsByAdmin: Array<NotificationByAdminOutput>;
  /** 문장 → 키워드 알림 조건 + 지난 30일 미리보기. 해석 못 하면 null(키워드 직접 입력으로) */
  parseNotificationIntent?: Maybe<NotificationIntentOutput>;
  /** 검증 대기 중인 매핑 목록 조회 */
  pendingVerifications: Array<ProductMappingOutput>;
  /** 검증 대기 중인 매핑 전체 개수 조회 (필터 적용 가능) */
  pendingVerificationsTotalCount: Scalars['Int']['output'];
  /** 상품 조회 */
  product?: Maybe<ProductOutput>;
  /** 어드민) 카테고리별 상품 수 */
  productCountByCategory: Array<CategoryCountOutput>;
  /** 어드민) 제공자별 상품 수 */
  productCountByProvider: Array<ProviderCountOutput>;
  productGuides?: Maybe<Array<ProductGuide>>;
  productKeywords: Array<Scalars['String']['output']>;
  /** 어드민) 딜이 속한 같은 상품 묶음 */
  productNodeByAdmin: ProductNodeAdminOutput;
  /** 어드민) 가격대별 상품 분포 */
  productPriceDistribution: Array<PriceRangeCountOutput>;
  /** 어드민) 일별/주별/월별 신규 상품 등록 수 */
  productRegistrationStats: Array<DateCountOutput>;
  /** 어드민) provider별 시계열 신규 상품 수 (커뮤니티 크롤러 health) */
  productRegistrationStatsByProvider: Array<ProviderDateCountOutput>;
  /** 상품 목록 조회 */
  products: Array<ProductOutput>;
  /** 키워드로 상품 목록 조회 */
  productsByKeyword: Array<ProductOutput>;
  /** 어드민) 미발급 딜 lastError 사유 랭킹 */
  profitLinkErrorStats: Array<ProfitLinkErrorCountOutput>;
  /** 어드민) 일별 발급 퍼널 (생성 딜 → 발급/pending/parked/terminal) */
  profitLinkFunnelDaily: Array<ProfitLinkFunnelDailyOutput>;
  /** 어드민) 링크 없는 딜 작업 큐 */
  profitLinkMissedProducts: Array<ProfitLinkMissedProductOutput>;
  /** 어드민) 링크 provider별 상태 */
  profitLinkProviderHealth: Array<ProfitLinkProviderHealthOutput>;
  /** 어드민) retry 큐 건강도 (깊이/backoff 대기/parked/terminal + attempts 분포) */
  profitLinkQueueHealth: ProfitLinkQueueHealthOutput;
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
  /** 어드민) 일별 통계 */
  revenueTrend: Array<RevenueDailyOutput>;
  /** 같은 상품(동일상품 그룹)의 진행 중 딜 조회 (최신순, 최대 20) */
  sameProductDeals: Array<ProductOutput>;
  /** 자동완성용 추천 검색어 목록. prefix로 시작하는 인기 검색어 + 상품 title prefix 매칭. */
  searchSuggestions: Array<Scalars['String']['output']>;
  /** 웹 시즌 허브 「알리 행사장 가기」 제휴 링크(콜백 dp=season_hub:). 발급 실패면 null — 허브는 일반 링크로 둔다 */
  seasonAliexpressLink?: Maybe<Scalars['String']['output']>;
  /** 어드민) 서비스 점검 신호 — 매칭 커버리지·LLM 워커 생존·푸시 마지막 발송 */
  serviceHealthSignals: ServiceHealthSignalsOutput;
  /** 유사 상품 목록 조회 */
  similarProducts: Array<ProductOutput>;
  /** 제목으로 유사 상품 목록 조회 */
  similarProductsByTitle: Array<ProductOutput>;
  /** 소셜 액세스 토큰 조회 */
  socialAccessToken: Scalars['String']['output'];
  /** 소셜 정보 조회 */
  socialInfo: SocialInfoOutput;
  /** 어드민) 썸네일 수집 통계 (타입 분포 + mall별 분포 + 미수집 카운트) */
  thumbnailStats: ThumbnailStatsOutput;
  /** 같이 본 상품 목록 조회 */
  togetherViewedProducts: Array<ProductOutput>;
  /** 어드민) 인기 관심 카테고리 TOP N */
  topFavoriteCategories: Array<CategoryCountOutput>;
  /** 어드민) 알림 키워드 TOP N */
  topNotificationKeywords: Array<KeywordCountOutput>;
  /** 토스 카테고리 인기 하위 탭 목록(실제 존재하는 categoryLabel) */
  tossCategoryLabels: Array<Scalars['String']['output']>;
  /** 토스 상세의 「토스에서 함께 보는 상품」 — 실험 toss_internal_link_v1 대상 군 토스 상품(같은 카테고리 먼저, 최대 8). 토스 상품이 아니면 빈 배열 */
  tossInternalLinks: Array<ProductOutput>;
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
  /** 어드민) 사용자 요약 — 회원·게스트·최근 접속·알림 닿는 사람 + 기간 안 가입 경로별 일별 신규 */
  userOverview: UserOverviewOutput;
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
  /** 웹 상세 «언제 사나» 카드 — 이 상품 키워드의 커뮤니티 90일 좋은 가격·지금 판단(카드 군만 내용). 시작 전·꺼짐이면 null */
  waitCardForProduct?: Maybe<WaitCardOutput>;
  /** 「언제 사나」(AI 홈 프로토타입, 허용 유저만) — 사려는 상품 한 줄 → 지난 90일 커뮤니티 핫딜로 본 좋은 가격·빈도·지금. 해석 못 하면 null */
  waitEstimate?: Maybe<WaitEstimateOutput>;
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

export type QueryAffiliateSalesTrendArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type QueryBlockedTitleKeywordPreviewByAdminArgs = {
  keyword: Scalars['String']['input'];
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

export type QueryCatalogSearchArgs = {
  keyword: Scalars['String']['input'];
  limit?: Scalars['Int']['input'];
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

export type QueryCoupangSearchCtaArgs = {
  productId: Scalars['Int']['input'];
};

export type QueryDailyServiceViewStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  interval?: DateInterval;
  startDate: Scalars['DateTime']['input'];
};

export type QueryEmailDigestBodyByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type QueryEmailDigestsByAdminArgs = {
  digestDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EmailDigestStatus>;
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

export type QueryFirstVisitSheetCopyArgs = {
  keyword: Scalars['String']['input'];
  productId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGatedMappingsArgs = {
  limit: Scalars['Int']['input'];
  matchingSource?: InputMaybe<Array<Scalars['String']['input']>>;
  orderBy?: InputMaybe<OrderOptionType>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryGoodPriceSuggestionArgs = {
  keyword: Scalars['String']['input'];
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

export type QueryKeywordDealFrequenciesArgs = {
  keywords: Array<Scalars['String']['input']>;
};

export type QueryKeywordHubArgs = {
  slug: Scalars['String']['input'];
};

export type QueryKeywordHubByAdminArgs = {
  slug: Scalars['String']['input'];
};

export type QueryKeywordHubPreviewByAdminArgs = {
  aliases: Array<Scalars['String']['input']>;
  excludes: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryKeywordHubsByAdminArgs = {
  status?: InputMaybe<KeywordHubStatus>;
};

export type QueryLatestSimilarDealsArgs = {
  id: Scalars['Int']['input'];
  limit?: Scalars['Int']['input'];
};

export type QueryLiveAlternativeDealsArgs = {
  id: Scalars['Int']['input'];
  limit?: Scalars['Int']['input'];
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

export type QueryMcpAuthorizationRequestArgs = {
  requestId: Scalars['String']['input'];
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

export type QueryNotificationThemeByAdminArgs = {
  id: Scalars['Int']['input'];
};

export type QueryNotificationThemeDealsArgs = {
  before?: InputMaybe<Scalars['Float']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  themeId: Scalars['Int']['input'];
};

export type QueryNotificationThemeLiveDealsArgs = {
  themeId: Scalars['Int']['input'];
};

export type QueryNotificationThemePreviewByAdminArgs = {
  excludeKeywords: Array<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  keywords: Array<Scalars['String']['input']>;
};

export type QueryNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type QueryNotificationsByAdminArgs = {
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryParseNotificationIntentArgs = {
  text: Scalars['String']['input'];
};

export type QueryPendingVerificationsArgs = {
  agentHeld?: InputMaybe<Scalars['Boolean']['input']>;
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
  agentHeld?: InputMaybe<Scalars['Boolean']['input']>;
  aiSuggestion?: InputMaybe<ProductMappingAiSuggestion>;
  brandProductId?: InputMaybe<Scalars['Int']['input']>;
  matchStatus?: InputMaybe<Array<ProductMappingMatchStatus>>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productTitle?: InputMaybe<Scalars['String']['input']>;
  suspiciousFirst?: InputMaybe<Scalars['Boolean']['input']>;
  target?: InputMaybe<ProductMappingTarget>;
  verificationStatus?: InputMaybe<Array<ProductMappingVerificationStatus>>;
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

export type QueryProductNodeByAdminArgs = {
  productId: Scalars['Int']['input'];
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
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
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
  providerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
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
  tossCategoryLabel?: InputMaybe<Scalars['String']['input']>;
};

export type QueryProfitLinkErrorStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  limit?: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type QueryProfitLinkFunnelDailyArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type QueryProfitLinkMissedProductsArgs = {
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  limit?: Scalars['Int']['input'];
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

export type QueryRevenueTrendArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type QuerySameProductDealsArgs = {
  id: Scalars['Int']['input'];
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

export type QueryTossInternalLinksArgs = {
  id: Scalars['Int']['input'];
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

export type QueryUserOverviewArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
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

export type QueryWaitCardForProductArgs = {
  productId: Scalars['Int']['input'];
};

export type QueryWaitEstimateArgs = {
  text: Scalars['String']['input'];
};

export type QueryWishlistsArgs = {
  limit: Scalars['Int']['input'];
  orderBy: WishlistOrderType;
  orderOption: OrderOptionType;
  searchAfter?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RevenueDailyOutput = {
  __typename?: 'RevenueDailyOutput';
  date: Scalars['String']['output'];
  /** 금액(KRW) */
  revenue: Scalars['Float']['output'];
  /** 출처 */
  source: Scalars['String']['output'];
};

export enum Role {
  Admin = 'ADMIN',
  Guest = 'GUEST',
  User = 'USER',
}

export enum SectionDisplayType {
  DoubleRow = 'DOUBLE_ROW',
  GridTabbed = 'GRID_TABBED',
  Group = 'GROUP',
  HorizontalScroll = 'HORIZONTAL_SCROLL',
  List = 'LIST',
  PaginatedGrid = 'PAGINATED_GRID',
  Toss = 'TOSS',
}

export type ServiceHealthSignalsOutput = {
  __typename?: 'ServiceHealthSignalsOutput';
  /** 지금 울리는 Prometheus 알람(critical·warning, 상시 신호 제외). null = Prometheus 응답 없음 */
  alerts?: Maybe<Array<FiringAlertOutput>>;
  /** 커뮤니티 반응 신호(사이트 × 신호). null = 집계 실패 */
  engagementSignals?: Maybe<Array<EngagementSignalOutput>>;
  /** 최근 24시간 실패한 LLM 작업 수 */
  llmFailed24h: Scalars['Int']['output'];
  /** LLM 작업이 마지막으로 끝난 지 몇 분. 일괄 작업으로 대기열이 수만 건 쌓이는 건 정상이라 생존은 이걸로 본다 */
  llmMinutesSinceLastDone?: Maybe<Scalars['Int']['output']>;
  /** 지금 처리 가능한 LLM 대기 작업 수 */
  llmReadyPending: Scalars['Int']['output'];
  /** matching-api 커버리지. null = matching-api 응답 없음(그 자체가 장애 신호) */
  mappingCoverage?: Maybe<MappingCoverageOutput>;
  /** 마지막 푸시 발송 후 몇 분. 야간(21~08시)엔 발송이 없어 아침까지 ~11시간 공백이 정상 */
  pushMinutesSinceLast?: Maybe<Scalars['Int']['output']>;
};

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
  /** 제목에 하나라도 있으면 이 묶음 알림에서 빼는 단어 */
  excludeKeywords: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** 이 묶음이 딜 제목에서 찾는 키워드 전부(등록 순) */
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  representativeKeywords: Array<Scalars['String']['output']>;
  /** URL slug(/themes/{slug}). 없으면 id 로 링크 */
  slug?: Maybe<Scalars['String']['output']>;
  /** 구독자 수 */
  subscriberCount: Scalars['Int']['output'];
  /** 지난 7일 이 묶음을 구독했다면 받았을 알림 수 */
  weeklyAlertCount: Scalars['Int']['output'];
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

export type TossProfitLinkOutput = {
  __typename?: 'TossProfitLinkOutput';
  /** 실패 시 사유. 성공이면 null. 끝에 [toss:…] trace 가 붙을 수 있다. */
  error?: Maybe<Scalars['String']['output']>;
  /** 발급된 토스 수익링크 (toss.im/_m/…) */
  profitLink?: Maybe<Scalars['String']['output']>;
};

export type TossSection = BaseSection & {
  __typename?: 'TossSection';
  displayOrder?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: SectionDisplayType;
  viewMoreLink?: Maybe<Scalars['String']['output']>;
};

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
  isGuest: Scalars['Boolean']['output'];
  lastReadNoticeAt?: Maybe<Scalars['DateTime']['output']>;
  linkedSocialProviders?: Maybe<Array<OauthProvider>>;
  nickname: Scalars['String']['output'];
};

/** 하루 끝(23:55 KST) 스냅숏 — 접속은 KST 달력 기준(그날·7일·30일) */
export type UserActivityDailyOutput = {
  __typename?: 'UserActivityDailyOutput';
  /** 그날 접속 게스트 — 2026-10-14 이전은 게스트 재방문을 안 세던 때라 null */
  activeGuests1d?: Maybe<Scalars['Int']['output']>;
  /** 그날까지 7일 접속 게스트(2026-10-14 이전 null) */
  activeGuests7d?: Maybe<Scalars['Int']['output']>;
  /** 그날 접속 회원(DAU) */
  activeMembers1d: Scalars['Int']['output'];
  /** 그날까지 7일 접속 회원 */
  activeMembers7d: Scalars['Int']['output'];
  /** 그날까지 30일 접속 회원 */
  activeMembers30d: Scalars['Int']['output'];
  /** KST 날짜 YYYY-MM-DD */
  date: Scalars['String']['output'];
  guests: Scalars['Int']['output'];
  members: Scalars['Int']['output'];
  pushGuests: Scalars['Int']['output'];
  pushMembers: Scalars['Int']['output'];
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

export type UserOverviewOutput = {
  __typename?: 'UserOverviewOutput';
  /** 최근 24시간 접속 게스트(2026-10-14 전엔 재방문을 안 세서 생성 시각만 잡힌다) */
  activeGuests1d: Scalars['Int']['output'];
  /** 최근 7일 접속 게스트 */
  activeGuests7d: Scalars['Int']['output'];
  /** 최근 24시간 접속 회원(lastLoggedInAt — 백그라운드 토큰 갱신은 제외) */
  activeMembers1d: Scalars['Int']['output'];
  /** 최근 7일 접속 회원 */
  activeMembers7d: Scalars['Int']['output'];
  /** 최근 30일 접속 회원 */
  activeMembers30d: Scalars['Int']['output'];
  /** 기간 안 일별 스냅숏(2026-10-11 부터) — 지난 날짜의 접속 수는 이것만 있다 */
  dailyActivity: Array<UserActivityDailyOutput>;
  /** 기간 안 일별 성장 지표 — 웹·앱 사용자, 알림 경유 재방문, 푸시 수신, 키워드 등록, 카톡방 */
  dailyGrowth: Array<GrowthMetricDailyOutput>;
  /** 기간 안 일별·가입 경로별 신규 계정 */
  dailySignups: Array<UserSignupDailyOutput>;
  /** 게스트 계정 수(로그인 없이 알림만 받는 기기) */
  guests: Scalars['Int']['output'];
  /** 회원 수(게스트 제외) */
  members: Scalars['Int']['output'];
  /** 살아 있는 푸시 토큰이 있는 게스트 */
  pushGuests: Scalars['Int']['output'];
  /** 살아 있는 푸시 토큰이 있는 회원 = 알림이 닿는 회원 */
  pushMembers: Scalars['Int']['output'];
};

export type UserPushSetting = {
  __typename?: 'UserPushSetting';
  communityAlert: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** 키워드 알림 이메일 요약 수신 동의 */
  emailDigest: Scalars['Boolean']['output'];
  emailDigestAgreedAt?: Maybe<Scalars['DateTime']['output']>;
  hotDealAlert: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  info: Scalars['Boolean']['output'];
  keywordAlert: Scalars['Boolean']['output'];
  /** 키워드 알림 받는 기준 — ALL 올라오는 즉시 / HOT 핫딜·대박딜이 됐을 때만 */
  keywordAlertLevel: KeywordAlertLevel;
  marketing: Scalars['Boolean']['output'];
  marketingAgreedAt?: Maybe<Scalars['DateTime']['output']>;
  nightAlerts: Scalars['Boolean']['output'];
  nightAlertsAgreedAt?: Maybe<Scalars['DateTime']['output']>;
  /** 방해금지 끝 시(KST 0~23, 이 시각에 모아 보냄) */
  quietHoursEnd?: Maybe<Scalars['Int']['output']>;
  /** 방해금지 시작 시(KST 0~23). quietHoursEnd 와 함께 null 이면 꺼짐 */
  quietHoursStart?: Maybe<Scalars['Int']['output']>;
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

export type UserSignupDailyOutput = {
  __typename?: 'UserSignupDailyOutput';
  /** 가입 경로 — kakao·naver·apple·google(첫 소셜 연결), email(소셜 없음), guest(게스트 계정) */
  channel: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  /** KST 날짜 YYYY-MM-DD */
  date: Scalars['String']['output'];
  /** 그중 지금 살아 있는 푸시 토큰이 있는 계정 = 가입해서 알림까지 닿은 수(조회 시점 기준) */
  reachable: Scalars['Int']['output'];
};

export type VerificationStatistics = {
  __typename?: 'VerificationStatistics';
  pending: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  verified: Scalars['Int']['output'];
};

/** 웹 상세 «언제 사나» 카드(wait_card_detail_v1) — 이 상품 키워드의 커뮤니티 90일 좋은 가격·지금 판단. 시작 전·꺼짐이면 쿼리가 null */
export type WaitCardOutput = {
  __typename?: 'WaitCardOutput';
  /** card(카드를 그린다) | control(그리지 않고 노출만 wait_card_ctl 로 남긴다) | excluded(「답」 숨김 군 — 아무것도 안 함) */
  arm: Scalars['String']['output'];
  /** 판정에 쓴 딜 수(같은 품목만, 교차 게시 제거) */
  dealCount?: Maybe<Scalars['Int']['output']>;
  /** 이 상품에 카드를 띄울 수 있나(같은 품목 8건+·같은 제품 고르기·단위가 범위 관문 통과) — 두 군 모두 같은 값 */
  eligible: Scalars['Boolean']['output'];
  /** 지난 windowDays 중 좋은 가격 이하가 뜬 날 수 */
  goodDays?: Maybe<Scalars['Int']['output']>;
  /** 좋은 가격(단위가, 하위 20% 를 보기 좋게 올림) */
  goodPrice?: Maybe<Scalars['Float']['output']>;
  /** 알림 키워드 — 「이 가격 오면 알려줘」가 거는 키워드. card 군만 */
  keyword?: Maybe<Scalars['String']['output']>;
  lastGoodAt?: Maybe<Scalars['DateTime']['output']>;
  /** 이 상품 지금 가격의 단위가 */
  pageUnitPrice?: Maybe<Scalars['Float']['output']>;
  /** 좋은 가격이 뜬 날 사이 간격(중앙값) */
  typicalGapDays?: Maybe<Scalars['Int']['output']>;
  unit?: Maybe<WaitUnit>;
  /** BUY_NOW(지금 좋은 가격 안) | WAIT(자주 온다) | RARE(드물다) | STATS(지난 딜·같은 제품이 아님 — 기억만). eligible 이면 두 군 모두 */
  verdict?: Maybe<Scalars['String']['output']>;
  /** 이 키워드 알림을 이미 「하락만 받기」로 걸어 두었나 — 버튼 대신 「알림 켜짐」 */
  watching: Scalars['Boolean']['output'];
  windowDays: Scalars['Int']['output'];
};

/** 「언제 사나」 판정에 쓴 딜 */
export type WaitDeal = {
  __typename?: 'WaitDeal';
  id: Scalars['Int']['output'];
  isEnd: Scalars['Boolean']['output'];
  postedAt: Scalars['DateTime']['output'];
  /** 원화 총액 */
  price: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  /** 비교 단위로 나눈 값(unit 참고) */
  unitPrice: Scalars['Float']['output'];
};

/** 「언제 사나」 — 사려는 상품 한 줄 → 지난 90일 커뮤니티 핫딜로 본 좋은 가격·빈도·지금 */
export type WaitEstimateOutput = {
  __typename?: 'WaitEstimateOutput';
  /** 키워드 후보(구체적인 것부터). keyword 가 첫 후보가 아니면 딜이 적어 넓혀 본 것 */
  candidates: Array<WaitKeywordCandidate>;
  /** 같은 물건끼리 비교 중인가 — false 면 여러 상품이 섞였을 수 있음 */
  confident: Scalars['Boolean']['output'];
  /** 지금 진행 중 가장 싼 딜 */
  current?: Maybe<WaitDeal>;
  /** 지금 가장 싼 딜의 90일 중 위치(0~1, 작을수록 쌈) */
  currentPercentile?: Maybe<Scalars['Float']['output']>;
  /** 판정에 쓴 딜 수(교차 게시 제거) */
  dealCount: Scalars['Int']['output'];
  excludeKeywords: Array<Scalars['String']['output']>;
  /** 좋은 가격 이하가 뜬 날 수(windowDays 중) */
  goodDays: Scalars['Int']['output'];
  /** 좋은 가격 이하 딜 수 = 「이 가격 오면 알려줘」가 90일간 보냈을 알림 */
  goodDealCount: Scalars['Int']['output'];
  /** 좋은 가격 이하 딜, 최신 5건 */
  goodDeals: Array<WaitDeal>;
  /** 좋은 가격 = 하위 20% 를 두 자리로 올림(단위가) */
  goodPrice?: Maybe<Scalars['Float']['output']>;
  /** 판정에 쓴 키워드 — 「알려줘」 등록 키워드 */
  keyword: Scalars['String']['output'];
  kind: WaitKind;
  /** 화면 이름(LLM) */
  label: Scalars['String']['output'];
  lastGoodAt?: Maybe<Scalars['DateTime']['output']>;
  /** 지금 진행 중, 싼 순 3건 */
  liveDeals: Array<WaitDeal>;
  median?: Maybe<Scalars['Float']['output']>;
  p10?: Maybe<Scalars['Float']['output']>;
  points: Array<WaitPoint>;
  priceCeiling?: Maybe<Scalars['Int']['output']>;
  priceFloor?: Maybe<Scalars['Int']['output']>;
  /** 키워드만 걸었다면 90일간 왔을 알림 수(대략) */
  rawMatchCount: Scalars['Int']['output'];
  /** 좋은 가격이 뜬 날 사이 간격(중앙값) */
  typicalGapDays?: Maybe<Scalars['Int']['output']>;
  unit: WaitUnit;
  verdict: WaitVerdict;
  /** 이 키워드 알림을 이미 「하락만 받기」로 켜 두었나 — 화면이 「알림 켜짐」으로 보여 준다 */
  watching: Scalars['Boolean']['output'];
  windowDays: Scalars['Int']['output'];
};

export type WaitKeywordCandidate = {
  __typename?: 'WaitKeywordCandidate';
  /** 90일·조건 통과·단위가 붙은 딜 수 */
  dealCount: Scalars['Int']['output'];
  keyword: Scalars['String']['output'];
};

/** PRODUCT(특정 상품)·CATEGORY(여러 상품군 — 가격 하나로 못 말함)·VOUCHER(상품권)·UNKNOWN */
export enum WaitKind {
  Category = 'CATEGORY',
  Product = 'PRODUCT',
  Unknown = 'UNKNOWN',
  Voucher = 'VOUCHER',
}

/** 차트 점(교차 게시 제거) */
export type WaitPoint = {
  __typename?: 'WaitPoint';
  /** 최근 3일·안 끝남 */
  live: Scalars['Boolean']['output'];
  postedAt: Scalars['DateTime']['output'];
  unitPrice: Scalars['Float']['output'];
};

/** 알림함 「좋은 가격만 받기」 권유 — 내 키워드 하나의 판정 요약 */
export type WaitSuggestionOutput = {
  __typename?: 'WaitSuggestionOutput';
  /** 좋은 가격만 받으면 지난 windowDays 동안 왔을 알림 */
  goodDealCount: Scalars['Int']['output'];
  goodPrice?: Maybe<Scalars['Float']['output']>;
  keyword: Scalars['String']['output'];
  /** 좋은 가격을 말할 수 있나(카테고리·섞임이면 false → 권유하지 않는다) */
  priced: Scalars['Boolean']['output'];
  /** 키워드만 걸면 지난 windowDays 동안 왔을 알림(대략) */
  rawMatchCount: Scalars['Int']['output'];
  unit: WaitUnit;
  /** 이미 하락만 받기를 켜 두었나 */
  watching: Scalars['Boolean']['output'];
  windowDays: Scalars['Int']['output'];
};

/** 가격 비교 단위 — LITER(1L당)·HUNDRED_GRAM(100g당)·COUNT(1개당)·FACE_VALUE(액면가 대비 비율)·TOTAL(총액) */
export enum WaitUnit {
  Count = 'COUNT',
  FaceValue = 'FACE_VALUE',
  HundredGram = 'HUNDRED_GRAM',
  Liter = 'LITER',
  Total = 'TOTAL',
}

/** BUY_NOW(지금 좋은 가격이 떠 있음)·WAIT(자주 오니 기다림)·RARE(90일에 1~3일만)·NO_DATA(딜 8건 미만) */
export enum WaitVerdict {
  BuyNow = 'BUY_NOW',
  NoData = 'NO_DATA',
  Rare = 'RARE',
  Wait = 'WAIT',
}

/** 「이 가격 오면 알려줘」 결과 */
export type WaitWatchOutput = {
  __typename?: 'WaitWatchOutput';
  /** 새로 등록했나 — false 면 이미 있던 키워드의 조건을 덮음 */
  created: Scalars['Boolean']['output'];
  /** 등록(또는 조건을 덮은) 알림 키워드 */
  keyword: Scalars['String']['output'];
  /** 좋은 가격 이하만 받게 걸었나 — false 면 가격 조건 없는 새 딜 알림(카테고리·섞임) */
  priced: Scalars['Boolean']['output'];
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

export type ActiveAdsQueryVariables = Exact<{
  slotLocation: AdvertiseSlotLocation;
}>;

export type ActiveAdsQuery = {
  __typename?: 'Query';
  activeAds: Array<{
    __typename?: 'AdvertiseCreative';
    id: string;
    internalId: string;
    slotType: AdvertiseSlotType;
    slotLocation: Array<AdvertiseSlotLocation>;
    slotPriority: number;
    graphic: any;
    displayTitle?: string | null;
    targetUrl: string;
    isActive: boolean;
  }>;
};

export type RecordAdImpressionsMutationVariables = Exact<{
  events: Array<AdvertiseImpressionInput> | AdvertiseImpressionInput;
}>;

export type RecordAdImpressionsMutation = {
  __typename?: 'Mutation';
  recordAdImpressions: boolean;
};

export type RecordAdClickMutationVariables = Exact<{
  creativeId: Scalars['Int']['input'];
  slotLocation: AdvertiseSlotLocation;
}>;

export type RecordAdClickMutation = {
  __typename?: 'Mutation';
  recordAdClick: boolean;
};

export type MutationLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type MutationLoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'TokenOutput';
    accessToken: string;
    refreshToken?: string | null;
  };
};

export type MutationGuestLoginMutationVariables = Exact<{[key: string]: never}>;

export type MutationGuestLoginMutation = {
  __typename?: 'Mutation';
  guestLogin: {
    __typename?: 'TokenOutput';
    accessToken: string;
    refreshToken?: string | null;
  };
};

export type MutationLoginByRefreshTokenMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MutationLoginByRefreshTokenMutation = {
  __typename?: 'Mutation';
  loginByRefreshToken: {
    __typename?: 'TokenOutput';
    accessToken: string;
    refreshToken?: string | null;
  };
};

export type MutationSocialLoginMutationVariables = Exact<{
  oauthProvider: OauthProvider;
  socialAccessToken: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  gender?: InputMaybe<Gender>;
  favoriteCategories?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
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

export type CategoriesQueryVariables = Exact<{[key: string]: never}>;

export type CategoriesQuery = {
  __typename?: 'Query';
  categories: Array<{__typename?: 'Category'; id: string; name: string}>;
};

export type MyFavoriteCategoriesQueryVariables = Exact<{[key: string]: never}>;

export type MyFavoriteCategoriesQuery = {
  __typename?: 'Query';
  me?: {
    __typename?: 'User';
    id: string;
    favoriteCategories?: Array<number> | null;
  } | null;
};

export type CommentsQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
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
    replyCount: number;
    author?: {__typename?: 'User'; id: string; nickname: string} | null;
  }>;
};

export type AddCommentMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type AddCommentMutation = {__typename?: 'Mutation'; addComment: boolean};

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  content?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateCommentMutation = {
  __typename?: 'Mutation';
  updateComment: boolean;
};

export type RemoveCommentMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type RemoveCommentMutation = {
  __typename?: 'Mutation';
  removeComment: boolean;
};

export type CommunityPostsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
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
    author?: {__typename?: 'User'; id: string; nickname: string} | null;
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
    author?: {__typename?: 'User'; id: string; nickname: string} | null;
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

export type CommunityPostCommentsQueryVariables = Exact<{
  parentId: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
  orderBy: CommentOrder;
  orderOption: OrderOptionType;
}>;

export type CommunityPostCommentsQuery = {
  __typename?: 'Query';
  comments: Array<{
    __typename?: 'CommentOutput';
    id: string;
    content: string;
    createdAt: any;
    searchAfter?: Array<string> | null;
    likeCount: number;
    isMyLike?: boolean | null;
    author?: {__typename?: 'User'; id: string; nickname: string} | null;
  }>;
};

export type AddCommunityCommentMutationVariables = Exact<{
  parentId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
}>;

export type AddCommunityCommentMutation = {
  __typename?: 'Mutation';
  addComment: boolean;
};

export type AddUserReportMutationVariables = Exact<{
  target: UserReportTarget;
  targetId: Scalars['Float']['input'];
  reason: UserReportReason;
  description?: InputMaybe<Scalars['String']['input']>;
}>;

export type AddUserReportMutation = {
  __typename?: 'Mutation';
  addUserReport: boolean;
};

export type HotDealRankingProductsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type HotDealRankingProductsQuery = {
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
    isYearLowest: boolean;
    searchAfter?: Array<string> | null;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type GuestRecommendedHotDealsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type GuestRecommendedHotDealsQuery = {
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
    isYearLowest: boolean;
    searchAfter?: Array<string> | null;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type HomeProductsByKeywordQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
  keyword: Scalars['String']['input'];
  orderBy: KeywordProductOrderType;
  orderOption: OrderOptionType;
}>;

export type HomeProductsByKeywordQuery = {
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
    isYearLowest: boolean;
    data?: any | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type HomeProductsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<ProductOrderType>;
  orderOption?: InputMaybe<OrderOptionType>;
  categoryIds?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
  keyword?: InputMaybe<Scalars['String']['input']>;
  thumbnailType?: InputMaybe<ThumbnailType>;
  isEnd?: InputMaybe<Scalars['Boolean']['input']>;
  isHot?: InputMaybe<Scalars['Boolean']['input']>;
  providerIds?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
  mallGroupId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type HomeProductsQuery = {
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
    mallName?: string | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    searchAfter?: Array<string> | null;
    postedCommunityCount?: number | null;
    isRising?: boolean | null;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type ExpiringSoonHotDealProductsQueryVariables = Exact<{
  daysUntilExpiry: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
}>;

export type ExpiringSoonHotDealProductsQuery = {
  __typename?: 'Query';
  expiringSoonHotDealProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    mallName?: string | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    searchAfter?: Array<string> | null;
    postedAt: any;
    earliestExpiryDate?: any | null;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type CommunityProvidersQueryVariables = Exact<{[key: string]: never}>;

export type CommunityProvidersQuery = {
  __typename?: 'Query';
  communityProviders: Array<{
    __typename?: 'Provider';
    id: string;
    name: string;
    nameKr: string;
  }>;
};

export type MallGroupsQueryVariables = Exact<{[key: string]: never}>;

export type MallGroupsQuery = {
  __typename?: 'Query';
  mallGroups: Array<{
    __typename?: 'MallGroup';
    id: number;
    title: string;
    isActive: boolean;
    sort?: number | null;
  }>;
};

export type RecommendedNotificationKeywordsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type RecommendedNotificationKeywordsQuery = {
  __typename?: 'Query';
  recommendedNotificationKeywords: Array<string>;
};

export type TossCategoryLabelsQueryVariables = Exact<{[key: string]: never}>;

export type TossCategoryLabelsQuery = {
  __typename?: 'Query';
  tossCategoryLabels: Array<string>;
};

export type TossProductsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
  keyword: Scalars['String']['input'];
  orderBy: KeywordProductOrderType;
  orderOption: OrderOptionType;
  tossCategoryLabel?: InputMaybe<Scalars['String']['input']>;
}>;

export type TossProductsQuery = {
  __typename?: 'Query';
  productsByKeyword: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    price?: string | null;
    thumbnail?: string | null;
    data?: any | null;
    searchAfter?: Array<string> | null;
    postedAt: any;
  }>;
};

export type CommunityRandomRankingProductsQueryVariables = Exact<{
  count: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type CommunityRandomRankingProductsQuery = {
  __typename?: 'Query';
  communityRandomRankingProducts: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    mallId?: number | null;
    mallName?: string | null;
    url?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    providerId: number;
    categoryId: number;
    category?: string | null;
    thumbnail?: string | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type QueryMyProfileQueryVariables = Exact<{[key: string]: never}>;

export type QueryMyProfileQuery = {
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

export type MutationUpdateMyProfileMutationVariables = Exact<{
  nickname?: InputMaybe<Scalars['String']['input']>;
  birthYear?: InputMaybe<Scalars['Float']['input']>;
  gender?: InputMaybe<Gender>;
  favoriteCategories?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
}>;

export type MutationUpdateMyProfileMutation = {
  __typename?: 'Mutation';
  updateUserProfile: boolean;
};

export type MutationUpdateMyPasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
}>;

export type MutationUpdateMyPasswordMutation = {
  __typename?: 'Mutation';
  updatePassword: boolean;
};

export type MutationWithdrawMutationVariables = Exact<{[key: string]: never}>;

export type MutationWithdrawMutation = {
  __typename?: 'Mutation';
  withdraw: boolean;
};

export type QueryMyNotificationKeywordsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
}>;

export type QueryMyNotificationKeywordsQuery = {
  __typename?: 'Query';
  notificationKeywordsByMe: Array<{
    __typename?: 'NotificationKeyword';
    id: string;
    keyword: string;
    priceDropOnly: boolean;
    minPrice?: number | null;
    maxPrice?: number | null;
    excludeKeywords?: Array<string> | null;
  }>;
};

export type MutationAddMyNotificationKeywordMutationVariables = Exact<{
  keyword: Scalars['String']['input'];
  fromRecommendation?: InputMaybe<Scalars['Boolean']['input']>;
  priceDropOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type MutationAddMyNotificationKeywordMutation = {
  __typename?: 'Mutation';
  addNotificationKeyword: boolean;
};

export type MutationRemoveMyNotificationKeywordMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type MutationRemoveMyNotificationKeywordMutation = {
  __typename?: 'Mutation';
  removeNotificationKeyword: boolean;
};

export type MutationUpdateKeywordPriceDropOnlyMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  priceDropOnly: Scalars['Boolean']['input'];
}>;

export type MutationUpdateKeywordPriceDropOnlyMutation = {
  __typename?: 'Mutation';
  updateNotificationKeywordPriceDropOnly: boolean;
};

export type QueryMyWishlistsQueryVariables = Exact<{
  orderBy: WishlistOrderType;
  orderOption: OrderOptionType;
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
}>;

export type QueryMyWishlistsQuery = {
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
      isYearLowest: boolean;
      thumbnail?: string | null;
      isMyWishlist?: boolean | null;
      categoryId: number;
      mallName?: string | null;
      priceSaving?: {
        __typename?: 'ProductPriceSaving';
        basis: PriceSavingBasis;
        percent: number;
      } | null;
      provider: {__typename?: 'Provider'; nameKr: string};
    };
  }>;
};

export type QueryMyWishlistCountQueryVariables = Exact<{[key: string]: never}>;

export type QueryMyWishlistCountQuery = {
  __typename?: 'Query';
  wishlistCount: number;
};

export type MutationAddMyWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type MutationAddMyWishlistMutation = {
  __typename?: 'Mutation';
  addWishlist: boolean;
};

export type MutationRemoveMyWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type MutationRemoveMyWishlistMutation = {
  __typename?: 'Mutation';
  removeWishlist: boolean;
};

export type QueryNotificationThemesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type QueryNotificationThemesQuery = {
  __typename?: 'Query';
  notificationThemes: Array<{
    __typename?: 'ThemeWithKeywords';
    id: string;
    name: string;
    description: string;
    emoji?: string | null;
    representativeKeywords: Array<string>;
    keywords: Array<string>;
    excludeKeywords: Array<string>;
    weeklyAlertCount: number;
  }>;
};

export type QueryMySubscribedThemeIdsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type QueryMySubscribedThemeIdsQuery = {
  __typename?: 'Query';
  mySubscribedThemeIds: Array<number>;
};

export type QueryNotificationThemeLiveDealsQueryVariables = Exact<{
  themeId: Scalars['Int']['input'];
}>;

export type QueryNotificationThemeLiveDealsQuery = {
  __typename?: 'Query';
  notificationThemeLiveDeals: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    thumbnail?: string | null;
    price?: string | null;
    postedAt: any;
    categoryId: number;
    isEnd?: boolean | null;
    isHot?: boolean | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    mallName?: string | null;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type MutationSubscribeNotificationThemeMutationVariables = Exact<{
  themeId: Scalars['Int']['input'];
}>;

export type MutationSubscribeNotificationThemeMutation = {
  __typename?: 'Mutation';
  subscribeNotificationTheme: boolean;
};

export type MutationUnsubscribeNotificationThemeMutationVariables = Exact<{
  themeId: Scalars['Int']['input'];
}>;

export type MutationUnsubscribeNotificationThemeMutation = {
  __typename?: 'Mutation';
  unsubscribeNotificationTheme: boolean;
};

export type MutationUpdateKeywordPriceRangeMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
}>;

export type MutationUpdateKeywordPriceRangeMutation = {
  __typename?: 'Mutation';
  updateNotificationKeywordPriceRange: boolean;
};

export type MutationUpdateKeywordExcludeKeywordsMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  excludeKeywords:
    | Array<Scalars['String']['input']>
    | Scalars['String']['input'];
}>;

export type MutationUpdateKeywordExcludeKeywordsMutation = {
  __typename?: 'Mutation';
  updateNotificationKeywordExcludeKeywords: boolean;
};

export type QueryMyPushSettingQueryVariables = Exact<{[key: string]: never}>;

export type QueryMyPushSettingQuery = {
  __typename?: 'Query';
  pushSetting: {
    __typename?: 'UserPushSetting';
    keywordAlert: boolean;
    keywordAlertLevel: KeywordAlertLevel;
    marketing: boolean;
    nightAlerts: boolean;
    communityAlert: boolean;
    emailDigest: boolean;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
  };
};

export type MutationUpdateMyPushSettingMutationVariables = Exact<{
  keywordAlert?: InputMaybe<Scalars['Boolean']['input']>;
  keywordAlertLevel?: InputMaybe<KeywordAlertLevel>;
  marketing?: InputMaybe<Scalars['Boolean']['input']>;
  nightAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  communityAlert?: InputMaybe<Scalars['Boolean']['input']>;
  emailDigest?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursStart?: InputMaybe<Scalars['Int']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['Int']['input']>;
}>;

export type MutationUpdateMyPushSettingMutation = {
  __typename?: 'Mutation';
  updatePushSetting: boolean;
};

export type QueryGoodPriceSuggestionQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;

export type QueryGoodPriceSuggestionQuery = {
  __typename?: 'Query';
  goodPriceSuggestion?: {
    __typename?: 'WaitSuggestionOutput';
    keyword: string;
    priced: boolean;
    watching: boolean;
    unit: WaitUnit;
    goodPrice?: number | null;
    goodDealCount: number;
    rawMatchCount: number;
    windowDays: number;
  } | null;
};

export type QueryKeywordDealFrequenciesQueryVariables = Exact<{
  keywords: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type QueryKeywordDealFrequenciesQuery = {
  __typename?: 'Query';
  keywordDealFrequencies: Array<{
    __typename?: 'KeywordDealFrequencyOutput';
    keyword: string;
    dealCount: number;
    windowDays: number;
    lastDealAt?: any | null;
    suggestedKeyword?: string | null;
    suggestedDealCount?: number | null;
  }>;
};

export type QueryKeywordBoardQueryVariables = Exact<{
  keywords: Array<Scalars['String']['input']> | Scalars['String']['input'];
  limit: Scalars['Int']['input'];
}>;

export type QueryKeywordBoardQuery = {
  __typename?: 'Query';
  keywordDealFrequencies: Array<{
    __typename?: 'KeywordDealFrequencyOutput';
    keyword: string;
    dealCount: number;
    windowDays: number;
    lastDealAt?: any | null;
    suggestedKeyword?: string | null;
    suggestedDealCount?: number | null;
    weekDealCount: number;
    recentDeals: Array<{
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      price?: string | null;
      thumbnail?: string | null;
      postedAt: any;
      categoryId: number;
      isEnd?: boolean | null;
      isHot?: boolean | null;
      hotDealType?: HotDealType | null;
      mallName?: string | null;
      isYearLowest: boolean;
      priceSaving?: {
        __typename?: 'ProductPriceSaving';
        basis: PriceSavingBasis;
        percent: number;
      } | null;
      provider: {__typename?: 'Provider'; nameKr: string};
    }>;
  }>;
};

export type MutationApplyGoodPriceOnlyMutationVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;

export type MutationApplyGoodPriceOnlyMutation = {
  __typename?: 'Mutation';
  applyGoodPriceOnly: {
    __typename?: 'WaitWatchOutput';
    keyword: string;
    priced: boolean;
  };
};

export type MutationAddPushTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
  tokenType: TokenType;
}>;

export type MutationAddPushTokenMutation = {
  __typename?: 'Mutation';
  addPushToken: boolean;
};

export type MutationRemoveTokenLinkageMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;

export type MutationRemoveTokenLinkageMutation = {
  __typename?: 'Mutation';
  removeTokenLinkage: boolean;
};

export type QueryNotificationsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
}>;

export type QueryNotificationsQuery = {
  __typename?: 'Query';
  notifications: Array<{
    __typename?: 'Notification';
    id: string;
    message: string;
    title?: string | null;
    url?: string | null;
    createdAt: any;
    readAt?: any | null;
    keyword?: string | null;
    product?: {
      __typename?: 'ProductOutput';
      id: string;
      thumbnail?: string | null;
      price?: string | null;
      isHot?: boolean | null;
      isEnd?: boolean | null;
    } | null;
  }>;
};

export type QueryUnreadNotificationsCountQueryVariables = Exact<{
  [key: string]: never;
}>;

export type QueryUnreadNotificationsCountQuery = {
  __typename?: 'Query';
  unreadNotificationsCount: number;
};

export type MutationReadNotificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationReadNotificationMutation = {
  __typename?: 'Mutation';
  readNotification: boolean;
};

export type MutationReadAllNotificationsMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MutationReadAllNotificationsMutation = {
  __typename?: 'Mutation';
  readAllNotifications: boolean;
};

export type MutationRemoveNotificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MutationRemoveNotificationMutation = {
  __typename?: 'Mutation';
  removeNotification: boolean;
};

export type MutationRemoveAllNotificationsMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MutationRemoveAllNotificationsMutation = {
  __typename?: 'Mutation';
  removeAllNotifications: boolean;
};

export type ProductInfoQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductInfoQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    categoryId: number;
    categoryName?: string | null;
    title: string;
    url?: string | null;
    detailUrl?: string | null;
    isProfitUrl: boolean;
    profitLinkProvider?: string | null;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    price?: string | null;
    postedAt: any;
    thumbnail?: string | null;
    uploaderType: UploaderType;
    content?: string | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    viewCount: number;
    mallName?: string | null;
    data?: any | null;
    author?: {__typename?: 'User'; id: string; nickname: string} | null;
    provider: {
      __typename?: 'Provider';
      id: string;
      name: string;
      nameKr: string;
      host?: string | null;
    };
  } | null;
};

export type ProductStatsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductStatsQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    isHot?: boolean | null;
    isEnd?: boolean | null;
    wishlistCount: number;
    isMyLike?: boolean | null;
    isMyReported: boolean;
    likeCount: number;
    isMyWishlist?: boolean | null;
  } | null;
};

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

export type AddUserLikeOrDislikeMutationVariables = Exact<{
  target: UserLikeTarget;
  targetId: Scalars['Int']['input'];
  isLike?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type AddUserLikeOrDislikeMutation = {
  __typename?: 'Mutation';
  addUserLikeOrDislike: boolean;
};

export type ProductPriceHistoryQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  days?: InputMaybe<Scalars['Int']['input']>;
}>;

export type ProductPriceHistoryQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    priceHistory?: {
      __typename?: 'ProductPriceHistory';
      basis: PriceHistoryBasis;
      confidence: PriceHistoryConfidence;
      currency: string;
      disclaimer?: string | null;
      holdout?: boolean | null;
      pointCount: number;
      rangeDays: number;
      sampleCount: number;
      priceAxis?: string | null;
      unitLabel?: string | null;
      points: Array<{
        __typename?: 'PriceHistoryPoint';
        date: string;
        price: number;
        deal: {
          __typename?: 'PriceHistoryDeal';
          id: number;
          title: string;
          displayTitle?: string | null;
          parsedPrice: number;
          price?: string | null;
          priceCurrency?: string | null;
          postedAt: any;
          providerId: number;
          providerName?: string | null;
          thumbnail?: string | null;
          url?: string | null;
          isSeed: boolean;
          categoryId?: number | null;
        };
      }>;
    } | null;
  } | null;
};

export type ProductDealEvidenceQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductDealEvidenceQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    dealEvidence?: {
      __typename?: 'DealEvidence';
      support?: string | null;
      caveat?: string | null;
      condition?: string | null;
      hiddenGuideIds: Array<string>;
      headline?: {
        __typename?: 'DealEvidenceItem';
        kind: DealEvidenceKind;
        strength: DealEvidenceStrength;
        title: string;
        highlight?: string | null;
        detail?: string | null;
      } | null;
    } | null;
  } | null;
};

export type ProductAdditionalInfoQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProductAdditionalInfoQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductOutput';
    id: string;
    url?: string | null;
    provider: {__typename?: 'Provider'; id: string; nameKr: string};
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
  } | null;
};

export type CategorizedReactionKeywordsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type CategorizedReactionKeywordsQuery = {
  __typename?: 'Query';
  categorizedReactionKeywords: {
    __typename?: 'CategorizedReactionKeywordsResponse';
    lastUpdatedAt?: any | null;
    items: Array<{
      __typename?: 'CategorizedReactionKeywords';
      name: string;
      count: number;
      type: HotDealKeywordType;
      role: HotDealKeywordGroupRole;
      tag: string;
    }>;
  };
};

export type CollectProductMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
}>;

export type CollectProductMutation = {
  __typename?: 'Mutation';
  collectProduct: boolean;
};

export type CollectPurchaseClickMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  entry?: InputMaybe<Scalars['String']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
}>;

export type CollectPurchaseClickMutation = {
  __typename?: 'Mutation';
  collectPurchaseClick: boolean;
};

export type CollectPriceContextImpressionMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  detail: Scalars['String']['input'];
}>;

export type CollectPriceContextImpressionMutation = {
  __typename?: 'Mutation';
  collectPriceContextImpression: boolean;
};

export type CollectPriceContextClickMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  detail: Scalars['String']['input'];
}>;

export type CollectPriceContextClickMutation = {
  __typename?: 'Mutation';
  collectPriceContextClick: boolean;
};

export type SameProductDealsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type SameProductDealsQuery = {
  __typename?: 'Query';
  sameProductDeals: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    price?: string | null;
    thumbnail?: string | null;
    isEnd?: boolean | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    categoryId: number;
    mallName?: string | null;
    postedAt: any;
    earliestExpiryDate?: any | null;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; id: string; nameKr: string};
  }>;
};

export type LatestSimilarDealsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type LatestSimilarDealsQuery = {
  __typename?: 'Query';
  latestSimilarDeals: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    price?: string | null;
    thumbnail?: string | null;
    isEnd?: boolean | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    categoryId: number;
    mallName?: string | null;
    postedAt: any;
    earliestExpiryDate?: any | null;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; id: string; nameKr: string};
  }>;
};

export type LiveAlternativeDealsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type LiveAlternativeDealsQuery = {
  __typename?: 'Query';
  liveAlternativeDeals: Array<{
    __typename?: 'LiveAlternativeDealOutput';
    kind: string;
    priceDiff?: number | null;
    product: {
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      price?: string | null;
      thumbnail?: string | null;
      isEnd?: boolean | null;
      hotDealType?: HotDealType | null;
      isYearLowest: boolean;
      categoryId: number;
      mallName?: string | null;
      postedAt: any;
      priceSaving?: {
        __typename?: 'ProductPriceSaving';
        basis: PriceSavingBasis;
        percent: number;
      } | null;
      provider: {__typename?: 'Provider'; id: string; nameKr: string};
    };
  }>;
};

export type CategoryProductsQueryVariables = Exact<{
  categoryIds?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
  limit: Scalars['Int']['input'];
  orderBy?: InputMaybe<ProductOrderType>;
  orderOption?: InputMaybe<OrderOptionType>;
}>;

export type CategoryProductsQuery = {
  __typename?: 'Query';
  products: Array<{
    __typename?: 'ProductOutput';
    id: string;
    title: string;
    price?: string | null;
    thumbnail?: string | null;
    isEnd?: boolean | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    categoryId: number;
    mallName?: string | null;
    postedAt: any;
    earliestExpiryDate?: any | null;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; id: string; nameKr: string};
  }>;
};

export type AddWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type AddWishlistMutation = {
  __typename?: 'Mutation';
  addWishlist: boolean;
};

export type RemoveWishlistMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type RemoveWishlistMutation = {
  __typename?: 'Mutation';
  removeWishlist: boolean;
};

export type AddNotificationKeywordMutationVariables = Exact<{
  keyword: Scalars['String']['input'];
  fromRecommendation?: InputMaybe<Scalars['Boolean']['input']>;
  priceDropOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type AddNotificationKeywordMutation = {
  __typename?: 'Mutation';
  addNotificationKeyword: boolean;
};

export type MyNotificationKeywordsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
}>;

export type MyNotificationKeywordsQuery = {
  __typename?: 'Query';
  notificationKeywordsByMe: Array<{
    __typename?: 'NotificationKeyword';
    id: string;
    keyword: string;
  }>;
};

export type ReportExpiredProductMutationVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;

export type ReportExpiredProductMutation = {
  __typename?: 'Mutation';
  reportExpiredProduct: boolean;
};

export type RecordProductImpressionsMutationVariables = Exact<{
  source: Scalars['String']['input'];
  impressions: Array<ProductImpressionInput> | ProductImpressionInput;
}>;

export type RecordProductImpressionsMutation = {
  __typename?: 'Mutation';
  recordProductImpressions: boolean;
};

export type SearchProductsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  searchAfter?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<ProductOrderType>;
  categoryIds?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
  keyword?: InputMaybe<Scalars['String']['input']>;
  isEnd?: InputMaybe<Scalars['Boolean']['input']>;
  providerIds?: InputMaybe<
    Array<Scalars['Int']['input']> | Scalars['Int']['input']
  >;
}>;

export type SearchProductsQuery = {
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
    mallName?: string | null;
    hotDealType?: HotDealType | null;
    isYearLowest: boolean;
    searchAfter?: Array<string> | null;
    estimatedTotal?: number | null;
    postedAt: any;
    priceSaving?: {
      __typename?: 'ProductPriceSaving';
      basis: PriceSavingBasis;
      percent: number;
    } | null;
    provider: {__typename?: 'Provider'; nameKr: string};
  }>;
};

export type SearchSuggestionsQueryVariables = Exact<{
  prefix: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchSuggestionsQuery = {
  __typename?: 'Query';
  searchSuggestions: Array<string>;
};

export type KeywordHubsQueryVariables = Exact<{[key: string]: never}>;

export type KeywordHubsQuery = {
  __typename?: 'Query';
  keywordHubs: Array<{
    __typename?: 'KeywordHubOutput';
    slug: string;
    name: string;
    aliases: Array<string>;
    excludes: Array<string>;
    recentDealCount: number;
    countCapped: boolean;
    activeDays: number;
    lastDealAt?: any | null;
    topSources: Array<{
      __typename?: 'KeywordHubSourceOutput';
      name: string;
      share: number;
    }>;
  }>;
};

export type KeywordHubQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type KeywordHubQuery = {
  __typename?: 'Query';
  keywordHub?: {
    __typename?: 'KeywordHubDetailOutput';
    hub: {
      __typename?: 'KeywordHubOutput';
      slug: string;
      name: string;
      aliases: Array<string>;
      recentDealCount: number;
      activeDealCount: number;
      countCapped: boolean;
      activeDays: number;
      topSources: Array<{
        __typename?: 'KeywordHubSourceOutput';
        name: string;
        share: number;
      }>;
    };
    deals: Array<{
      __typename?: 'ProductOutput';
      id: string;
      title: string;
      price?: string | null;
      thumbnail?: string | null;
      postedAt: any;
      categoryId: number;
      isEnd?: boolean | null;
      isHot?: boolean | null;
      hotDealType?: HotDealType | null;
      mallName?: string | null;
      postedCommunityCount?: number | null;
      provider: {__typename?: 'Provider'; nameKr: string};
    }>;
    modelPages: Array<{
      __typename?: 'KeywordHubModelPageOutput';
      slug: string;
      brand?: string | null;
      modelName: string;
      dealCount: number;
    }>;
  } | null;
};

export type QueryMeQueryVariables = Exact<{[key: string]: never}>;

export type QueryMeQuery = {
  __typename?: 'Query';
  me?: {__typename?: 'User'; id: string; isGuest: boolean} | null;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>['__apiType']
  >;
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

export const ActiveAdsDocument = new TypedDocumentString(`
    query ActiveAds($slotLocation: AdvertiseSlotLocation!) {
  activeAds(slotLocation: $slotLocation) {
    id
    internalId
    slotType
    slotLocation
    slotPriority
    graphic
    displayTitle
    targetUrl
    isActive
  }
}
    `) as unknown as TypedDocumentString<
  ActiveAdsQuery,
  ActiveAdsQueryVariables
>;
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
    `) as unknown as TypedDocumentString<
  RecordAdClickMutation,
  RecordAdClickMutationVariables
>;
export const MutationLoginDocument = new TypedDocumentString(`
    mutation MutationLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<
  MutationLoginMutation,
  MutationLoginMutationVariables
>;
export const MutationGuestLoginDocument = new TypedDocumentString(`
    mutation MutationGuestLogin {
  guestLogin {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<
  MutationGuestLoginMutation,
  MutationGuestLoginMutationVariables
>;
export const MutationLoginByRefreshTokenDocument = new TypedDocumentString(`
    mutation MutationLoginByRefreshToken {
  loginByRefreshToken {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<
  MutationLoginByRefreshTokenMutation,
  MutationLoginByRefreshTokenMutationVariables
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
export const CategoriesDocument = new TypedDocumentString(`
    query Categories {
  categories {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<
  CategoriesQuery,
  CategoriesQueryVariables
>;
export const MyFavoriteCategoriesDocument = new TypedDocumentString(`
    query MyFavoriteCategories {
  me {
    id
    favoriteCategories
  }
}
    `) as unknown as TypedDocumentString<
  MyFavoriteCategoriesQuery,
  MyFavoriteCategoriesQueryVariables
>;
export const CommentsDocument = new TypedDocumentString(`
    query Comments($productId: Int!, $limit: Int!, $searchAfter: [String!], $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {
  comments(
    productId: $productId
    limit: $limit
    searchAfter: $searchAfter
    orderBy: $orderBy
    orderOption: $orderOption
  ) {
    id
    productId
    parentId
    content
    createdAt
    searchAfter
    likeCount
    isMyLike
    replyCount
    author {
      id
      nickname
    }
  }
}
    `) as unknown as TypedDocumentString<CommentsQuery, CommentsQueryVariables>;
export const AddCommentDocument = new TypedDocumentString(`
    mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {
  addComment(productId: $productId, content: $content, parentId: $parentId)
}
    `) as unknown as TypedDocumentString<
  AddCommentMutation,
  AddCommentMutationVariables
>;
export const UpdateCommentDocument = new TypedDocumentString(`
    mutation UpdateComment($id: Int!, $content: String) {
  updateComment(id: $id, content: $content)
}
    `) as unknown as TypedDocumentString<
  UpdateCommentMutation,
  UpdateCommentMutationVariables
>;
export const RemoveCommentDocument = new TypedDocumentString(`
    mutation RemoveComment($id: Int!) {
  removeComment(id: $id)
}
    `) as unknown as TypedDocumentString<
  RemoveCommentMutation,
  RemoveCommentMutationVariables
>;
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
    `) as unknown as TypedDocumentString<
  CommunityPostsQuery,
  CommunityPostsQueryVariables
>;
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
    `) as unknown as TypedDocumentString<
  CommunityPostQuery,
  CommunityPostQueryVariables
>;
export const CommunityPostCommentsDocument = new TypedDocumentString(`
    query CommunityPostComments($parentId: Int!, $limit: Int!, $searchAfter: [String!], $orderBy: CommentOrder!, $orderOption: OrderOptionType!) {
  comments(
    parentId: $parentId
    limit: $limit
    searchAfter: $searchAfter
    orderBy: $orderBy
    orderOption: $orderOption
  ) {
    id
    content
    createdAt
    searchAfter
    likeCount
    isMyLike
    author {
      id
      nickname
    }
  }
}
    `) as unknown as TypedDocumentString<
  CommunityPostCommentsQuery,
  CommunityPostCommentsQueryVariables
>;
export const AddCommunityCommentDocument = new TypedDocumentString(`
    mutation AddCommunityComment($parentId: Int!, $content: String!) {
  addComment(parentId: $parentId, content: $content)
}
    `) as unknown as TypedDocumentString<
  AddCommunityCommentMutation,
  AddCommunityCommentMutationVariables
>;
export const AddUserReportDocument = new TypedDocumentString(`
    mutation AddUserReport($target: UserReportTarget!, $targetId: Float!, $reason: UserReportReason!, $description: String) {
  addUserReport(
    target: $target
    targetId: $targetId
    reason: $reason
    description: $description
  )
}
    `) as unknown as TypedDocumentString<
  AddUserReportMutation,
  AddUserReportMutationVariables
>;
export const HotDealRankingProductsDocument = new TypedDocumentString(`
    query HotDealRankingProducts($page: Int!, $limit: Int!) {
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
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  HotDealRankingProductsQuery,
  HotDealRankingProductsQueryVariables
>;
export const GuestRecommendedHotDealsDocument = new TypedDocumentString(`
    query GuestRecommendedHotDeals($page: Int!, $limit: Int!) {
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
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  GuestRecommendedHotDealsQuery,
  GuestRecommendedHotDealsQueryVariables
>;
export const HomeProductsByKeywordDocument = new TypedDocumentString(`
    query HomeProductsByKeyword($limit: Int!, $searchAfter: [String!], $keyword: String!, $orderBy: KeywordProductOrderType!, $orderOption: OrderOptionType!) {
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
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    data
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  HomeProductsByKeywordQuery,
  HomeProductsByKeywordQueryVariables
>;
export const HomeProductsDocument = new TypedDocumentString(`
    query HomeProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $orderOption: OrderOptionType, $categoryIds: [Int!], $keyword: String, $thumbnailType: ThumbnailType, $isEnd: Boolean, $isHot: Boolean, $providerIds: [Int!], $mallGroupId: Int) {
  products(
    limit: $limit
    searchAfter: $searchAfter
    startDate: $startDate
    orderBy: $orderBy
    orderOption: $orderOption
    categoryIds: $categoryIds
    keyword: $keyword
    thumbnailType: $thumbnailType
    isEnd: $isEnd
    isHot: $isHot
    providerIds: $providerIds
    mallGroupId: $mallGroupId
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
    mallName
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    searchAfter
    postedCommunityCount
    isRising
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  HomeProductsQuery,
  HomeProductsQueryVariables
>;
export const ExpiringSoonHotDealProductsDocument = new TypedDocumentString(`
    query ExpiringSoonHotDealProducts($daysUntilExpiry: Int!, $limit: Int!, $searchAfter: [String!]) {
  expiringSoonHotDealProducts(
    daysUntilExpiry: $daysUntilExpiry
    limit: $limit
    searchAfter: $searchAfter
  ) {
    id
    title
    mallId
    mallName
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    searchAfter
    postedAt
    earliestExpiryDate
  }
}
    `) as unknown as TypedDocumentString<
  ExpiringSoonHotDealProductsQuery,
  ExpiringSoonHotDealProductsQueryVariables
>;
export const CommunityProvidersDocument = new TypedDocumentString(`
    query CommunityProviders {
  communityProviders {
    id
    name
    nameKr
  }
}
    `) as unknown as TypedDocumentString<
  CommunityProvidersQuery,
  CommunityProvidersQueryVariables
>;
export const MallGroupsDocument = new TypedDocumentString(`
    query MallGroups {
  mallGroups {
    id
    title
    isActive
    sort
  }
}
    `) as unknown as TypedDocumentString<
  MallGroupsQuery,
  MallGroupsQueryVariables
>;
export const RecommendedNotificationKeywordsDocument = new TypedDocumentString(`
    query RecommendedNotificationKeywords {
  recommendedNotificationKeywords
}
    `) as unknown as TypedDocumentString<
  RecommendedNotificationKeywordsQuery,
  RecommendedNotificationKeywordsQueryVariables
>;
export const TossCategoryLabelsDocument = new TypedDocumentString(`
    query TossCategoryLabels {
  tossCategoryLabels
}
    `) as unknown as TypedDocumentString<
  TossCategoryLabelsQuery,
  TossCategoryLabelsQueryVariables
>;
export const TossProductsDocument = new TypedDocumentString(`
    query TossProducts($limit: Int!, $searchAfter: [String!], $keyword: String!, $orderBy: KeywordProductOrderType!, $orderOption: OrderOptionType!, $tossCategoryLabel: String) {
  productsByKeyword(
    limit: $limit
    searchAfter: $searchAfter
    keyword: $keyword
    orderBy: $orderBy
    orderOption: $orderOption
    tossCategoryLabel: $tossCategoryLabel
  ) {
    id
    title
    price
    thumbnail
    data
    searchAfter
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  TossProductsQuery,
  TossProductsQueryVariables
>;
export const CommunityRandomRankingProductsDocument = new TypedDocumentString(`
    query CommunityRandomRankingProducts($count: Int!, $limit: Int!) {
  communityRandomRankingProducts(count: $count, limit: $limit) {
    id
    title
    mallId
    mallName
    url
    isHot
    isEnd
    price
    providerId
    categoryId
    category
    thumbnail
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  CommunityRandomRankingProductsQuery,
  CommunityRandomRankingProductsQueryVariables
>;
export const QueryMyProfileDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<
  QueryMyProfileQuery,
  QueryMyProfileQueryVariables
>;
export const MutationUpdateMyProfileDocument = new TypedDocumentString(`
    mutation MutationUpdateMyProfile($nickname: String, $birthYear: Float, $gender: Gender, $favoriteCategories: [Int!]) {
  updateUserProfile(
    nickname: $nickname
    birthYear: $birthYear
    gender: $gender
    favoriteCategories: $favoriteCategories
  )
}
    `) as unknown as TypedDocumentString<
  MutationUpdateMyProfileMutation,
  MutationUpdateMyProfileMutationVariables
>;
export const MutationUpdateMyPasswordDocument = new TypedDocumentString(`
    mutation MutationUpdateMyPassword($password: String!) {
  updatePassword(password: $password)
}
    `) as unknown as TypedDocumentString<
  MutationUpdateMyPasswordMutation,
  MutationUpdateMyPasswordMutationVariables
>;
export const MutationWithdrawDocument = new TypedDocumentString(`
    mutation MutationWithdraw {
  withdraw
}
    `) as unknown as TypedDocumentString<
  MutationWithdrawMutation,
  MutationWithdrawMutationVariables
>;
export const QueryMyNotificationKeywordsDocument = new TypedDocumentString(`
    query QueryMyNotificationKeywords($limit: Int!) {
  notificationKeywordsByMe(limit: $limit) {
    id
    keyword
    priceDropOnly
    minPrice
    maxPrice
    excludeKeywords
  }
}
    `) as unknown as TypedDocumentString<
  QueryMyNotificationKeywordsQuery,
  QueryMyNotificationKeywordsQueryVariables
>;
export const MutationAddMyNotificationKeywordDocument =
  new TypedDocumentString(`
    mutation MutationAddMyNotificationKeyword($keyword: String!, $fromRecommendation: Boolean, $priceDropOnly: Boolean) {
  addNotificationKeyword(
    keyword: $keyword
    fromRecommendation: $fromRecommendation
    priceDropOnly: $priceDropOnly
  )
}
    `) as unknown as TypedDocumentString<
    MutationAddMyNotificationKeywordMutation,
    MutationAddMyNotificationKeywordMutationVariables
  >;
export const MutationRemoveMyNotificationKeywordDocument =
  new TypedDocumentString(`
    mutation MutationRemoveMyNotificationKeyword($id: Float!) {
  removeNotificationKeyword(id: $id)
}
    `) as unknown as TypedDocumentString<
    MutationRemoveMyNotificationKeywordMutation,
    MutationRemoveMyNotificationKeywordMutationVariables
  >;
export const MutationUpdateKeywordPriceDropOnlyDocument =
  new TypedDocumentString(`
    mutation MutationUpdateKeywordPriceDropOnly($id: Int!, $priceDropOnly: Boolean!) {
  updateNotificationKeywordPriceDropOnly(id: $id, priceDropOnly: $priceDropOnly)
}
    `) as unknown as TypedDocumentString<
    MutationUpdateKeywordPriceDropOnlyMutation,
    MutationUpdateKeywordPriceDropOnlyMutationVariables
  >;
export const QueryMyWishlistsDocument = new TypedDocumentString(`
    query QueryMyWishlists($orderBy: WishlistOrderType!, $orderOption: OrderOptionType!, $limit: Int!, $searchAfter: [String!]) {
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
      isYearLowest
      priceSaving {
        basis
        percent
      }
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
    `) as unknown as TypedDocumentString<
  QueryMyWishlistsQuery,
  QueryMyWishlistsQueryVariables
>;
export const QueryMyWishlistCountDocument = new TypedDocumentString(`
    query QueryMyWishlistCount {
  wishlistCount
}
    `) as unknown as TypedDocumentString<
  QueryMyWishlistCountQuery,
  QueryMyWishlistCountQueryVariables
>;
export const MutationAddMyWishlistDocument = new TypedDocumentString(`
    mutation MutationAddMyWishlist($productId: Int!) {
  addWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  MutationAddMyWishlistMutation,
  MutationAddMyWishlistMutationVariables
>;
export const MutationRemoveMyWishlistDocument = new TypedDocumentString(`
    mutation MutationRemoveMyWishlist($productId: Int!) {
  removeWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveMyWishlistMutation,
  MutationRemoveMyWishlistMutationVariables
>;
export const QueryNotificationThemesDocument = new TypedDocumentString(`
    query QueryNotificationThemes {
  notificationThemes {
    id
    name
    description
    emoji
    representativeKeywords
    keywords
    excludeKeywords
    weeklyAlertCount
  }
}
    `) as unknown as TypedDocumentString<
  QueryNotificationThemesQuery,
  QueryNotificationThemesQueryVariables
>;
export const QueryMySubscribedThemeIdsDocument = new TypedDocumentString(`
    query QueryMySubscribedThemeIds {
  mySubscribedThemeIds
}
    `) as unknown as TypedDocumentString<
  QueryMySubscribedThemeIdsQuery,
  QueryMySubscribedThemeIdsQueryVariables
>;
export const QueryNotificationThemeLiveDealsDocument = new TypedDocumentString(`
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
    isYearLowest
    priceSaving {
      basis
      percent
    }
    mallName
    provider {
      nameKr
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryNotificationThemeLiveDealsQuery,
  QueryNotificationThemeLiveDealsQueryVariables
>;
export const MutationSubscribeNotificationThemeDocument =
  new TypedDocumentString(`
    mutation MutationSubscribeNotificationTheme($themeId: Int!) {
  subscribeNotificationTheme(themeId: $themeId)
}
    `) as unknown as TypedDocumentString<
    MutationSubscribeNotificationThemeMutation,
    MutationSubscribeNotificationThemeMutationVariables
  >;
export const MutationUnsubscribeNotificationThemeDocument =
  new TypedDocumentString(`
    mutation MutationUnsubscribeNotificationTheme($themeId: Int!) {
  unsubscribeNotificationTheme(themeId: $themeId)
}
    `) as unknown as TypedDocumentString<
    MutationUnsubscribeNotificationThemeMutation,
    MutationUnsubscribeNotificationThemeMutationVariables
  >;
export const MutationUpdateKeywordPriceRangeDocument = new TypedDocumentString(`
    mutation MutationUpdateKeywordPriceRange($id: Int!, $minPrice: Int, $maxPrice: Int) {
  updateNotificationKeywordPriceRange(
    id: $id
    minPrice: $minPrice
    maxPrice: $maxPrice
  )
}
    `) as unknown as TypedDocumentString<
  MutationUpdateKeywordPriceRangeMutation,
  MutationUpdateKeywordPriceRangeMutationVariables
>;
export const MutationUpdateKeywordExcludeKeywordsDocument =
  new TypedDocumentString(`
    mutation MutationUpdateKeywordExcludeKeywords($id: Int!, $excludeKeywords: [String!]!) {
  updateNotificationKeywordExcludeKeywords(
    id: $id
    excludeKeywords: $excludeKeywords
  )
}
    `) as unknown as TypedDocumentString<
    MutationUpdateKeywordExcludeKeywordsMutation,
    MutationUpdateKeywordExcludeKeywordsMutationVariables
  >;
export const QueryMyPushSettingDocument = new TypedDocumentString(`
    query QueryMyPushSetting {
  pushSetting {
    keywordAlert
    keywordAlertLevel
    marketing
    nightAlerts
    communityAlert
    emailDigest
    quietHoursStart
    quietHoursEnd
  }
}
    `) as unknown as TypedDocumentString<
  QueryMyPushSettingQuery,
  QueryMyPushSettingQueryVariables
>;
export const MutationUpdateMyPushSettingDocument = new TypedDocumentString(`
    mutation MutationUpdateMyPushSetting($keywordAlert: Boolean, $keywordAlertLevel: KeywordAlertLevel, $marketing: Boolean, $nightAlerts: Boolean, $communityAlert: Boolean, $emailDigest: Boolean, $quietHoursStart: Int, $quietHoursEnd: Int) {
  updatePushSetting(
    keywordAlert: $keywordAlert
    keywordAlertLevel: $keywordAlertLevel
    marketing: $marketing
    nightAlerts: $nightAlerts
    communityAlert: $communityAlert
    emailDigest: $emailDigest
    quietHoursStart: $quietHoursStart
    quietHoursEnd: $quietHoursEnd
  )
}
    `) as unknown as TypedDocumentString<
  MutationUpdateMyPushSettingMutation,
  MutationUpdateMyPushSettingMutationVariables
>;
export const QueryGoodPriceSuggestionDocument = new TypedDocumentString(`
    query QueryGoodPriceSuggestion($keyword: String!) {
  goodPriceSuggestion(keyword: $keyword) {
    keyword
    priced
    watching
    unit
    goodPrice
    goodDealCount
    rawMatchCount
    windowDays
  }
}
    `) as unknown as TypedDocumentString<
  QueryGoodPriceSuggestionQuery,
  QueryGoodPriceSuggestionQueryVariables
>;
export const QueryKeywordDealFrequenciesDocument = new TypedDocumentString(`
    query QueryKeywordDealFrequencies($keywords: [String!]!) {
  keywordDealFrequencies(keywords: $keywords) {
    keyword
    dealCount
    windowDays
    lastDealAt
    suggestedKeyword
    suggestedDealCount
  }
}
    `) as unknown as TypedDocumentString<
  QueryKeywordDealFrequenciesQuery,
  QueryKeywordDealFrequenciesQueryVariables
>;
export const QueryKeywordBoardDocument = new TypedDocumentString(`
    query QueryKeywordBoard($keywords: [String!]!, $limit: Int!) {
  keywordDealFrequencies(keywords: $keywords) {
    keyword
    dealCount
    windowDays
    lastDealAt
    suggestedKeyword
    suggestedDealCount
    weekDealCount
    recentDeals(limit: $limit) {
      id
      title
      price
      thumbnail
      postedAt
      categoryId
      isEnd
      isHot
      hotDealType
      mallName
      isYearLowest
      priceSaving {
        basis
        percent
      }
      provider {
        nameKr
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryKeywordBoardQuery,
  QueryKeywordBoardQueryVariables
>;
export const MutationApplyGoodPriceOnlyDocument = new TypedDocumentString(`
    mutation MutationApplyGoodPriceOnly($keyword: String!) {
  applyGoodPriceOnly(keyword: $keyword) {
    keyword
    priced
  }
}
    `) as unknown as TypedDocumentString<
  MutationApplyGoodPriceOnlyMutation,
  MutationApplyGoodPriceOnlyMutationVariables
>;
export const MutationAddPushTokenDocument = new TypedDocumentString(`
    mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
  addPushToken(token: $token, tokenType: $tokenType)
}
    `) as unknown as TypedDocumentString<
  MutationAddPushTokenMutation,
  MutationAddPushTokenMutationVariables
>;
export const MutationRemoveTokenLinkageDocument = new TypedDocumentString(`
    mutation MutationRemoveTokenLinkage($token: String!) {
  removeTokenLinkage(token: $token)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveTokenLinkageMutation,
  MutationRemoveTokenLinkageMutationVariables
>;
export const QueryNotificationsDocument = new TypedDocumentString(`
    query QueryNotifications($limit: Int!, $offset: Int!) {
  notifications(limit: $limit, offset: $offset) {
    id
    message
    title
    url
    createdAt
    readAt
    keyword
    product {
      id
      thumbnail
      price
      isHot
      isEnd
    }
  }
}
    `) as unknown as TypedDocumentString<
  QueryNotificationsQuery,
  QueryNotificationsQueryVariables
>;
export const QueryUnreadNotificationsCountDocument = new TypedDocumentString(`
    query QueryUnreadNotificationsCount {
  unreadNotificationsCount
}
    `) as unknown as TypedDocumentString<
  QueryUnreadNotificationsCountQuery,
  QueryUnreadNotificationsCountQueryVariables
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
export const MutationRemoveNotificationDocument = new TypedDocumentString(`
    mutation MutationRemoveNotification($id: Int!) {
  removeNotification(id: $id)
}
    `) as unknown as TypedDocumentString<
  MutationRemoveNotificationMutation,
  MutationRemoveNotificationMutationVariables
>;
export const MutationRemoveAllNotificationsDocument = new TypedDocumentString(`
    mutation MutationRemoveAllNotifications {
  removeAllNotifications
}
    `) as unknown as TypedDocumentString<
  MutationRemoveAllNotificationsMutation,
  MutationRemoveAllNotificationsMutationVariables
>;
export const ProductInfoDocument = new TypedDocumentString(`
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
    isYearLowest
    viewCount
    mallName
    data
  }
}
    `) as unknown as TypedDocumentString<
  ProductInfoQuery,
  ProductInfoQueryVariables
>;
export const ProductStatsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<
  ProductStatsQuery,
  ProductStatsQueryVariables
>;
export const ProductGuidesDocument = new TypedDocumentString(`
    query ProductGuides($productId: Int!) {
  productGuides(productId: $productId) {
    id
    title
    content
  }
}
    `) as unknown as TypedDocumentString<
  ProductGuidesQuery,
  ProductGuidesQueryVariables
>;
export const AddUserLikeOrDislikeDocument = new TypedDocumentString(`
    mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {
  addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
}
    `) as unknown as TypedDocumentString<
  AddUserLikeOrDislikeMutation,
  AddUserLikeOrDislikeMutationVariables
>;
export const ProductPriceHistoryDocument = new TypedDocumentString(`
    query ProductPriceHistory($id: Int!, $days: Int) {
  product(id: $id) {
    id
    priceHistory(days: $days) {
      basis
      confidence
      currency
      disclaimer
      holdout
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
    `) as unknown as TypedDocumentString<
  ProductPriceHistoryQuery,
  ProductPriceHistoryQueryVariables
>;
export const ProductDealEvidenceDocument = new TypedDocumentString(`
    query ProductDealEvidence($id: Int!) {
  product(id: $id) {
    id
    dealEvidence {
      headline {
        kind
        strength
        title
        highlight
        detail
      }
      support
      caveat
      condition
      hiddenGuideIds
    }
  }
}
    `) as unknown as TypedDocumentString<
  ProductDealEvidenceQuery,
  ProductDealEvidenceQueryVariables
>;
export const ProductAdditionalInfoDocument = new TypedDocumentString(`
    query ProductAdditionalInfo($id: Int!) {
  product(id: $id) {
    id
    url
    provider {
      id
      nameKr
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
}
    `) as unknown as TypedDocumentString<
  ProductAdditionalInfoQuery,
  ProductAdditionalInfoQueryVariables
>;
export const CategorizedReactionKeywordsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<
  CategorizedReactionKeywordsQuery,
  CategorizedReactionKeywordsQueryVariables
>;
export const CollectProductDocument = new TypedDocumentString(`
    mutation CollectProduct($productId: Int!, $source: String, $position: Int, $nid: String) {
  collectProduct(
    productId: $productId
    source: $source
    position: $position
    nid: $nid
  )
}
    `) as unknown as TypedDocumentString<
  CollectProductMutation,
  CollectProductMutationVariables
>;
export const CollectPurchaseClickDocument = new TypedDocumentString(`
    mutation CollectPurchaseClick($productId: Int!, $source: String, $entry: String, $nid: String) {
  collectPurchaseClick(
    productId: $productId
    source: $source
    entry: $entry
    nid: $nid
  )
}
    `) as unknown as TypedDocumentString<
  CollectPurchaseClickMutation,
  CollectPurchaseClickMutationVariables
>;
export const CollectPriceContextImpressionDocument = new TypedDocumentString(`
    mutation CollectPriceContextImpression($productId: Int!, $source: String, $detail: String!) {
  collectPriceContextImpression(
    productId: $productId
    source: $source
    detail: $detail
  )
}
    `) as unknown as TypedDocumentString<
  CollectPriceContextImpressionMutation,
  CollectPriceContextImpressionMutationVariables
>;
export const CollectPriceContextClickDocument = new TypedDocumentString(`
    mutation CollectPriceContextClick($productId: Int!, $source: String, $detail: String!) {
  collectPriceContextClick(
    productId: $productId
    source: $source
    detail: $detail
  )
}
    `) as unknown as TypedDocumentString<
  CollectPriceContextClickMutation,
  CollectPriceContextClickMutationVariables
>;
export const SameProductDealsDocument = new TypedDocumentString(`
    query SameProductDeals($id: Int!) {
  sameProductDeals(id: $id) {
    id
    title
    price
    thumbnail
    isEnd
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
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
    `) as unknown as TypedDocumentString<
  SameProductDealsQuery,
  SameProductDealsQueryVariables
>;
export const LatestSimilarDealsDocument = new TypedDocumentString(`
    query LatestSimilarDeals($id: Int!, $limit: Int!) {
  latestSimilarDeals(id: $id, limit: $limit) {
    id
    title
    price
    thumbnail
    isEnd
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
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
    `) as unknown as TypedDocumentString<
  LatestSimilarDealsQuery,
  LatestSimilarDealsQueryVariables
>;
export const LiveAlternativeDealsDocument = new TypedDocumentString(`
    query LiveAlternativeDeals($id: Int!, $limit: Int!) {
  liveAlternativeDeals(id: $id, limit: $limit) {
    kind
    priceDiff
    product {
      id
      title
      price
      thumbnail
      isEnd
      hotDealType
      isYearLowest
      priceSaving {
        basis
        percent
      }
      categoryId
      mallName
      postedAt
      provider {
        id
        nameKr
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  LiveAlternativeDealsQuery,
  LiveAlternativeDealsQueryVariables
>;
export const CategoryProductsDocument = new TypedDocumentString(`
    query CategoryProducts($categoryIds: [Int!], $limit: Int!, $orderBy: ProductOrderType, $orderOption: OrderOptionType) {
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
    isYearLowest
    priceSaving {
      basis
      percent
    }
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
    `) as unknown as TypedDocumentString<
  CategoryProductsQuery,
  CategoryProductsQueryVariables
>;
export const AddWishlistDocument = new TypedDocumentString(`
    mutation AddWishlist($productId: Int!) {
  addWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  AddWishlistMutation,
  AddWishlistMutationVariables
>;
export const RemoveWishlistDocument = new TypedDocumentString(`
    mutation RemoveWishlist($productId: Int!) {
  removeWishlist(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  RemoveWishlistMutation,
  RemoveWishlistMutationVariables
>;
export const AddNotificationKeywordDocument = new TypedDocumentString(`
    mutation AddNotificationKeyword($keyword: String!, $fromRecommendation: Boolean, $priceDropOnly: Boolean) {
  addNotificationKeyword(
    keyword: $keyword
    fromRecommendation: $fromRecommendation
    priceDropOnly: $priceDropOnly
  )
}
    `) as unknown as TypedDocumentString<
  AddNotificationKeywordMutation,
  AddNotificationKeywordMutationVariables
>;
export const MyNotificationKeywordsDocument = new TypedDocumentString(`
    query MyNotificationKeywords($limit: Int!) {
  notificationKeywordsByMe(limit: $limit) {
    id
    keyword
  }
}
    `) as unknown as TypedDocumentString<
  MyNotificationKeywordsQuery,
  MyNotificationKeywordsQueryVariables
>;
export const ReportExpiredProductDocument = new TypedDocumentString(`
    mutation ReportExpiredProduct($productId: Int!) {
  reportExpiredProduct(productId: $productId)
}
    `) as unknown as TypedDocumentString<
  ReportExpiredProductMutation,
  ReportExpiredProductMutationVariables
>;
export const RecordProductImpressionsDocument = new TypedDocumentString(`
    mutation RecordProductImpressions($source: String!, $impressions: [ProductImpressionInput!]!) {
  recordProductImpressions(source: $source, impressions: $impressions)
}
    `) as unknown as TypedDocumentString<
  RecordProductImpressionsMutation,
  RecordProductImpressionsMutationVariables
>;
export const SearchProductsDocument = new TypedDocumentString(`
    query SearchProducts($limit: Int!, $searchAfter: [String!], $startDate: DateTime, $orderBy: ProductOrderType, $categoryIds: [Int!], $keyword: String, $isEnd: Boolean, $providerIds: [Int!]) {
  products(
    limit: $limit
    searchAfter: $searchAfter
    startDate: $startDate
    orderBy: $orderBy
    categoryIds: $categoryIds
    keyword: $keyword
    isEnd: $isEnd
    providerIds: $providerIds
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
    mallName
    hotDealType
    isYearLowest
    priceSaving {
      basis
      percent
    }
    provider {
      nameKr
    }
    searchAfter
    estimatedTotal
    postedAt
  }
}
    `) as unknown as TypedDocumentString<
  SearchProductsQuery,
  SearchProductsQueryVariables
>;
export const SearchSuggestionsDocument = new TypedDocumentString(`
    query SearchSuggestions($prefix: String!, $limit: Int) {
  searchSuggestions(prefix: $prefix, limit: $limit)
}
    `) as unknown as TypedDocumentString<
  SearchSuggestionsQuery,
  SearchSuggestionsQueryVariables
>;
export const KeywordHubsDocument = new TypedDocumentString(`
    query KeywordHubs {
  keywordHubs {
    slug
    name
    aliases
    excludes
    recentDealCount
    countCapped
    activeDays
    lastDealAt
    topSources {
      name
      share
    }
  }
}
    `) as unknown as TypedDocumentString<
  KeywordHubsQuery,
  KeywordHubsQueryVariables
>;
export const KeywordHubDocument = new TypedDocumentString(`
    query KeywordHub($slug: String!) {
  keywordHub(slug: $slug) {
    hub {
      slug
      name
      aliases
      recentDealCount
      activeDealCount
      countCapped
      activeDays
      topSources {
        name
        share
      }
    }
    deals {
      id
      title
      price
      thumbnail
      postedAt
      categoryId
      isEnd
      isHot
      hotDealType
      mallName
      postedCommunityCount
      provider {
        nameKr
      }
    }
    modelPages {
      slug
      brand
      modelName
      dealCount
    }
  }
}
    `) as unknown as TypedDocumentString<
  KeywordHubQuery,
  KeywordHubQueryVariables
>;
export const QueryMeDocument = new TypedDocumentString(`
    query QueryMe {
  me {
    id
    isGuest
  }
}
    `) as unknown as TypedDocumentString<QueryMeQuery, QueryMeQueryVariables>;
