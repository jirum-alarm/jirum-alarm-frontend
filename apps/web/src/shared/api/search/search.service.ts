import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

export interface SearchSuggestionsQueryVariables {
  prefix: string;
  limit?: number;
}

export interface SearchSuggestionsQuery {
  __typename?: 'Query';
  searchSuggestions: string[];
}

/**
 * `searchSuggestions(prefix, limit)` GraphQL 쿼리.
 * codegen 적용 전이라 TypedDocumentString을 ad-hoc으로 정의.
 * codegen 재생성 시 자동 타입으로 대체 가능.
 */
const QuerySearchSuggestions = new TypedDocumentString<
  SearchSuggestionsQuery,
  SearchSuggestionsQueryVariables
>(`
  query SearchSuggestions($prefix: String!, $limit: Int) {
    searchSuggestions(prefix: $prefix, limit: $limit)
  }
`);

export class SearchService {
  static async getSuggestions(variables: SearchSuggestionsQueryVariables): Promise<string[]> {
    const res = await execute(QuerySearchSuggestions, variables);
    return res.data.searchSuggestions ?? [];
  }
}
