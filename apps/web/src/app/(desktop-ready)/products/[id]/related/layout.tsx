import { Metadata } from 'next';

import { checkDevice } from '@/app/actions/agent';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import Footer from '@/widgets/layout/ui/desktop/Footer';

import { getProductInfoCached } from './getProductInfoCached';

function truncateTitle(title: string, maxLength: number = 20): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductInfoCached(Number(id)).catch(() => null);

  if (!product) {
    return { title: '관련 상품 | 지름알림' };
  }

  const title = `${product.title} 관련 상품 | 지름알림`;
  const description = `'${product.title}'와(과) 함께 보면 좋은 관련 핫딜 상품을 모아봤어요.`;
  const url = `${METADATA_SERVICE_URL}/products/${id}/related`;
  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: '지름알림',
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: image, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image,
    },
    alternates: {
      canonical: url,
    },
  };
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

  const product = await getProductInfoCached(+id);
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
