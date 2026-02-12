import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

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
}
