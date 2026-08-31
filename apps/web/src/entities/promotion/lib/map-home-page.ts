import type { ServerHomeSection } from '@/shared/api/promotion/promotion.service';

import type {
  ContentPromotionSection,
  GroupPromotionSection,
  PromotionSection,
  TossPromotionSection,
} from '../model/types';

const CONTENT_TYPES = new Set([
  'GRID',
  'HORIZONTAL_SCROLL',
  'LIST',
  'DOUBLE_ROW',
  'BANNER',
  'GRID_TABBED',
  'PAGINATED_GRID',
]);

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

  const section: ContentPromotionSection = {
    id: raw.id,
    title: raw.title,
    type: raw.type as ContentPromotionSection['type'],
    displayOrder: raw.displayOrder ?? 0,
    viewMoreLink: raw.viewMoreLink ?? undefined,
    dataSource: {
      type: 'GRAPHQL_QUERY',
      queryName: raw.dataSource.queryName,
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
