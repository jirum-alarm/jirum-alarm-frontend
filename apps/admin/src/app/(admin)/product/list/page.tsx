import ProductListTable from './components/ProductListTable';

const ProductListPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">상품 관리</h2>
      </div>
      <ProductListTable />
    </>
  );
};

export default ProductListPage;
