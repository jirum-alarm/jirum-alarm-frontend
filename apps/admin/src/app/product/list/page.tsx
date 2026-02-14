import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import ProductListTable from './components/ProductListTable';

const ProductListPage = async () => {
  const token = await getAccessToken();

  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">상품 관리</h2>
      </div>
      <ProductListTable />
    </DefaultLayout>
  );
};

export default ProductListPage;
