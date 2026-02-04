export type ContentPromotionSectionType =
  | 'GRID'
  | 'HORIZONTAL_SCROLL'
  | 'LIST'
  | 'DOUBLE_ROW'
  | 'BANNER'
  | 'GRID_TABBED'
  | 'PAGINATED_GRID';

export type PromotionSectionType = ContentPromotionSectionType | 'GROUP';

export type PromotionDataSourceType = 'GRAPHQL_QUERY' | 'STATIC_LIST';

export type PromotionDataSource = {
  type: PromotionDataSourceType;
  queryName: string;
  variables: Record<string, any>;
};

export interface PromotionTab {
  id: string;
  label: string;
  variables: Record<string, any>;
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

export type PromotionSection = ContentPromotionSection | GroupPromotionSection;
