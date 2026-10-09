import { useMutation, useQuery } from '@apollo/client/react';

import {
  AdminPermissionsQuery,
  AssignAdminRoleMutation,
  AssignAdminRoleMutationVariables,
  CreateAdminRoleMutation,
  CreateAdminRoleMutationVariables,
  DeleteAdminRoleMutation,
  DeleteAdminRoleMutationVariables,
  MyAdminAccessQuery,
  UpdateAdminRoleMutation,
  UpdateAdminRoleMutationVariables,
} from '@/generated/gql/graphql';
import {
  MutationAssignAdminRole,
  MutationCreateAdminRole,
  MutationDeleteAdminRole,
  MutationUpdateAdminRole,
  QueryAdminPermissions,
  QueryMyAdminAccess,
} from '@/graphql/permission';

export const useMyAdminAccess = () =>
  useQuery<MyAdminAccessQuery>(QueryMyAdminAccess, { fetchPolicy: 'cache-and-network' });

export const useAdminPermissions = () =>
  useQuery<AdminPermissionsQuery>(QueryAdminPermissions, { fetchPolicy: 'network-only' });

// 바꾼 뒤 목록과 내 권한(사이드바)을 다시 읽는다.
const refetchQueries = [QueryAdminPermissions, QueryMyAdminAccess];

export const useCreateAdminRole = () =>
  useMutation<CreateAdminRoleMutation, CreateAdminRoleMutationVariables>(MutationCreateAdminRole, {
    refetchQueries,
  });

export const useUpdateAdminRole = () =>
  useMutation<UpdateAdminRoleMutation, UpdateAdminRoleMutationVariables>(MutationUpdateAdminRole, {
    refetchQueries,
  });

export const useDeleteAdminRole = () =>
  useMutation<DeleteAdminRoleMutation, DeleteAdminRoleMutationVariables>(MutationDeleteAdminRole, {
    refetchQueries,
  });

export const useAssignAdminRole = () =>
  useMutation<AssignAdminRoleMutation, AssignAdminRoleMutationVariables>(MutationAssignAdminRole, {
    refetchQueries,
  });
