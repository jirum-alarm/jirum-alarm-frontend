import { CategoryService } from '@/shared/api/category';

// const initialCategory = { id: null as null | number, name: '전체' };

export const getCategoriesForUser = async () => {
  // 두 개의 API를 병렬로 요청하고 각각의 성공/실패 여부를 다룹니다.
  const [categoriesResult, myCategoriesResult] = await Promise.allSettled([
    CategoryService.getCategories(),
    CategoryService.getMyCategoriesServer(),
  ]);

  let categories: { id: number; name: string }[] = [];

  if (categoriesResult.status === 'fulfilled') {
    categories = categories.concat(
      categoriesResult.value.categories.map((category) => ({
        id: Number(category.id),
        name: category.name,
      })),
    );
  }

  // 기본 카테고리를 반환해야 하는 경우
  if (myCategoriesResult.status === 'fulfilled' && categoriesResult.status === 'fulfilled') {
    const favoriteCategories = myCategoriesResult.value.me.favoriteCategories;

    if (favoriteCategories && favoriteCategories.length > 0) {
      return {
        categories: categories.filter((category) => {
          if (category.id === null) return true;
          return favoriteCategories.includes(category.id);
        }),
      };
    }
  }

  // 기본적으로 모든 카테고리를 반환합니다.
  return { categories };
};
