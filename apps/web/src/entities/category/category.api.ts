import { getAccessToken } from '@/app/actions/token';

import { CategoryService } from '@shared/api/category';

// const initialCategory = { id: null as null | number, name: '전체' };

export const getCategoriesForUser = async () => {
  try {
    const token = await getAccessToken();

    // 카테고리 데이터 조회
    const categoriesData = await CategoryService.getCategories();
    const categories: { id: number; name: string }[] = categoriesData.categories.map(
      (category) => ({
        id: Number(category.id),
        name: category.name,
      }),
    );

    // 토큰이 없으면 전체 카테고리 반환
    if (!token) {
      return { categories };
    }

    // 토큰이 있으면 사용자 선호 카테고리 조회
    try {
      const myCategoriesData = await CategoryService.getMyCategories();
      const favoriteCategories = myCategoriesData.me?.favoriteCategories;

      // 선호 카테고리가 있으면 필터링해서 반환
      if (favoriteCategories && favoriteCategories.length > 0) {
        return {
          categories: categories.filter((category) => favoriteCategories.includes(category.id)),
        };
      }
    } catch {
      // 선호 카테고리 조회 실패 시 전체 카테고리 반환
    }

    return { categories };
  } catch {
    // 토큰 조회 실패 시 카테고리만 조회
    const categoriesData = await CategoryService.getCategories();
    const categories: { id: number; name: string }[] = categoriesData.categories.map(
      (category) => ({
        id: Number(category.id),
        name: category.name,
      }),
    );
    return { categories };
  }
};
