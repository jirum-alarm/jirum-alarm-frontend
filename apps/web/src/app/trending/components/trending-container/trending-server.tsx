import { CategoryQueries } from '@/entities/category';
import { QueryClient } from '@tanstack/react-query';
import { TrendingContainer } from '.';

export const TrendingContainerServer = async () => {
  const { categories } = await getTabCategories();

  return <TrendingContainer categories={categories} />;
};

const getTabCategories = async () => {
  const queryClient = new QueryClient();
  const data = await queryClient.fetchQuery(CategoryQueries.categories());
  const initialCategory = { id: null as null | number, name: '전체' };
  const categories: { id: null | number; name: string }[] = [initialCategory].concat(
    data.categories.map((category) => ({
      id: Number(category.id),
      name: category.name,
    })),
  );
  try {
    const { me } = await queryClient.fetchQuery(CategoryQueries.myCategories());
    const favoriteCategories = me.favoriteCategories;
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
