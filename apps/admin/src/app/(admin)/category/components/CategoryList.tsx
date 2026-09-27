'use client';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useGetCategories } from '@/hooks/graphql/category';

const CategoryList = () => {
  const { data, loading } = useGetCategories();
  const categories = data?.categories ?? [];

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Panel>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2">ID</th>
            <th className="px-4 py-4 text-sm font-medium text-bodydark2">카테고리명</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-stroke dark:border-strokedark">
              <td className="px-4 py-4 text-center text-sm text-black dark:text-white">
                {category.id}
              </td>
              <td className="px-4 py-4 text-sm text-black dark:text-white">{category.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-bodydark2">카테고리가 없습니다.</div>
      )}
    </Panel>
  );
};

export default CategoryList;
