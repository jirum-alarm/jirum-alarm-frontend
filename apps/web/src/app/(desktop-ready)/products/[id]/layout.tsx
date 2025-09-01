import { checkDevice } from '@/app/actions/agent';
import BasicLayout from '@/components/layout/BasicLayout';

import Footer from '../../components/desktop/Footer';

import ProductDetailPageHeader from './components/ProductDeatilPageHeader';

const ProductDetailLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;

  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return (
      <BasicLayout header={<ProductDetailPageHeader productId={+id} />}>{children}</BasicLayout>
    );
  };
  const renderDesktop = () => {
    return (
      <>
        <div className="mt-14 pt-11">{children}</div>
        <Footer />
      </>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
};

export default ProductDetailLayout;
