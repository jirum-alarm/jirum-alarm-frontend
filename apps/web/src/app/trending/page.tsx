import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import TrendingContainer from './components/TrendingContainer';
import { getMyCategories } from '@/features/users/server/categories';
import { getCategories } from '@/features/categories/components/categories';

export const dynamic = 'force-dynamic';

const TrendingPage = async () => {
  const { categories } = await getTabCategories();

  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <TrendingContainer categories={categories} />
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;

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
