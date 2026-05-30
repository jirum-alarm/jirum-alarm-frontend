import { QueryHookOptions, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import { QueryGatedMappingsQuery, QueryGatedMappingsQueryVariables } from '@/generated/gql/graphql';
import { QueryGatedMappings } from '@/graphql/gated-mappings';

/**
 * 게이트 차단 매핑(추출 오염 / 묶음글 등) 목록 조회.
 * matchingSource 를 명시하지 않으면 모든 not_matchable(target NULL)이 나오므로,
 * 호출부에서 게이트 source 를 항상 지정한다.
 */
export const useGetGatedMappings = (
  variables?: Partial<QueryGatedMappingsQueryVariables>,
  options?: QueryHookOptions<QueryGatedMappingsQuery, QueryGatedMappingsQueryVariables>,
) => {
  return useQuery<QueryGatedMappingsQuery, QueryGatedMappingsQueryVariables>(QueryGatedMappings, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter ?? undefined,
      matchingSource: variables?.matchingSource ?? undefined,
      productTitle: variables?.productTitle ?? undefined,
      orderBy: variables?.orderBy ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};
