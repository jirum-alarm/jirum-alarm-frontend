import { httpClient } from '@/shared/lib/http-client';
import { graphql } from '../gql';

export class AuthService {
  static async loginByRefreshTokenMutation() {
    return httpClient.execute(MutationLoginByRefreshToken).then((res) => res.data);
  }
}

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

// const Queryategories = graphql(`
//   query QueryCategories {
//     categories {
//       id
//       name
//     }
//   }
// `);

// const QueryMyCategories = graphql(`
//   query QueryMyCategories {
//     me {
//       favoriteCategories
//     }
//   }
// `);
