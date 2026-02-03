import {
  KeywordProductOrderType,
  OrderOptionType,
  ProductOrderType,
} from '@/shared/api/gql/graphql';

import { ContentPromotionSection, PromotionSection } from '../model/types';

export const getPromotionSections = (): PromotionSection[] => {
  return [
    {
      id: 'hot-deals',
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
      viewMoreLink: '/curation/hot-deals',
    },
    {
      id: 'under-10k',
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
      viewMoreLink: '/curation/under-10k',
    },
    {
      id: 'special-deals-group',
      title: '그룹 섹션',
      type: 'GROUP',
      displayOrder: 2,
      sections: [
        {
          id: 'expiring-soon',
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
          viewMoreLink: '/curation/expiring-soon',
        },
        {
          id: 'premium-deals',
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
          viewMoreLink: '/curation/premium-deals',
        },
      ],
    },
    {
      id: 'by-shopping-mall',
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
          id: 'tab-aliexpress',
          label: '알리',
          variables: {
            keyword: '알리',
          },
        },
        {
          id: 'tab-coupang',
          label: '쿠팡',
          variables: {
            keyword: '쿠팡',
          },
        },
        {
          id: 'tab-naver',
          label: '네이버',
          variables: {
            keyword: '네이버',
          },
        },
        {
          id: 'tab-naver-2',
          label: '네이버',
          variables: {
            keyword: '네이버',
          },
        },
      ],
    },
    {
      id: 'by-community',
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
          id: 'tab-ppomppu',
          label: '뽐뿌',
          variables: {
            keyword: '뽐뿌',
          },
        },
        {
          id: 'tab-eomisae',
          label: '어미새패션',
          variables: {
            keyword: '어미새패션',
          },
        },
        {
          id: 'tab-mamibebe',
          label: '마미베베',
          variables: {
            keyword: '마미베베',
          },
        },
      ],
      displayOrder: 4,
    },
  ];
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
