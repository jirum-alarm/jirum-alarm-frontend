import {
  KeywordProductOrderType,
  OrderOptionType,
  ProductOrderType,
} from '@/shared/api/gql/graphql';
import { PromotionService } from '@/shared/api/promotion';

import { ContentPromotionSection, PromotionSection, PromotionTab } from '../model/types';

export const getPromotionSections = async (): Promise<PromotionSection[]> => {
  const [providersResult, mallGroupsResult] = await Promise.allSettled([
    PromotionService.getCommunityProviders(),
    PromotionService.getMallGroups(),
  ]);

  const communityProviderTabs: PromotionTab[] = [];
  if (providersResult.status === 'fulfilled') {
    providersResult.value.communityProviders.forEach((provider) => {
      const providerId = Number(provider.id);
      if (!Number.isFinite(providerId)) return;
      communityProviderTabs.push({
        id: `provider-${provider.id}`,
        label: provider.nameKr ?? provider.name,
        variables: {
          providerId,
        },
        viewMoreLink: `/curation/provider-${provider.id}`,
      });
    });
  }

  const mallGroupTabs: PromotionTab[] = [];
  if (mallGroupsResult.status === 'fulfilled') {
    mallGroupsResult.value.mallGroups
      .filter((mallGroup) => mallGroup.isActive)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .forEach((mallGroup) => {
        const mallGroupId = Math.trunc(mallGroup.id);
        if (!Number.isFinite(mallGroupId)) return;
        mallGroupTabs.push({
          id: `mall-group-${mallGroup.id}`,
          label: mallGroup.title,
          variables: {
            mallGroupId,
          },
          viewMoreLink: `/curation/mall-group-${mallGroup.id}`,
        });
      });
  }

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
        variables: {
          page: 0,
          limit: 20,
        },
      },
      displayOrder: 1,
      viewMoreLink: '/curation/hotdeal',
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
              variables: {
                keyword: '알리',
              },
              viewMoreLink: '/curation/ali',
            },
            {
              id: 'coupang',
              label: '쿠팡',
              variables: {
                keyword: '쿠팡',
              },
              viewMoreLink: '/curation/coupang',
            },
            {
              id: 'naver',
              label: '네이버',
              variables: {
                keyword: '네이버',
              },
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
              variables: {
                keyword: '뽐뿌',
              },
              viewMoreLink: '/curation/ppomppu',
            },
            {
              id: 'eomisae',
              label: '어미새패션',
              variables: {
                keyword: '어미새패션',
              },
              viewMoreLink: '/curation/eomisae',
            },
            {
              id: 'mamibebe',
              label: '마미베베',
              variables: {
                keyword: '마미베베',
              },
              viewMoreLink: '/curation/mamibebe',
            },
          ],
      displayOrder: 4,
      viewMoreLink: '/curation/community',
    },
  ];
};

export const getPromotionSectionById = async (
  id: string,
): Promise<ContentPromotionSection | undefined> => {
  const sections = await getPromotionSections();
  for (const section of sections) {
    if (section.type === 'GROUP') {
      const found = section.sections.find((s) => s.id === id);
      if (found) return found;
    } else {
      if (section.id === id) {
        return section;
      }

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
  }
  return undefined;
};
