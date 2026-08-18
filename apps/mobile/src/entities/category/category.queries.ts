import {queryOptions} from '@tanstack/react-query';

import {CategoryService} from '@/shared/api/category';

/** 발견 탭의 '전체' 는 서버에 없는 합성 카테고리다. id 0 으로 둔다(web 과 같다). */
export const ALL_CATEGORY = {id: 0, name: '전체'} as const;

export type CategoryItem = {id: number; name: string};

/**
 * 탭바에 쓸 카테고리. web: entities/category/api/category.api.ts
 * getCategoriesForUser 와 같은 규칙 —
 * 선호 카테고리가 있으면 그것만, 없거나 조회 실패면 전체.
 *
 * ★ web 은 서버에서 토큰 유무를 먼저 보고 갈라지지만 RN 은 HttpClient 가
 * 토큰 없으면 그냥 보내므로(me → null) 분기 없이 한 번에 처리된다.
 */
async function getCategoriesForUser(): Promise<CategoryItem[]> {
  const categories = (await CategoryService.getCategories()).map(c => ({
    id: Number(c.id),
    name: c.name,
  }));

  try {
    const favorites = await CategoryService.getMyFavoriteCategories();
    if (favorites && favorites.length > 0) {
      const filtered = categories.filter(c => favorites.includes(c.id));
      // 선호가 이미 사라진 카테고리만 남은 경우 빈 탭바가 되므로 전체로 되돌린다.
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // 선호 조회 실패는 무시 — 전체 카테고리로 보여준다(web 과 같다).
  }

  return categories;
}

export class CategoryQueries {
  static readonly keys = {
    all: ['category'] as const,
    forUser: () => [...this.keys.all, 'forUser'] as const,
  };

  static categoriesForUser() {
    return queryOptions({
      queryKey: this.keys.forUser(),
      queryFn: getCategoriesForUser,
      // web 과 같은 24시간. 카테고리는 거의 안 바뀐다.
      staleTime: 1000 * 60 * 60 * 24,
      retry: 2,
    });
  }
}
