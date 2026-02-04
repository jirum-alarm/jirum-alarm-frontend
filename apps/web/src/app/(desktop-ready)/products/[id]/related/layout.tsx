import { checkDevice } from '@/app/actions/agent';

import { ProductService } from '@/shared/api/product';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import Footer from '@/widgets/layout/ui/desktop/Footer';

function truncateTitle(title: string, maxLength: number = 20): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

const RelatedProductsLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;
  const { isMobile } = await checkDevice();

  const product = await ProductService.getProductInfo({ id: +id });
  const displayTitle = product
    ? `${truncateTitle(product.title, isMobile ? 15 : 20)} 관련 상품`
    : '관련 상품';

  const renderMobile = () => {
    return (
      <BasicLayout title={displayTitle} hasBackButton>
        {children}
      </BasicLayout>
    );
  };

  const renderDesktop = () => {
    return (
      <div className="max-w-layout-max mx-auto">
        <div className="mt-14 pt-11">
          <SectionHeader title={displayTitle} />
          <div className="mt-4">{children}</div>
        </div>
        <Footer />
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
};

export default RelatedProductsLayout;
