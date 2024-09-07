import BasicLayout from '@/components/layout/BasicLayout';
import ProductDetailContainer from './components/ProductDetailContainer';
import { Metadata } from 'next';
import { getProductDetail } from '@/features/products/server/productDetail';
import { IS_VERCEL_PRD, SERVICE_URL } from '@/constants/env';
import ProductDetailPageHeader from './components/ProductDeatilPageHeader';
import { getProductGuides } from '@/features/products/server/productGuides';
import { Suspense } from 'react';
import { ProductService } from '@/shared/api/product';
import { defaultMetadata } from '@/constants/metadata';
import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import ProductDetailContainerServer from './components/ProductDetailContainerServer';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  {
    /* @TODO: remove afeter v1.1.0 QA */
  }
  // if (IS_VERCEL_PRD) {
  //   return {};
  // }

  const id = params.id;

  const { product } = await ProductService.getProduct({ id: +id });
  if (!product) return defaultMetadata;
  const productGuides = await ProductService.getProductGuides({ productId: +product.id });

  const title = `지름알림 | ${product.title}`;
  const description =
    productGuides.productGuides.map((guide) => guide.content).join(', ') ||
    '핫딜 정보를 알려드려요!';
  const image = product.thumbnail || '/opengraph-image.png';

  return {
    title,
    openGraph: {
      title,
      description,
      url: `${SERVICE_URL}/products/${id}`,
      type: 'website',
      images: [{ url: image }],
    },
    icons: {
      icon: '/icon.png',
    },
  };
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  {
    /* @TODO: remove afeter v1.1.0 QA */
  }
  // if (IS_VERCEL_PRD) {
  //   return {};
  // }

  return (
    <Suspense>
      <ProductDetailContainerServer productId={+params.id} />
    </Suspense>
  );
}
