import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { preload } from 'react-dom';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { ProductService } from '@/shared/api/product';
import { CATEGORY_MAP } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { defaultMetadata } from '@/shared/config/metadata';
import { convertToWebp } from '@/shared/lib/utils/image';

import { CollectProductOnView } from '@/features/product-actions/ui/CollectProductOnView';
import { ProductPrefetch } from '@/features/product-detail/prefetch';

import DesktopProductDetailPage from '@/widgets/product-detail/ui/desktop/ProductDetailPage';
import MobileProductDetailPage from '@/widgets/product-detail/ui/mobile/ProductDetailPage';

// generateMetadata와 page에서 동일한 productId로 두 번 호출되므로
// 요청 단위로 결과를 memoize한다. GraphQL POST는 Next.js fetch dedup 보장이 없음.
const getProductInfoCached = cache((id: number) => ProductService.getProductInfo({ id }));
const getProductGuidesCached = cache((productId: number) =>
  ProductService.getProductGuides({ productId }),
);
/** SEO용 — UI 기본과 동일하게 90일. 실패해도 메타 생성은 막지 않음 */
const getPriceHistoryCached = cache(async (id: number) => {
  try {
    return await ProductService.getPriceHistory({ id, days: 90 });
  } catch {
    return null;
  }
});

type PriceHistorySeoSummary = {
  minPrice: number;
  maxPrice: number;
  rangeDays: number;
  pointCount: number;
  confidence: 'HIGH' | 'LOW';
};

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

function summarizePriceHistoryForSeo(
  data: Awaited<ReturnType<typeof ProductService.getPriceHistory>> | null | undefined,
): PriceHistorySeoSummary | null {
  const history = data?.product?.priceHistory;
  const points = history?.points;
  if (!history || !points || points.length < 2) return null;

  const prices = points.map((p) => p.price).filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length < 2) return null;

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    rangeDays: history.rangeDays,
    pointCount: points.length,
    confidence: history.confidence,
  };
}

function formatPriceHistorySeoText(summary: PriceHistorySeoSummary): string {
  const periodLabel =
    summary.rangeDays >= 360
      ? `${Math.round(summary.rangeDays / 365)}년`
      : `${Math.max(1, Math.round(summary.rangeDays / 30))}개월`;
  const min = summary.minPrice.toLocaleString('ko-KR');
  const max = summary.maxPrice.toLocaleString('ko-KR');

  // LOW(유사상품)는 오인용 줄이도록 완곡 표기
  if (summary.confidence === 'LOW') {
    return `최근 ${periodLabel} 유사 핫딜가 ${min}~${max}원`;
  }
  return `최근 ${periodLabel} 핫딜 최저가 ${min}원 · 최고가 ${max}원`;
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
  productGuides:
    | { productGuides?: Array<{ title: string; content: string }> | null }
    | null
    | undefined,
  product: {
    title: string;
    categoryId?: number | null;
    categoryName?: string | null;
    price?: string | null;
    mallName?: string | null;
    provider?: { nameKr?: string | null } | null;
  },
  categoryName?: string,
  priceHistorySeo?: PriceHistorySeoSummary | null,
): string {
  const historyText = priceHistorySeo ? formatPriceHistorySeoText(priceHistorySeo) : '';
  const mallName = product.mallName?.trim() || product.provider?.nameKr?.trim() || '';
  const numericPrice = parseNumericPrice(product.price);
  const priceText = numericPrice ? `${numericPrice.toLocaleString('ko-KR')}원` : '';

  const guideParts =
    productGuides?.productGuides
      ?.filter((g) => g.title?.trim() && g.content?.trim())
      .map((g) => `${g.title.trim()}: ${g.content.trim().replace(/\s+/g, ' ')}`) ?? [];

  // 쇼핑몰 · 가격 · productGuides (+ 추이) — description은 요약, 상세 구조는 JSON-LD
  if (guideParts.length > 0) {
    const head = [
      mallName ? `쇼핑몰: ${mallName}` : '',
      // guide에 가격 행이 없으면 상품 가격으로 보완
      guideParts.some((p) => p.startsWith('가격:')) ? '' : priceText ? `가격: ${priceText}` : '',
      ...guideParts,
    ].filter(Boolean);

    return historyText ? `${head.join(', ')} | ${historyText}` : head.join(', ');
  }

  const resolvedCategoryName = categoryName ?? resolveCategoryName(product);
  const categoryText = resolvedCategoryName ? `[${resolvedCategoryName}]` : '';

  const parts = [
    categoryText,
    product.title,
    priceText ? `현재가 ${priceText}` : '',
    historyText,
    mallName ? `구매처: ${mallName}` : '',
  ].filter(Boolean);

  return parts.length > 0
    ? `${parts.join(' | ')} | 지름알림에서 제공하는 초특가 핫딜 상품!`
    : `${product.title} | 지름알림에서 제공하는 초특가 핫딜 상품!`;
}

/** productGuides → schema.org PropertyValue (빈 title/content 제외) */
function guidePropertiesToJsonLd(
  productGuides?: { productGuides?: Array<{ title: string; content: string }> | null } | null,
): Array<{ '@type': 'PropertyValue'; name: string; value: string }> {
  return (
    productGuides?.productGuides
      ?.filter((g) => g.title?.trim() && g.content?.trim())
      .map((g) => ({
        '@type': 'PropertyValue' as const,
        name: g.title.trim(),
        value: g.content.trim().replace(/\s+/g, ' '),
      })) ?? []
  );
}

// Product 구조화 데이터 생성 함수
// - 가격: offers.price
// - 쇼핑몰: offers.seller
// - productGuides(가격 상세·배송·프로모션 등): additionalProperty
function generateProductJsonLd(
  product: Awaited<ReturnType<typeof ProductService.getProductInfo>>,
  productGuides?: { productGuides?: Array<{ title: string; content: string }> | null },
  priceHistorySeo?: PriceHistorySeoSummary | null,
) {
  if (!product) return null;

  const categoryName = resolveCategoryName(product);
  const priceValue = parseNumericPrice(product.price);
  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;
  const description = productGuides
    ? generateDescription(productGuides, product, categoryName, priceHistorySeo)
    : product.title;
  const productUrl = `${METADATA_SERVICE_URL}/products/${product.id}`;
  const mallName = product.mallName?.trim() || null;

  const additionalProperty: Array<Record<string, unknown>> = [
    ...guidePropertiesToJsonLd(productGuides),
  ];

  // 시계열 Offer 배열은 Google 권장과 어긋나기 쉬워, 기간 최저/최고만 additionalProperty로 노출
  if (priceHistorySeo) {
    additionalProperty.push(
      {
        '@type': 'PropertyValue',
        name: priceHistorySeo.confidence === 'LOW' ? '최근 유사 핫딜 최저가' : '최근 핫딜 최저가',
        value: priceHistorySeo.minPrice,
        unitCode: 'KRW',
      },
      {
        '@type': 'PropertyValue',
        name: priceHistorySeo.confidence === 'LOW' ? '최근 유사 핫딜 최고가' : '최근 핫딜 최고가',
        value: priceHistorySeo.maxPrice,
        unitCode: 'KRW',
      },
    );
  }

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
    ...(additionalProperty.length ? { additionalProperty } : {}),
    // 가격 파싱 실패 시 Offer 자체를 생략한다(price:null 직렬화 방지 — 검색/AI 오인용 차단).
    ...(priceValue
      ? {
          offers: {
            '@type': 'Offer',
            price: priceValue,
            priceCurrency: 'KRW',
            availability: product.isEnd
              ? 'https://schema.org/Discontinued'
              : 'https://schema.org/InStock',
            url: productUrl,
            seller: {
              '@type': 'Organization',
              name: mallName || '지름알림',
            },
          },
        }
      : mallName
        ? {
            // 가격은 없지만 쇼핑몰만 있는 경우에도 seller를 남긴다
            offers: {
              '@type': 'Offer',
              priceCurrency: 'KRW',
              availability: product.isEnd
                ? 'https://schema.org/Discontinued'
                : 'https://schema.org/InStock',
              url: productUrl,
              seller: {
                '@type': 'Organization',
                name: mallName,
              },
            },
          }
        : {}),
  };
}

// 홈 > 상품 breadcrumb. 카테고리 전용 URL이 없어 2단계로만 구성한다.
function generateBreadcrumbJsonLd(
  product: Awaited<ReturnType<typeof ProductService.getProductInfo>>,
) {
  if (!product) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '지름알림',
        item: METADATA_SERVICE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.title,
        item: `${METADATA_SERVICE_URL}/products/${product.id}`,
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const product = await getProductInfoCached(+id);
  if (!product) {
    return defaultMetadata;
  }

  const [productGuides, priceHistoryData] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
  ]);
  const priceHistorySeo = summarizePriceHistoryForSeo(priceHistoryData);

  const title = `${product.title} | 지름알림`;

  const categoryName = resolveCategoryName(product);
  const priceValue = parseNumericPrice(product.price);
  const description = generateDescription(productGuides, product, categoryName, priceHistorySeo);

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

  if (priceHistorySeo) {
    otherMeta['product:price:low'] = priceHistorySeo.minPrice;
    otherMeta['product:price:high'] = priceHistorySeo.maxPrice;
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

  // post_view 수집은 클라이언트에서 한다(CollectProductOnView). SSR Server Action 경로는
  // next/headers cookies() 로 deviceId 를 읽는데 미들웨어가 막 구운 쿠키가 같은 요청엔 안
  // 보여서 매 페이지뷰 새 deviceId 가 발급됐다(91.9% 1상품/1이벤트 계측 붕괴). 클라 경로는
  // localStorage 기반 안정 id 라 같은 사람이 같은 deviceId 로 누적된다.

  const device = await checkDevice();
  const { isMobile } = device;

  const renderMobile = (productData?: any) => {
    return (
      <MobileProductDetailPage
        productId={+id}
        isUserLogin={isUserLogin}
        initialProduct={productData}
        device={device}
      />
    );
  };
  const renderDesktop = (productData?: any) => {
    return (
      <DesktopProductDetailPage
        productId={+id}
        isUserLogin={isUserLogin}
        initialProduct={productData}
        device={device}
      />
    );
  };

  /* JSON-LD 생성을 위한 상품 정보 조회 (generateMetadata와 dedupe됨) */
  const product = await getProductInfoCached(+id);
  // 없는/종료된 상품은 soft 404(200+홈 폴백) 대신 진짜 404를 반환한다.
  // 폴백 시 title이 홈과 동일해져 서치어드바이저 "동일 title 다수" 유발.
  if (!product) {
    notFound();
  }
  const [productGuides, priceHistoryData] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
  ]);
  const priceHistorySeo = summarizePriceHistoryForSeo(priceHistoryData);
  const jsonLd = generateProductJsonLd(product, productGuides ?? undefined, priceHistorySeo);
  const breadcrumbLd = generateBreadcrumbJsonLd(product);

  // LCP 이미지 preload: 모바일은 100vw, 데스크톱은 512px 슬롯
  const thumbnailForPreload = convertToWebp(product?.thumbnail) ?? product?.thumbnail;
  if (thumbnailForPreload) {
    const proxy = (w: number) =>
      `/_next/image?url=${encodeURIComponent(thumbnailForPreload)}&w=${w}&q=85`;
    if (isMobile) {
      preload(proxy(640), {
        as: 'image',
        fetchPriority: 'high',
        imageSizes: '100vw',
        imageSrcSet: `${proxy(640)} 640w, ${proxy(750)} 750w, ${proxy(828)} 828w, ${proxy(1080)} 1080w`,
      });
    } else {
      preload(proxy(640), {
        as: 'image',
        fetchPriority: 'high',
        imageSizes: '512px',
        imageSrcSet: `${proxy(640)} 1x, ${proxy(1080)} 2x`,
      });
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <CollectProductOnView productId={+id} />
      <ProductPrefetch productId={+id}>
        {!isMobile ? renderDesktop(product ?? undefined) : renderMobile(product ?? undefined)}
      </ProductPrefetch>
    </>
  );
}
