import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

type HomePageQuery = {
  homePage: {
    experimentId: string;
    variant: string;
    sections: ServerHomeSection[];
  };
};

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

type CommunityProvidersQuery = {
  communityProviders: Array<{
    id: string;
    name: string;
    nameKr: string;
  }>;
};

type MallGroupsQuery = {
  mallGroups: Array<{
    id: number;
    title: string;
    isActive: boolean;
    sort?: number | null;
  }>;
};

type EmptyVariables = Record<string, never>;

const HOME_SECTION_FIELDS = `
  id
  title
  type
  displayOrder
  viewMoreLink
  ... on PaginatedGridSection {
    dataSource { type queryName variables }
  }
  ... on HorizontalScrollSection {
    dataSource { type queryName variables }
  }
  ... on ListSection {
    dataSource { type queryName variables }
  }
  ... on DoubleRowSection {
    dataSource { type queryName variables }
  }
  ... on GridTabbedSection {
    dataSource { type queryName variables }
    tabs { id label variables viewMoreLink }
  }
`;

const QueryHomePage = new TypedDocumentString<HomePageQuery, EmptyVariables>(`
  query HomePage {
    homePage {
      experimentId
      variant
      sections {
        ${HOME_SECTION_FIELDS}
        ... on GroupSection {
          sections {
            ${HOME_SECTION_FIELDS}
          }
        }
      }
    }
  }
`);

const QueryCommunityProviders = new TypedDocumentString<CommunityProvidersQuery, EmptyVariables>(`
  query QueryCommunityProviders {
    communityProviders {
      id
      name
      nameKr
    }
  }
`);

const QueryMallGroups = new TypedDocumentString<MallGroupsQuery, EmptyVariables>(`
  query QueryMallGroups {
    mallGroups {
      id
      title
      isActive
      sort
    }
  }
`);

export class PromotionService {
  static async getCommunityProviders() {
    return execute(QueryCommunityProviders).then((res) => res.data);
  }

  static async getMallGroups() {
    return execute(QueryMallGroups).then((res) => res.data);
  }

  static async getHomePage() {
    return execute(QueryHomePage).then((res) => res.data.homePage);
  }
}
