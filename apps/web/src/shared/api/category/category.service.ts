import { http } from '@/shared/lib/http';

import { graphql } from '../gql';

export class CategoryService {
  static async getCategories() {
    return http.execute(QueryCategories);
  }

  static async getMyCategories() {
    return http.execute(QueryMyCategories);
  }

  static async getMyCategoriesServer(cookieHeader: string) {
    return http.executeServer(cookieHeader, QueryMyCategories);
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
