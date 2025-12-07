import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

import { ContentPromotionSection, PromotionSection } from './model/types';

const sortByDisplayOrder = <T extends { displayOrder: number }>(items: T[]) =>
  [...items].sort((a, b) => a.displayOrder - b.displayOrder);

export const getPromotionSections = (): PromotionSection[] => {
  const sections: PromotionSection[] = [
    {
      id: 'section-1',
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
      viewMoreLink: '/curation/section-1',
    },
    {
      id: 'section-2',
      title: '부담없이 만원이하템',
      type: 'HORIZONTAL_SCROLL',
      dataSource: {
        type: 'GRAPHQL_QUERY',
        queryName: 'productsByKeyword',
        variables: {
          keyword: '만원이하',
          limit: 6,
          orderBy: KeywordProductOrderType.PostedAt,
          orderOption: OrderOptionType.Desc,
        },
      },
      displayOrder: 2,
      viewMoreLink: '/curation/section-2',
    },
    {
      id: 'section-group-1',
      title: '그룹 섹션',
      type: 'GROUP',
      displayOrder: 2,
      sections: [
        {
          id: 'section-2-group',
          title: '유통기한 임박 특가',
          type: 'LIST',
          dataSource: {
            type: 'GRAPHQL_QUERY',
            queryName: 'productsByKeyword',
            variables: {
              keyword: '만원이하',
              limit: 4,
              orderBy: KeywordProductOrderType.PostedAt,
              orderOption: OrderOptionType.Desc,
            },
          },
          displayOrder: 1,
          viewMoreLink: '/curation/section-2-group',
        },
        {
          id: 'section-5',
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
          viewMoreLink: '/curation/section-5',
        },
      ],
    },
    {
      id: 'section-3',
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
          id: 'tab-1',
          label: '알리',
          variables: {
            keyword: '알리',
          },
        },
        {
          id: 'tab-2',
          label: '쿠팡',
          variables: {
            keyword: '쿠팡',
          },
        },
        {
          id: 'tab-3',
          label: '네이버',
          variables: {
            keyword: '네이버',
          },
        },
        {
          id: 'tab-4',
          label: '네이버',
          variables: {
            keyword: '네이버',
          },
        },
      ],
    },
    {
      id: 'section-4',
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
          id: 'tab-1',
          label: '뽐뿌',
          variables: {
            keyword: '뽐뿌',
          },
        },
        {
          id: 'tab-2',
          label: '어미새패션',
          variables: {
            keyword: '어미새패션',
          },
        },
        {
          id: 'tab-3',
          label: '마미베베',
          variables: {
            keyword: '마미베베',
          },
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
    }
  }
  return undefined;
};
