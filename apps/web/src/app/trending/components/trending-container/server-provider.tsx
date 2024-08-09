import { getMyCategories } from '@/features/users/server/categories';
import { getCategories } from '@/features/categories/components/categories';
import { TrendingContainer } from '.';

export const TrendingContainerServer = async () => {
  const { categories } = await getTabCategories();

  return <TrendingContainer categories={categories} />;
};

const getTabCategories = async () => {
  const { data } = await getCategories();

  const initialCategory = { id: null as null | number, name: '전체' };

  const categories: { id: null | number; name: string }[] = [initialCategory].concat(
    data.categories.map((category) => ({
      id: Number(category.id),
      name: category.name,
    })),
  );
  try {
    const { data } = await getMyCategories();
    const favoriteCategories = data.me.favoriteCategories;
    if (favoriteCategories && favoriteCategories.length > 0) {
      return {
        categories: categories.filter((category) => {
          if (category.id === null) return true;
          return favoriteCategories.includes(category.id);
        }),
      };
    }
  } catch (e) {
    return { categories };
  }

  return { categories };
};
