import { execute } from '@/shared/lib/http';

import { graphql } from '../gql';

export class CategoryService {
  static async getCategories() {
    return execute(QueryCategories);
  }

  static async getMyCategories() {
    return execute(QueryMyCategories);
  }

  static async getMyCategoriesServer() {
    return execute(QueryMyCategories);
  }
}

const QueryCategories = graphql(`
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
