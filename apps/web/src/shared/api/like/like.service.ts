import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import { AddUserLikeOrDislikeMutationVariables } from '../gql/graphql';

export class LikeService {
  static async addUserLikeOrDislike(variables: AddUserLikeOrDislikeMutationVariables) {
    return execute(MutationAddUserLikeOrDislike, variables).then((res) => res.data);
  }
}

const MutationAddUserLikeOrDislike = graphql(`
  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {
    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
  }
`);
