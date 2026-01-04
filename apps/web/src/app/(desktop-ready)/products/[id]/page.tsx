import { Metadata } from 'next';

import { checkDevice } from '@/app/actions/agent';
import { collectProductAction } from '@/app/actions/product';
import { getAccessToken } from '@/app/actions/token';

import { ProductService } from '@/shared/api/product';
import { CATEGORY_MAP } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { defaultMetadata } from '@/shared/config/metadata';

import { ProductPrefetch } from '@/features/product-detail/prefetch';

import DesktopProductDetailPage from '@/widgets/product-detail/ui/desktop/ProductDetailPage';
import MobileProductDetailPage from '@/widgets/product-detail/ui/mobile/ProductDetailPage';

function parseNumericPrice(rawPrice?: string | null) {
  if (!rawPrice) {
    return null;
  }

  const normalized = rawPrice.replace(/[^0-9]/g, '');

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);

  return Number.isNaN(numericValue) ? null : numericValue;
}

function resolveCategoryName(product: {
  categoryId?: number | null;
  categoryName?: string | null;
}) {
  if (product.categoryId) {
    const mappedCategory = CATEGORY_MAP[product.categoryId];
    if (mappedCategory) {
      return mappedCategory.text;
    }
  }

  return product.categoryName ?? undefined;
}

function generateDescription(
  productGuides: { productGuides: Array<{ title: string; content: string }> },
  product: {
    title: string;
    categoryId?: number | null;
    categoryName?: string | null;
    price?: string | null;
    mallName?: string | null;
    provider?: { nameKr?: string | null } | null;
  },
  categoryName?: string,
): string {
  const guideDescriptions = productGuides.productGuides
    .map((guide) => `${guide.title}: ${guide.content}`)
    .join(', ');

  if (guideDescriptions) {
    return guideDescriptions;
  }

  const resolvedCategoryName = categoryName ?? resolveCategoryName(product);
  const numericPrice = parseNumericPrice(product.price);
  const priceText = numericPrice ? `${numericPrice.toLocaleString()}원` : '';
  const categoryText = resolvedCategoryName ? `[${resolvedCategoryName}]` : '';
  const mallText = product.mallName ? ` ${product.mallName}` : '';
  const providerText = product.provider?.nameKr ? ` ${product.provider.nameKr}` : '';

  const parts = [
    categoryText,
    product.title,
    priceText ? `현재가 ${priceText}` : '',
    mallText || providerText ? `구매처:${mallText || providerText}` : '',
  ].filter(Boolean);

  return parts.length > 0
    ? `${parts.join(' | ')} | 지름알림에서 제공하는 초특가 핫딜 상품!`
    : `${product.title} | 지름알림에서 제공하는 초특가 핫딜 상품!`;
}

// Product 구조화 데이터 생성 함수
function generateProductJsonLd(
  product: Awaited<ReturnType<typeof ProductService.getProductInfo>>,
  productGuides?: { productGuides: Array<{ title: string; content: string }> },
) {
  if (!product) return null;

  const categoryName = resolveCategoryName(product);
  const priceValue = parseNumericPrice(product.price);
  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;
  const description = productGuides
    ? generateDescription(productGuides, product, categoryName)
    : product.title;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [image],
    description,
    brand: {
      '@type': 'Brand',
      name: product.provider?.nameKr || '지름알림',
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      price: priceValue,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${METADATA_SERVICE_URL}/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: product.mallName || '지름알림',
      },
    },
  };
}

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

  const categoryName = resolveCategoryName(product);
  const priceValue = parseNumericPrice(product.price);
  const description = generateDescription(productGuides, product, categoryName);

  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;
  const url = `${METADATA_SERVICE_URL}/products/${id}`;

  const defaultKeywords =
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림';
  const keywords = `${product.title}${categoryName ? `, ${categoryName}` : ''}, ${defaultKeywords}`;

  const retailerName = product.mallName?.trim();
  const otherMeta: Record<string, string | number> = {
    'product:id': product.id,
  };

  if (categoryName) {
    otherMeta['product:category'] = categoryName;
  }

  if (priceValue) {
    otherMeta['product:price:amount'] = priceValue;
    otherMeta['product:price:currency'] = 'KRW';
  }

  if (retailerName) {
    otherMeta['product:retailer'] = retailerName;
  }

  if (product.provider?.nameKr) {
    otherMeta['product:brand'] = product.provider.nameKr;
  }

  const other = Object.keys(otherMeta).length ? otherMeta : undefined;

  return {
    title,
    description,
    keywords,
    applicationName: '지름알림',
    publisher: '지름알림',
    creator: product.provider?.nameKr || '지름알림',
    category: categoryName,
    classification: categoryName ? `${categoryName} 상품` : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: '지름알림',
      locale: 'ko_KR',
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
    other,
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const token = await getAccessToken();
  const isUserLogin = !!token;

  collectProductAction(+id).catch();

  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return <MobileProductDetailPage productId={+id} isUserLogin={isUserLogin} />;
  };
  const renderDesktop = () => {
    return <DesktopProductDetailPage productId={+id} isUserLogin={isUserLogin} />;
  };

  /* JSON-LD 생성을 위한 상품 정보 조회 */
  const product = await ProductService.getProductInfo({ id: +id });
  const productGuides = product
    ? await ProductService.getProductGuides({ productId: +product.id })
    : null;

  const jsonLd = generateProductJsonLd(product, productGuides || undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPrefetch productId={+id}>
        {!isMobile ? renderDesktop() : renderMobile()}
      </ProductPrefetch>
    </>
  );
}
