import { execute } from '@shared/lib/http-client';

import { graphql } from '../gql';

export class CategoryService {
  static async getCategories() {
    return execute(Queryategories).then((res) => res.data);
  }

  static async getMyCategories() {
    return execute(QueryMyCategories).then((res) => res.data);
  }
}

const Queryategories = graphql(`
  query QueryCategories {
    categories {
      id
      name
    }
  }
`);

const QueryMyCategories = graphql(`
  query QueryMyCategories {
    me {
      favoriteCategories
    }
  }
`);
