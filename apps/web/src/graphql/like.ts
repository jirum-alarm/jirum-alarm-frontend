import { gql } from '@apollo/client';

export const MutationAddUserLikeOrDislike = gql`
  mutation AddUserLikeOrDislike($target: UserLikeTarget!, $targetId: Int!, $isLike: Boolean) {
    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)
  }
`;
