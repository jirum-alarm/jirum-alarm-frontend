import { useQuery } from '@apollo/client/react';

import { QueryExperimentsQuery, QueryExperimentsQueryVariables } from '@/generated/gql/graphql';
import { QueryExperiments } from '@/graphql/experiment';

import { QueryOptions } from './options';

export const useExperiments = (
  options?: QueryOptions<QueryExperimentsQuery, QueryExperimentsQueryVariables>,
) =>
  useQuery<QueryExperimentsQuery, QueryExperimentsQueryVariables>(QueryExperiments, {
    fetchPolicy: 'network-only',
    ...options,
  });
