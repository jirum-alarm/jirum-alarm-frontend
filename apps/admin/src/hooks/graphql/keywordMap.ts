import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationAddKeywordMapEntriesByAdminMutation,
  MutationAddKeywordMapEntriesByAdminMutationVariables,
  MutationAddKeywordMapEntryByAdminMutation,
  MutationAddKeywordMapEntryByAdminMutationVariables,
  MutationAddKeywordMapGroupByAdminMutation,
  MutationAddKeywordMapGroupByAdminMutationVariables,
  MutationRemoveKeywordMapEntryByAdminMutation,
  MutationRemoveKeywordMapEntryByAdminMutationVariables,
  MutationRemoveKeywordMapGroupByAdminMutation,
  MutationRemoveKeywordMapGroupByAdminMutationVariables,
  MutationUpdateKeywordMapGroupByAdminMutation,
  MutationUpdateKeywordMapGroupByAdminMutationVariables,
  QueryKeywordMapGroupByAdminQuery,
  QueryKeywordMapGroupByAdminQueryVariables,
  QueryKeywordMapGroupsByAdminQuery,
} from '@/generated/gql/graphql';
import {
  MutationAddKeywordMapEntriesByAdmin,
  MutationAddKeywordMapEntryByAdmin,
  MutationAddKeywordMapGroupByAdmin,
  MutationRemoveKeywordMapEntryByAdmin,
  MutationRemoveKeywordMapGroupByAdmin,
  MutationUpdateKeywordMapGroupByAdmin,
  QueryKeywordMapGroupByAdmin,
  QueryKeywordMapGroupsByAdmin,
} from '@/graphql/keywordMap';
import { KeywordMapGroupOrderType, OrderOptionType } from '@/types/keyword';

// ── Group List ──

// orderBy/orderOption 은 화면이 쓰는 로컬 enum(@/types/keyword)이라 생성 변수 타입 대신 손으로 둔다
interface GetKeywordMapGroupsVariables {
  orderBy?: KeywordMapGroupOrderType;
  orderOption?: OrderOptionType;
  limit?: number;
  searchAfter?: string[];
}

export const useGetKeywordMapGroups = (
  queryOptions?: QueryHookOptions<QueryKeywordMapGroupsByAdminQuery, GetKeywordMapGroupsVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useQuery<QueryKeywordMapGroupsByAdminQuery, GetKeywordMapGroupsVariables>(
    QueryKeywordMapGroupsByAdmin,
    {
      ...rest,
      variables: {
        orderBy: variables?.orderBy ?? KeywordMapGroupOrderType.ID,
        orderOption: variables?.orderOption ?? OrderOptionType.DESC,
        limit: variables?.limit ?? PAGE_LIMIT,
        searchAfter: variables?.searchAfter,
      },
    },
  );
};

// ── Group Detail ──

export const useGetKeywordMapGroup = (
  queryOptions?: QueryHookOptions<
    QueryKeywordMapGroupByAdminQuery,
    QueryKeywordMapGroupByAdminQueryVariables
  >,
) => {
  return useQuery<QueryKeywordMapGroupByAdminQuery, QueryKeywordMapGroupByAdminQueryVariables>(
    QueryKeywordMapGroupByAdmin,
    {
      ...queryOptions,
    },
  );
};

// ── Add Group ──

export const useAddKeywordMapGroup = (
  options?: MutationHookOptions<
    MutationAddKeywordMapGroupByAdminMutation,
    MutationAddKeywordMapGroupByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationAddKeywordMapGroupByAdminMutation,
    MutationAddKeywordMapGroupByAdminMutationVariables
  >(MutationAddKeywordMapGroupByAdmin, {
    refetchQueries: [
      {
        query: QueryKeywordMapGroupsByAdmin,
        variables: {
          orderBy: KeywordMapGroupOrderType.ID,
          orderOption: OrderOptionType.DESC,
          limit: PAGE_LIMIT,
        },
      },
    ],
    ...options,
  });
};

// ── Update Group ──

export const useUpdateKeywordMapGroup = (
  options?: MutationHookOptions<
    MutationUpdateKeywordMapGroupByAdminMutation,
    MutationUpdateKeywordMapGroupByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationUpdateKeywordMapGroupByAdminMutation,
    MutationUpdateKeywordMapGroupByAdminMutationVariables
  >(MutationUpdateKeywordMapGroupByAdmin, {
    update(cache, { data }, option) {
      const { variables } = option;
      const existing = cache.readQuery({
        query: QueryKeywordMapGroupsByAdmin,
        variables: {
          orderBy: KeywordMapGroupOrderType.ID,
          orderOption: OrderOptionType.DESC,
          limit: PAGE_LIMIT,
        },
      }) as QueryKeywordMapGroupsByAdminQuery | null;
      if (existing?.keywordMapGroupsByAdmin.length && data?.updateKeywordMapGroupByAdmin) {
        cache.writeQuery({
          query: QueryKeywordMapGroupsByAdmin,
          variables: {
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
          data: {
            keywordMapGroupsByAdmin: existing.keywordMapGroupsByAdmin.map((group) =>
              Number(group.id) === variables?.id ? { ...group, ...variables } : group,
            ),
          },
        });
      }
    },
    ...options,
  });
};

// ── Remove Group ──

export const useRemoveKeywordMapGroup = (
  options?: MutationHookOptions<
    MutationRemoveKeywordMapGroupByAdminMutation,
    MutationRemoveKeywordMapGroupByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveKeywordMapGroupByAdminMutation,
    MutationRemoveKeywordMapGroupByAdminMutationVariables
  >(MutationRemoveKeywordMapGroupByAdmin, {
    update(cache, { data }, option) {
      const { variables } = option;
      const existing = cache.readQuery({
        query: QueryKeywordMapGroupsByAdmin,
        variables: {
          orderBy: KeywordMapGroupOrderType.ID,
          orderOption: OrderOptionType.DESC,
          limit: PAGE_LIMIT,
        },
      }) as QueryKeywordMapGroupsByAdminQuery | null;
      if (existing?.keywordMapGroupsByAdmin.length && data?.removeKeywordMapGroupByAdmin) {
        cache.writeQuery({
          query: QueryKeywordMapGroupsByAdmin,
          variables: {
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
          data: {
            keywordMapGroupsByAdmin: existing.keywordMapGroupsByAdmin.filter(
              (group) => Number(group.id) !== variables?.id,
            ),
          },
        });
      }
    },
    ...options,
  });
};

// ── Add Entry ──

export const useAddKeywordMapEntry = (
  groupId: number,
  options?: MutationHookOptions<
    MutationAddKeywordMapEntryByAdminMutation,
    MutationAddKeywordMapEntryByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationAddKeywordMapEntryByAdminMutation,
    MutationAddKeywordMapEntryByAdminMutationVariables
  >(MutationAddKeywordMapEntryByAdmin, {
    refetchQueries: [
      {
        query: QueryKeywordMapGroupByAdmin,
        variables: { id: groupId },
      },
    ],
    ...options,
  });
};

// ── Add Entries (Bulk) ──

export const useAddKeywordMapEntries = (
  groupId: number,
  options?: MutationHookOptions<
    MutationAddKeywordMapEntriesByAdminMutation,
    MutationAddKeywordMapEntriesByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationAddKeywordMapEntriesByAdminMutation,
    MutationAddKeywordMapEntriesByAdminMutationVariables
  >(MutationAddKeywordMapEntriesByAdmin, {
    refetchQueries: [
      {
        query: QueryKeywordMapGroupByAdmin,
        variables: { id: groupId },
      },
    ],
    ...options,
  });
};

// ── Remove Entry ──

export const useRemoveKeywordMapEntry = (
  groupId: number,
  options?: MutationHookOptions<
    MutationRemoveKeywordMapEntryByAdminMutation,
    MutationRemoveKeywordMapEntryByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveKeywordMapEntryByAdminMutation,
    MutationRemoveKeywordMapEntryByAdminMutationVariables
  >(MutationRemoveKeywordMapEntryByAdmin, {
    update(cache, { data }, option) {
      const { variables } = option;
      const existing = cache.readQuery({
        query: QueryKeywordMapGroupByAdmin,
        variables: { id: groupId },
      }) as QueryKeywordMapGroupByAdminQuery | null;
      if (existing?.keywordMapGroupByAdmin && data?.removeKeywordMapEntryByAdmin) {
        cache.writeQuery({
          query: QueryKeywordMapGroupByAdmin,
          variables: { id: groupId },
          data: {
            keywordMapGroupByAdmin: {
              ...existing.keywordMapGroupByAdmin,
              entryCount: existing.keywordMapGroupByAdmin.entryCount - 1,
              entries: existing.keywordMapGroupByAdmin.entries.filter(
                (entry) => Number(entry.id) !== variables?.id,
              ),
            },
          },
        });
      }
    },
    ...options,
  });
};
