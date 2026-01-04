import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { Footer } from '@/widgets/layout';
import { ProductDetailPageHeader } from '@/widgets/product-detail';

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
