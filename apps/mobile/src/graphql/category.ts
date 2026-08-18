import {graphql} from '../shared/api/gql';

/** 전체 카테고리. web: shared/api/category */
export const QueryCategories = graphql(`
  query Categories {
    categories {
      id
      name
    }
  }
`);

/** 내 선호 카테고리(id 목록). 로그인 상태에서만 값이 있다. */
export const QueryMyFavoriteCategories = graphql(`
  query MyFavoriteCategories {
    me {
      id
      favoriteCategories
    }
  }
`);
