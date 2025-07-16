import BasicLayout from '@/components/layout/BasicLayout';
import DeviceSpecific from '@/components/layout/DeviceSpecific';

import { NoticeProfitLink } from './components/NoticeProfitUrl';
import ProductDetailPageHeader from './components/ProductDeatilPageHeader';

const ProductDetailLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;
  return (
    <DeviceSpecific
      mobile={
        <BasicLayout header={<ProductDetailPageHeader productId={+id} />}>{children}</BasicLayout>
      }
      desktop={
        <>
          <div className="mx-auto mt-[56px] grid max-w-screen-layout-max grid-cols-12 gap-x-6 pt-11">
            <div className="col-span-1" />
            <div className="col-span-10">{children}</div>
            <div className="col-span-1" />
          </div>
          <NoticeProfitLink />
        </>
      }
    />
  );
};

export default ProductDetailLayout;
