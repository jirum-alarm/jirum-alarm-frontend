import BasicLayout from '@/components/layout/BasicLayout';

import ProductDetailPageHeader from './components/ProductDeatilPageHeader';

const ProductDetailLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;
  return <BasicLayout header={<ProductDetailPageHeader productId={+id} />}>{children}</BasicLayout>;
};

export default ProductDetailLayout;
