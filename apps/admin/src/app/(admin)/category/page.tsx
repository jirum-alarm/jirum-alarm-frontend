import CategoryList from './components/CategoryList';

const CategoryPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">카테고리 관리</h2>
      </div>
      <CategoryList />
    </>
  );
};

export default CategoryPage;
