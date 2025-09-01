import { checkDevice } from '@/app/actions/agent';
import BasicLayout from '@/components/layout/BasicLayout';

import NoticeProfitLink from '@features/product-detail/components/NoticeProfitUrl';

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
        <div className="max-w-layout-max mx-auto mt-14 grid grid-cols-12 gap-x-6 pt-11">
          <div className="col-span-10 col-start-2">{children}</div>
        </div>
        <Footer />
      </>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
};

export default ProductDetailLayout;
