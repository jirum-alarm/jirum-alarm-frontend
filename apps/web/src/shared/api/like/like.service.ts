import { http } from '@/shared/lib/http';

import { graphql } from '../gql';
import { AddUserLikeOrDislikeMutationVariables } from '../gql/graphql';

export class LikeService {
  static async addUserLikeOrDislike(variables: AddUserLikeOrDislikeMutationVariables) {
    return http.execute(MutationAddUserLikeOrDislike, variables);
  }
}

const MutationAddUserLikeOrDislike = graphql(`
  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {
    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
  }
`);
