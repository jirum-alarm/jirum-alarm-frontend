import { useCallback, useEffect } from 'react';

import {
  ApolloError,
  DefaultContext,
  DocumentNode,
  FetchPolicy,
  LazyQueryHookOptions,
  MutationHookOptions,
  OperationVariables,
  QueryHookOptions,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import { MutationFetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { useSetRecoilState } from 'recoil';

import { errorModalSelector, loadingAtom } from '../state/common';

import { isAccessTokenExpired } from '../lib/auth';
import { ApiType } from '../types/enum/common';

interface IQueryDefaultOption {
  fetchPolicy: FetchPolicy;
  context: DefaultContext;
}

interface IMutateDefaultOption {
  fetchPolicy: MutationFetchPolicy;
  context: DefaultContext;
  'cache-first'?: any;
}

interface IAdditionalArgs {
  errorMessage?: string;
  openEventHandler?: () => void;
  closeEventHandler?: () => void;
  isLoading?: boolean;
}

interface IQueryHookOptions<T, F extends OperationVariables = OperationVariables>
  extends QueryHookOptions<T, F>,
    IAdditionalArgs {}

interface ILazyQueryHookOptions<T, F extends OperationVariables = OperationVariables>
  extends LazyQueryHookOptions<T, F>,
    IAdditionalArgs {}

interface IMutationHookOptions<T, F = OperationVariables>
  extends MutationHookOptions<T, F>,
    IAdditionalArgs {}

const apiQueryOptions: IQueryDefaultOption = {
  fetchPolicy: 'network-only',
  context: { clientName: ApiType.API },
};

const apiMutateOptions: IMutateDefaultOption = {
  fetchPolicy: 'network-only',
  context: { clientName: ApiType.API },
};

const Error = (
  customMessage?: string,
  openEventHandler?: () => void,
  closeEventHandler?: () => void,
) => {
  const showErrorModal = useSetRecoilState(errorModalSelector);

  const checkError = useCallback(
    (error: ApolloError | undefined) => {
      try {
        if (!error) {
          return;
        }

        let message = customMessage ?? error.graphQLErrors[0]?.message;
        const extensions = error.graphQLErrors[0]?.extensions;

        if (
          extensions?.code === 'FORBIDDEN' &&
          error.message === 'Forbidden resource' &&
          isAccessTokenExpired()
        ) {
          return;
        }

        if (extensions?.code === 'UNAUTHENTICATED') {
          return;
        }

        if (extensions?.response) {
          message = JSON.stringify(extensions?.response);
        }

        if (!message) {
          return;
        }

        showErrorModal({
          message,
          openEventHandler: openEventHandler,
          closeEventHandler: closeEventHandler,
        });
      } catch (e) {
        showErrorModal({ message: `error: ${e}` });
      }
    },
    [closeEventHandler, customMessage, openEventHandler, showErrorModal],
  );

  return checkError;
};

const useQueryHook = <T, F extends OperationVariables>(
  gql: DocumentNode,
  options: IQueryHookOptions<T, F>,
) => {
  const { error, loading, data, refetch } = useQuery<T, F>(gql, options);
  const checkError = Error(
    options.errorMessage,
    options.openEventHandler,
    options.closeEventHandler,
  );
  const setLoading = useSetRecoilState(loadingAtom);

  useEffect(() => {
    if (!options.isLoading) {
      return;
    }
    setLoading(loading);
  }, [loading, options.isLoading, setLoading]);
  useEffect(() => {
    checkError(error);
  }, [checkError, error]);

  return { error, loading, data, refetch };
};

const useLazyQueryHook = <T, F extends OperationVariables>(
  gql: DocumentNode,
  options: ILazyQueryHookOptions<T, F>,
) => {
  const [getQuery, { error, loading, data }] = useLazyQuery<T, F>(gql, options);

  const checkError = Error(
    options.errorMessage,
    options.openEventHandler,
    options.closeEventHandler,
  );
  const setLoading = useSetRecoilState(loadingAtom);

  useEffect(() => {
    if (!options.isLoading) {
      return;
    }
    setLoading(loading);
  }, [loading, options.isLoading, setLoading]);

  useEffect(() => {
    checkError(error);
  }, [checkError, error]);

  return { getQuery, error, loading, data };
};

const useMutationHook = <T, F>(gql: DocumentNode, options: IMutationHookOptions<T, F>) => {
  const [mutate, { data, loading, error }] = useMutation<T, F>(gql, options);

  const checkError = Error(
    options.errorMessage,
    options.openEventHandler,
    options.closeEventHandler,
  );
  const setLoading = useSetRecoilState(loadingAtom);

  useEffect(() => {
    if (!options.isLoading) {
      return;
    }
    setLoading(loading);
  }, [loading, options.isLoading, setLoading]);

  useEffect(() => {
    checkError(error);
  }, [checkError, error]);

  return { mutate, data, loading, error };
};

export const useApiQuery = <T, F extends OperationVariables = OperationVariables>(
  gql: DocumentNode,
  options?: IQueryHookOptions<T, F>,
) => {
  return useQueryHook<T, F>(gql, {
    ...apiQueryOptions,
    ...options,
    isLoading: options?.isLoading ?? true,
  });
};

export const useLazyApiQuery = <T, F extends OperationVariables = OperationVariables>(
  gql: DocumentNode,
  options?: ILazyQueryHookOptions<T, F>,
) => {
  return useLazyQueryHook<T, F>(gql, {
    ...apiQueryOptions,
    ...options,
    isLoading: options?.isLoading ?? true,
  });
};

export const useApiMutation = <T, F = OperationVariables>(
  gql: DocumentNode,
  options?: IMutationHookOptions<T, F>,
) => {
  return useMutationHook<T, F>(gql, {
    ...apiMutateOptions,
    ...options,
    isLoading: options?.isLoading ?? true,
  });
};
