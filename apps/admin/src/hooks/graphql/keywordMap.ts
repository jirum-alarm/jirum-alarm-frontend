import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
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

// ── Types ──

interface KeywordMapGroupListItem {
  id: number;
  name: string;
  description?: string;
  entryCount: number;
  searchAfter?: string[];
}

interface KeywordMapGroupDetail {
  id: number;
  name: string;
  description?: string;
  entryCount: number;
  entries: Array<{ id: number; keyword: string }>;
}

// ── Group List ──

interface GetKeywordMapGroupsVariables {
  orderBy?: KeywordMapGroupOrderType;
  orderOption?: OrderOptionType;
  limit?: number;
  searchAfter?: string[];
}

export const useGetKeywordMapGroups = (
  queryOptions?: QueryHookOptions<
    { keywordMapGroupsByAdmin: KeywordMapGroupListItem[] },
    GetKeywordMapGroupsVariables
  >,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useQuery<
    { keywordMapGroupsByAdmin: KeywordMapGroupListItem[] },
    GetKeywordMapGroupsVariables
  >(QueryKeywordMapGroupsByAdmin, {
    ...rest,
    variables: {
      orderBy: variables?.orderBy ?? KeywordMapGroupOrderType.ID,
      orderOption: variables?.orderOption ?? OrderOptionType.DESC,
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
    },
  });
};

// ── Group Detail ──

interface GetKeywordMapGroupVariables {
  id: number;
}

export const useGetKeywordMapGroup = (
  queryOptions?: QueryHookOptions<
    { keywordMapGroupByAdmin: KeywordMapGroupDetail },
    GetKeywordMapGroupVariables
  >,
) => {
  return useQuery<{ keywordMapGroupByAdmin: KeywordMapGroupDetail }, GetKeywordMapGroupVariables>(
    QueryKeywordMapGroupByAdmin,
    {
      ...queryOptions,
    },
  );
};

// ── Add Group ──

interface AddKeywordMapGroupVariables {
  name: string;
  description?: string;
}

export const useAddKeywordMapGroup = (
  options?: MutationHookOptions<any, AddKeywordMapGroupVariables>,
) => {
  return useMutation<{ addKeywordMapGroupByAdmin: number }, AddKeywordMapGroupVariables>(
    MutationAddKeywordMapGroupByAdmin,
    {
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
    },
  );
};

// ── Update Group ──

interface UpdateKeywordMapGroupVariables {
  id: number;
  name?: string;
  description?: string;
}

export const useUpdateKeywordMapGroup = (
  options?: MutationHookOptions<any, UpdateKeywordMapGroupVariables>,
) => {
  return useMutation<{ updateKeywordMapGroupByAdmin: boolean }, UpdateKeywordMapGroupVariables>(
    MutationUpdateKeywordMapGroupByAdmin,
    {
      update(cache, { data }, option) {
        const { variables } = option;
        const existing = cache.readQuery({
          query: QueryKeywordMapGroupsByAdmin,
          variables: {
            orderBy: KeywordMapGroupOrderType.ID,
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
        }) as { keywordMapGroupsByAdmin: KeywordMapGroupListItem[] } | null;
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
    },
  );
};

// ── Remove Group ──

interface RemoveKeywordMapGroupVariables {
  id: number;
}

export const useRemoveKeywordMapGroup = (
  options?: MutationHookOptions<any, RemoveKeywordMapGroupVariables>,
) => {
  return useMutation<{ removeKeywordMapGroupByAdmin: boolean }, RemoveKeywordMapGroupVariables>(
    MutationRemoveKeywordMapGroupByAdmin,
    {
      update(cache, { data }, option) {
        const { variables } = option;
        const existing = cache.readQuery({
          query: QueryKeywordMapGroupsByAdmin,
          variables: {
            orderBy: KeywordMapGroupOrderType.ID,
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
        }) as { keywordMapGroupsByAdmin: KeywordMapGroupListItem[] } | null;
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
    },
  );
};

// ── Add Entry ──

interface AddKeywordMapEntryVariables {
  groupId: number;
  keyword: string;
}

export const useAddKeywordMapEntry = (
  groupId: number,
  options?: MutationHookOptions<any, AddKeywordMapEntryVariables>,
) => {
  return useMutation<{ addKeywordMapEntryByAdmin: number }, AddKeywordMapEntryVariables>(
    MutationAddKeywordMapEntryByAdmin,
    {
      refetchQueries: [
        {
          query: QueryKeywordMapGroupByAdmin,
          variables: { id: groupId },
        },
      ],
      ...options,
    },
  );
};

// ── Add Entries (Bulk) ──

interface AddKeywordMapEntriesVariables {
  groupId: number;
  keywords: string[];
}

export const useAddKeywordMapEntries = (
  groupId: number,
  options?: MutationHookOptions<any, AddKeywordMapEntriesVariables>,
) => {
  return useMutation<{ addKeywordMapEntriesByAdmin: boolean }, AddKeywordMapEntriesVariables>(
    MutationAddKeywordMapEntriesByAdmin,
    {
      refetchQueries: [
        {
          query: QueryKeywordMapGroupByAdmin,
          variables: { id: groupId },
        },
      ],
      ...options,
    },
  );
};

// ── Remove Entry ──

interface RemoveKeywordMapEntryVariables {
  id: number;
}

export const useRemoveKeywordMapEntry = (
  groupId: number,
  options?: MutationHookOptions<any, RemoveKeywordMapEntryVariables>,
) => {
  return useMutation<{ removeKeywordMapEntryByAdmin: boolean }, RemoveKeywordMapEntryVariables>(
    MutationRemoveKeywordMapEntryByAdmin,
    {
      update(cache, { data }, option) {
        const { variables } = option;
        const existing = cache.readQuery({
          query: QueryKeywordMapGroupByAdmin,
          variables: { id: groupId },
        }) as { keywordMapGroupByAdmin: KeywordMapGroupDetail } | null;
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
    },
  );
};
