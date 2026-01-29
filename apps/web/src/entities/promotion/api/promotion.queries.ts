import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

import { ContentPromotionSection, PromotionSection } from '../model/types';

const sortByDisplayOrder = <T extends { displayOrder: number }>(items: T[]) =>
  [...items].sort((a, b) => a.displayOrder - b.displayOrder);

export const getPromotionSections = (): PromotionSection[] => {
  const sections: PromotionSection[] = [
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
            queryName: 'productsByKeyword',
            variables: {
              keyword: '만원이하',
              limit: 10,
              orderBy: KeywordProductOrderType.PostedAt,
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
        queryName: 'productsByKeyword',
        variables: {
          limit: 6,
          orderBy: KeywordProductOrderType.PostedAt,
          orderOption: OrderOptionType.Desc,
        },
      },
      displayOrder: 3,
      tabs: [
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
        queryName: 'productsByKeyword',
        variables: {
          limit: 6,
          orderBy: KeywordProductOrderType.PostedAt,
          orderOption: OrderOptionType.Desc,
        },
      },
      tabs: [
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
    },
  ];

  return sortByDisplayOrder(
    sections.map((section) =>
      section.type === 'GROUP'
        ? { ...section, sections: sortByDisplayOrder(section.sections) }
        : section,
    ),
  );
};

export const getPromotionSectionById = (id: string): ContentPromotionSection | undefined => {
  const sections = getPromotionSections();
  for (const section of sections) {
    if (section.type === 'GROUP') {
      const found = section.sections.find((s) => s.id === id);
      if (found) return found;
    } else if (section.id === id) {
      return section;
    } else if (section.tabs) {
      // Search by tab ID
      const tab = section.tabs.find((t) => t.id === id);
      if (tab) {
        // Return a virtual section based on the tab
        return {
          id: tab.id,
          title: tab.label,
          type: 'GRID',
          dataSource: {
            ...section.dataSource,
            variables: {
              ...section.dataSource.variables,
              ...tab.variables,
            },
          },
          displayOrder: section.displayOrder,
          viewMoreLink: tab.viewMoreLink,
        };
      }
    }
  }
  return undefined;
};
