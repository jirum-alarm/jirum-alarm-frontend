import { queryOptions } from '@tanstack/react-query';

import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

// ponytail: codegen graphql() 대신 인라인 TypedDocumentString — QueryProducts와 같은 패턴.
// dev-api 미배포 스키마 의존 없음(communityProviders는 운영에 이미 존재).
export interface CommunityProvider {
  id: string;
  nameKr: string;
}

const QueryCommunityProviders = new TypedDocumentString<
  { communityProviders: CommunityProvider[] },
  Record<string, never>
>(`
  query QueryCommunityProviders {
    communityProviders {
      id
      nameKr
    }
  }
`);

export const ProviderQueries = {
  all: () => ['provider'],
  communityProviders: () =>
    queryOptions({
      queryKey: [...ProviderQueries.all(), 'community'],
      queryFn: () => execute(QueryCommunityProviders).then((res) => res.data),
      staleTime: 1000 * 60 * 60 * 24,
    }),
};
