import { graphql } from '../gql';

import { httpClient } from '@/shared/lib/http-client';

export class CategoryService {
  static async getCategories() {
    return httpClient.execute(Queryategories).then((res) => res.data);
  }

  static async getMyCategories() {
    return httpClient.execute(QueryMyCategories).then((res) => res.data);
  }

  static async getMyCategoriesServer() {
    return httpClient.server_execute(QueryMyCategories).then((res) => res.data);
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
