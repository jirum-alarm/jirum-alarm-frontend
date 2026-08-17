import {
  KeywordProductOrderType,
  OrderOptionType,
  ProductOrderType,
} from '@/shared/api/gql/graphql.ts';

import type {PromotionSection, PromotionTab} from './types';

/**
 * 홈 섹션 구성. web 을 1:1 로 옮겼다.
 * 정본: apps/web/src/entities/promotion/api/getPromotionSections.ts
 *
 * web 은 이걸 서버(async)에서 만들지만 RN 엔 서버가 없다 →
 * 탭 목록 두 개(communityProviders/mallGroups)를 클라에서 받아 같은 모양으로 조립한다.
 * 두 쿼리가 실패해도 섹션은 나와야 하므로(web 의 Promise.allSettled 와 동일 의도)
 * 호출부에서 빈 배열을 넘긴다 → 키워드 기반 폴백 탭이 쓰인다.
 */

export interface PromotionTabSources {
  communityProviders: Array<{id: string; name: string; nameKr?: string | null}>;
  mallGroups: Array<{
    id: number;
    title: string;
    isActive: boolean;
    sort?: number | null;
  }>;
}

export function buildPromotionSections({
  communityProviders,
  mallGroups,
}: PromotionTabSources): PromotionSection[] {
  const communityProviderTabs: PromotionTab[] = [];
  communityProviders.forEach(provider => {
    const providerId = Number(provider.id);
    if (!Number.isFinite(providerId)) return;
    communityProviderTabs.push({
      id: `provider-${provider.id}`,
      label: provider.nameKr ?? provider.name,
      // ★ web 은 `providerId` 단수를 넘기지만 스키마엔 복수형만 있다.
      // 운영 API 가 미선언 인자를 받아줘서 web 이 동작하는 것뿐이라 여기선 복수로 보낸다
      // (결과 동일함을 실측 확인: providerIds:[2] === providerId:2).
      variables: {providerIds: [providerId]},
      viewMoreLink: `/curation/provider-${provider.id}`,
    });
  });

  const mallGroupTabs: PromotionTab[] = [];
  mallGroups
    .filter(mallGroup => mallGroup.isActive)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .forEach(mallGroup => {
      const mallGroupId = Math.trunc(mallGroup.id);
      if (!Number.isFinite(mallGroupId)) return;
      mallGroupTabs.push({
        id: `mall-group-${mallGroup.id}`,
        label: mallGroup.title,
        variables: {mallGroupId},
        viewMoreLink: `/curation/mall-group-${mallGroup.id}`,
      });
    });

  const hasCommunityTabs = communityProviderTabs.length > 0;
  const hasMallGroupTabs = mallGroupTabs.length > 0;

  return [
    {
      id: 'hotdeal',
      title: '놓치면 아까운 핫딜',
      type: 'PAGINATED_GRID',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'hotDealRankingProducts',
        variables: {page: 0, limit: 20},
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
        variables: {page: 0, limit: 20},
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
          orderBy: KeywordProductOrderType.PostedAt,
          orderOption: OrderOptionType.Desc,
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
              orderBy: ProductOrderType.ExpiringSoon,
              orderOption: OrderOptionType.Desc,
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
              orderBy: KeywordProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
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
              orderBy: ProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
            }
          : {
              limit: 6,
              orderBy: KeywordProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
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
              variables: {keyword: '알리'},
              viewMoreLink: '/curation/ali',
            },
            {
              id: 'coupang',
              label: '쿠팡',
              variables: {keyword: '쿠팡'},
              viewMoreLink: '/curation/coupang',
            },
            {
              id: 'naver',
              label: '네이버',
              variables: {keyword: '네이버'},
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
              orderBy: ProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
            }
          : {
              limit: 6,
              orderBy: KeywordProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
            },
      },
      tabs: hasCommunityTabs
        ? communityProviderTabs
        : [
            {
              id: 'ppomppu',
              label: '뽐뿌',
              variables: {keyword: '뽐뿌'},
              viewMoreLink: '/curation/ppomppu',
            },
            {
              id: 'eomisae',
              label: '어미새패션',
              variables: {keyword: '어미새패션'},
              viewMoreLink: '/curation/eomisae',
            },
            {
              id: 'mamibebe',
              label: '마미베베',
              variables: {keyword: '마미베베'},
              viewMoreLink: '/curation/mamibebe',
            },
          ],
      displayOrder: 4,
      viewMoreLink: '/curation/community',
    },
  ];
}
