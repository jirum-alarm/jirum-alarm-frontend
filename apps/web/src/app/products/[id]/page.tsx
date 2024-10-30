import { Metadata } from 'next';
import { Suspense } from 'react';

import ProductDetailContainerServer from './components/ProductDetailContainerServer';

import { SERVICE_URL } from '@/constants/env';
import { defaultMetadata } from '@/constants/metadata';
import { ProductService } from '@/shared/api/product';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;

  const { product } = await ProductService.getProductServer({ id: +id });
  if (!product) {
    return defaultMetadata;
  }

  const productGuides = await ProductService.getProductGuides({ productId: +product.id });

  const title = `지름알림 | ${product.title}`;

  const guideDescriptions = productGuides.productGuides
    .map((guide) => `${guide.title}: ${guide.content}`)
    .join(', ');
  const description = guideDescriptions || '지름알림에서 제공하는 초특가 핫딜 상품!';

  const image = product.thumbnail || `${SERVICE_URL}/opengraph-image.png`;
  const url = `${SERVICE_URL}/products/${id}`;

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
    icons: {
      icon: '/icon.png',
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
