import { httpClient } from '@/shared/lib/http-client';
import { graphql } from '../gql';
import { QueryProductsQueryVariables } from '../gql/graphql';

export class ProductService {
  static async getRankingProducts() {
    return httpClient.execute(QueryRankingProducts).then((res) => res.data);
  }
  static async getProducts(variables: QueryProductsQueryVariables) {
    return httpClient.execute(QueryProducts, variables).then((res) => res.data);
  }
}

const QueryRankingProducts = graphql(`
  query QueryRankingProducts {
    rankingProducts {
      id
      title
      url
      price
      thumbnail
    }
  }
`);

const QueryProducts = graphql(`
  query QueryProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryId: Int
    $keyword: String
    $thumbnailType: ThumbnailType
    $isEnd: Boolean
    $isHot: Boolean
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryId: $categoryId
      keyword: $keyword
      thumbnailType: $thumbnailType
      isEnd: $isEnd
      isHot: $isHot
    ) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);
