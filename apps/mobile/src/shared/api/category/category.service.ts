import {QueryCategories, QueryMyFavoriteCategories} from '@/graphql/category';
import {HttpClient} from '@/shared/lib/client';

/** 카테고리 조회. web: shared/api/category/category.service.ts */
export class CategoryService {
  static async getCategories() {
    const res = await HttpClient.withNoAuth().execute(QueryCategories);
    return res.data?.categories ?? [];
  }

  /** 로그인 유저의 선호 카테고리 id. 비로그인이면 me 가 null 이다. */
  static async getMyFavoriteCategories() {
    const res = await HttpClient.withAccessToken().execute(
      QueryMyFavoriteCategories,
    );
    return res.data?.me?.favoriteCategories ?? null;
  }
}
