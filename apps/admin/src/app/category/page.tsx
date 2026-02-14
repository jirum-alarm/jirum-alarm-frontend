import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import CategoryList from './components/CategoryList';

const CategoryPage = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">카테고리 관리</h2>
      </div>
      <CategoryList />
    </DefaultLayout>
  );
};

export default CategoryPage;
