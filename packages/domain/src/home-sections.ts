/**
 * 홈 SDUI 섹션 — 모델·서버 응답 매핑·폴백 카탈로그·id 찾기. web·앱이 같은 홈을 그리려고 이 한 곳을 쓴다.
 *
 * 전엔 web(entities/promotion)과 앱(entities/home)이 같은 코드를 따로 들고, 앱 테스트가 web 소스를 읽어
 * 섹션 id·타입 목록을 대조했다(home-sdui). 이제 정본은 여기고 두 앱은 import 만 한다(2026-10-20).
 *
 * 섹션 구성은 서버(homePage)가 주는 데이터다 — 폴백 카탈로그는 서버가 실패·구스키마일 때만 쓴다.
 * GraphQL enum 은 앱마다 codegen 이 따로라 문자열 값으로 적는다(POSTED_AT·DESC·EXPIRING_SOON).
 */

/** 서버 홈 응답(homePage.sections)의 섹션 한 칸(재귀). */
export type ServerHomeSection = {
  id: string;
  title: string;
  type: string;
  displayOrder?: number | null;
  viewMoreLink?: string | null;
  dataSource?: {
    type: string;
    queryName: string;
    variables?: Record<string, unknown> | null;
  } | null;
  tabs?: Array<{
    id: string;
    label: string;
    variables?: Record<string, unknown> | null;
    viewMoreLink?: string | null;
  }> | null;
  sections?: ServerHomeSection[] | null;
};

/** LIST 섹션이 그리는 최대 개수(서버가 더 줘도). */
export const LIST_SECTION_MAX = 4;

/** 홈 섹션이 그리는 모양. web·앱 렌더러가 이 목록을 전부 다룬다(각자 switch 가 never 로 막는다). */
export const CONTENT_SECTION_TYPES = [
  'GRID',
  'HORIZONTAL_SCROLL',
  'LIST',
  'DOUBLE_ROW',
  'GRID_TABBED',
  'PAGINATED_GRID',
] as const;

export type ContentPromotionSectionType = (typeof CONTENT_SECTION_TYPES)[number];

export type PromotionSectionType = ContentPromotionSectionType | 'GROUP' | 'TOSS';

export type PromotionQueryName =
  | 'hotDealRankingProducts'
  | 'guestRecommendedHotDeals'
  | 'productsByKeyword'
  | 'products'
  | 'expiringSoonHotDealProducts';

export type PromotionDataSource = {
  type: 'GRAPHQL_QUERY';
  queryName: PromotionQueryName;
  variables: Record<string, unknown>;
};

export interface PromotionTab {
  id: string;
  label: string;
  variables: Record<string, unknown>;
  viewMoreLink?: string;
}

interface BasePromotionSection {
  id: string;
  title: string;
  subTitle?: string;
  displayOrder: number;
}

export interface ContentPromotionSection extends BasePromotionSection {
  type: ContentPromotionSectionType;
  dataSource: PromotionDataSource;
  tabs?: PromotionTab[];
  viewMoreLink?: string;
}

export interface GroupPromotionSection extends BasePromotionSection {
  type: 'GROUP';
  sections: ContentPromotionSection[];
}

export interface TossPromotionSection extends BasePromotionSection {
  type: 'TOSS';
  viewMoreLink?: string;
}

export type PromotionSection =
  ContentPromotionSection | GroupPromotionSection | TossPromotionSection;

const CONTENT_TYPES = new Set<string>(CONTENT_SECTION_TYPES);

export function mapHomePageSections(
  raw: ServerHomeSection[] | undefined | null,
): PromotionSection[] {
  if (!raw?.length) return [];
  return raw.map(mapHomePageSection).filter((s): s is PromotionSection => s != null);
}

function mapHomePageSection(raw: ServerHomeSection): PromotionSection | null {
  if (!raw?.id || !raw.type) return null;

  if (raw.type === 'TOSS') {
    const toss: TossPromotionSection = {
      id: raw.id,
      title: raw.title,
      type: 'TOSS',
      displayOrder: raw.displayOrder ?? 0,
      viewMoreLink: raw.viewMoreLink ?? undefined,
    };
    return toss;
  }

  if (raw.type === 'GROUP') {
    const group: GroupPromotionSection = {
      id: raw.id,
      title: raw.title,
      type: 'GROUP',
      displayOrder: raw.displayOrder ?? 0,
      sections: (raw.sections ?? [])
        .map(mapHomePageSection)
        .filter(
          (s): s is ContentPromotionSection => s != null && s.type !== 'GROUP' && s.type !== 'TOSS',
        ),
    };
    return group;
  }

  if (!CONTENT_TYPES.has(raw.type) || !raw.dataSource?.queryName) return null;

  const queryName = raw.dataSource.queryName as ContentPromotionSection['dataSource']['queryName'];
  const section: ContentPromotionSection = {
    id: raw.id,
    title: raw.title,
    type: raw.type as ContentPromotionSection['type'],
    displayOrder: raw.displayOrder ?? 0,
    viewMoreLink: raw.viewMoreLink ?? undefined,
    dataSource: {
      type: 'GRAPHQL_QUERY',
      queryName,
      variables: raw.dataSource.variables ?? {},
    },
    tabs: raw.tabs?.map((tab) => ({
      id: tab.id,
      label: tab.label,
      variables: tab.variables ?? {},
      viewMoreLink: tab.viewMoreLink ?? undefined,
    })),
  };
  return section;
}

export interface PromotionTabSources {
  communityProviders: Array<{
    id: string;
    name: string;
    nameKr?: string | null;
  }>;
  mallGroups: Array<{
    id: number;
    title: string;
    isActive: boolean;
    sort?: number | null;
  }>;
}

export function buildFallbackPromotionSections({
  communityProviders,
  mallGroups,
}: PromotionTabSources): PromotionSection[] {
  const communityProviderTabs: PromotionTab[] = [];
  communityProviders.forEach((provider) => {
    const providerId = Number(provider.id);
    if (!Number.isFinite(providerId)) return;
    communityProviderTabs.push({
      id: `provider-${provider.id}`,
      label: provider.nameKr ?? provider.name,
      // 스키마엔 복수형(providerIds)만 있다. 예전 web 은 단수 providerId 를 보냈고 운영 API 가 미선언 인자를
      // 받아줘서 동작했을 뿐이다(결과 동일 실측: providerIds:[2] === providerId:2).
      variables: { providerIds: [providerId] },
      viewMoreLink: `/curation/provider-${provider.id}`,
    });
  });

  const mallGroupTabs: PromotionTab[] = [];
  mallGroups
    .filter((mallGroup) => mallGroup.isActive)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .forEach((mallGroup) => {
      const mallGroupId = Math.trunc(mallGroup.id);
      if (!Number.isFinite(mallGroupId)) return;
      mallGroupTabs.push({
        id: `mall-group-${mallGroup.id}`,
        label: mallGroup.title,
        variables: { mallGroupId },
        viewMoreLink: `/curation/mall-group-${mallGroup.id}`,
      });
    });

  const hasCommunityTabs = communityProviderTabs.length > 0;
  const hasMallGroupTabs = mallGroupTabs.length > 0;

  return [
    {
      id: 'toss',
      title: '토스 특가',
      type: 'TOSS',
      displayOrder: 0,
      viewMoreLink: '/toss',
    },
    {
      // 정해진 시각에만 열리는 딜(토스 하루특가 = 토스 앱 「매일 밤 12시 선착순특가」 + 시각·선착순이 적힌
      // 커뮤니티 글). 고르는 규칙은 crawling-server product/time-deal.logic.
      id: 'time-deal',
      title: '선착순·타임특가',
      type: 'HORIZONTAL_SCROLL',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'productsByKeyword',
        variables: {
          keyword: '타임특가',
          limit: 10,
          orderBy: 'POSTED_AT',
          orderOption: 'DESC',
        },
      },
      displayOrder: 0.5,
      viewMoreLink: '/curation/time-deal',
    },
    {
      // 해외직구 시즌(서버 달력 — 기본 광군제 11/11 ~ 12/10 KST, env 로 바뀜)에만 채워지는 해외직구 딜. 서버가 기간 밖엔
      // 카탈로그에서 빼고 빈 배열을 주므로(crawling-server product/overseas-sale.logic) 여기 폴백 카탈로그에선 비면 숨긴다.
      // 제목은 서버 카탈로그가 날짜에 따라 «광군제 → 블프 → 12.12 직구 특가»로 바꾼다 — 폴백은 날짜를 모르니 중립 문구.
      id: 'overseas-sale',
      title: '해외직구 특가',
      type: 'HORIZONTAL_SCROLL',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'productsByKeyword',
        variables: {
          keyword: '해외직구세일',
          limit: 10,
          orderBy: 'POSTED_AT',
          orderOption: 'DESC',
        },
      },
      displayOrder: 0.6,
      viewMoreLink: '/curation/overseas-sale',
    },
    {
      id: 'hotdeal',
      title: '놓치면 아까운 핫딜',
      type: 'PAGINATED_GRID',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'hotDealRankingProducts',
        variables: { page: 0, limit: 20 },
      },
      displayOrder: 1,
      viewMoreLink: '/curation/hotdeal',
    },
    {
      id: 'guest-recommended',
      title: '내 취향 저격 핫딜',
      type: 'PAGINATED_GRID',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'guestRecommendedHotDeals',
        variables: { page: 0, limit: 20 },
      },
      displayOrder: 1.5,
      viewMoreLink: '/curation/guest-recommended',
    },
    {
      id: 'under-10000',
      title: '부담없이 만원이하템',
      type: 'HORIZONTAL_SCROLL',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'productsByKeyword',
        variables: {
          keyword: '만원이하',
          limit: 10,
          orderBy: 'POSTED_AT',
          orderOption: 'DESC',
        },
      },
      displayOrder: 2,
      viewMoreLink: '/curation/under-10000',
    },
    {
      id: 'group-1',
      title: '그룹 섹션',
      type: 'GROUP',
      displayOrder: 2,
      sections: [
        {
          id: 'impending',
          title: '유통기한 임박 특가',
          type: 'DOUBLE_ROW',
          dataSource: {
            type: 'GRAPHQL_QUERY',
            queryName: 'expiringSoonHotDealProducts',
            variables: {
              daysUntilExpiry: 7,
              limit: 10,
              orderBy: 'EXPIRING_SOON',
              orderOption: 'DESC',
            },
          },
          displayOrder: 1,
          viewMoreLink: '/curation/impending',
        },
        {
          id: 'premium',
          title: '프리미엄 핫딜',
          type: 'LIST',
          dataSource: {
            type: 'GRAPHQL_QUERY',
            queryName: 'productsByKeyword',
            variables: {
              keyword: '백만원이상',
              limit: 4,
              orderBy: 'POSTED_AT',
              orderOption: 'DESC',
            },
          },
          displayOrder: 2,
          viewMoreLink: '/curation/premium',
        },
      ],
    },
    {
      id: 'mall',
      title: '쇼핑몰별 모아보기',
      type: 'GRID_TABBED',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: hasMallGroupTabs ? 'products' : 'productsByKeyword',
        variables: hasMallGroupTabs
          ? {
              limit: 6,
              orderBy: 'POSTED_AT',
              orderOption: 'DESC',
            }
          : {
              limit: 6,
              orderBy: 'POSTED_AT',
              orderOption: 'DESC',
            },
      },
      displayOrder: 3,
      viewMoreLink: '/curation/mall',
      tabs: hasMallGroupTabs
        ? mallGroupTabs
        : [
            {
              id: 'ali',
              label: '알리',
              variables: { keyword: '알리' },
              viewMoreLink: '/curation/ali',
            },
            {
              id: 'coupang',
              label: '쿠팡',
              variables: { keyword: '쿠팡' },
              viewMoreLink: '/curation/coupang',
            },
            {
              id: 'naver',
              label: '네이버',
              variables: { keyword: '네이버' },
              viewMoreLink: '/curation/naver',
            },
          ],
    },
    {
      id: 'community',
      title: '커뮤니티 모아보기',
      type: 'GRID_TABBED',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: hasCommunityTabs ? 'products' : 'productsByKeyword',
        variables: hasCommunityTabs
          ? {
              limit: 6,
              orderBy: 'POSTED_AT',
              orderOption: 'DESC',
            }
          : {
              limit: 6,
              orderBy: 'POSTED_AT',
              orderOption: 'DESC',
            },
      },
      tabs: hasCommunityTabs
        ? communityProviderTabs
        : [
            {
              id: 'ppomppu',
              label: '뽐뿌',
              variables: { keyword: '뽐뿌' },
              viewMoreLink: '/curation/ppomppu',
            },
            {
              id: 'eomisae',
              label: '어미새패션',
              variables: { keyword: '어미새패션' },
              viewMoreLink: '/curation/eomisae',
            },
            {
              id: 'mamibebe',
              label: '마미베베',
              variables: { keyword: '마미베베' },
              viewMoreLink: '/curation/mamibebe',
            },
          ],
      displayOrder: 4,
      viewMoreLink: '/curation/community',
    },
  ];
}

/**
 * 섹션 id 로 하나를 찾는다(더보기 화면용).
 * GROUP 안쪽과 **탭까지** 뒤진다.
 * 탭이 맞으면 그 탭의 variables 를 섞은 GRID 섹션으로 만들어 준다.
 */
export function findPromotionSectionById(
  sections: PromotionSection[],
  id: string,
): ContentPromotionSection | undefined {
  for (const section of sections) {
    if (section.type === 'TOSS') continue;
    if (section.type === 'GROUP') {
      const found = section.sections.find((s) => s.id === id);
      if (found) return found;
      continue;
    }

    if (section.id === id) return section;

    const matchedTab = section.tabs?.find((tab) => tab.id === id);
    if (matchedTab) {
      return {
        id: matchedTab.id,
        title: matchedTab.label,
        type: 'GRID',
        dataSource: {
          ...section.dataSource,
          variables: {
            ...section.dataSource.variables,
            ...matchedTab.variables,
          },
        },
        displayOrder: section.displayOrder,
        viewMoreLink: matchedTab.viewMoreLink,
      };
    }
  }
  return undefined;
}
