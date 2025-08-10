import BasicLayout from '@/components/layout/BasicLayout';
import DeviceSpecific from '@/components/layout/DeviceSpecific';

import NoticeProfitLink from '@features/product-detail/components/NoticeProfitUrl';

import ProductDetailPageHeader from './components/ProductDeatilPageHeader';

const ProductDetailLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;

  const renderMobile = () => {
    return (
      <BasicLayout header={<ProductDetailPageHeader productId={+id} />}>{children}</BasicLayout>
    );
  };
  const renderDesktop = () => {
    return (
      <>
        <div className="mx-auto mt-[56px] grid max-w-screen-layout-max grid-cols-12 gap-x-6 pt-11">
          <div className="col-span-10 col-start-2">{children}</div>
        </div>
        <NoticeProfitLink />
      </>
    );
  };

  return <DeviceSpecific mobile={renderMobile} desktop={renderDesktop} />;
};

export default ProductDetailLayout;
