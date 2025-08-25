import { Metadata } from 'next';

import { checkDevice } from '@/app/actions/agent';
import { collectProductAction } from '@/app/actions/product';
import { getAccessToken } from '@/app/actions/token';
import { METADATA_SERVICE_URL } from '@/constants/env';
import { defaultMetadata } from '@/constants/metadata';
import { ProductPrefetch } from '@/features/product-detail/prefetch';

import { ProductService } from '@shared/api/product';

import DesktopProductDetailPage from './components/desktop/ProductDetailPage';
import MobileProductDetailPage from './components/mobile/ProductDetailPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const product = await ProductService.getProductInfo({ id: +id });
  if (!product) {
    return defaultMetadata;
  }

  const productGuides = await ProductService.getProductGuides({
    productId: +product.id,
  });

  const title = `${product.title} | 지름알림`;

  const guideDescriptions = productGuides.productGuides
    .map((guide) => `${guide.title}: ${guide.content}`)
    .join(', ');
  const description = guideDescriptions || '지름알림에서 제공하는 초특가 핫딜 상품!';

  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.png`;
  const url = `${METADATA_SERVICE_URL}/products/${id}`;

  const defaultKeywords =
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림';
  const keywords = `${product.title}${product.categoryName ? `, ${product.categoryName}` : ''}, ${defaultKeywords}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: image,
          alt: product.title,
        },
      ],
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
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const token = await getAccessToken();
  const isUserLogin = !!token;

  await collectProductAction(+id);

  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return <MobileProductDetailPage productId={+id} isUserLogin={isUserLogin} />;
  };
  const renderDesktop = () => {
    return <DesktopProductDetailPage productId={+id} isUserLogin={isUserLogin} />;
  };

  return (
    <ProductPrefetch productId={+id}>
      {!isMobile ? renderDesktop() : renderMobile()}
    </ProductPrefetch>
  );
}
