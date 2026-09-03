import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { preload } from 'react-dom';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { ProductService } from '@/shared/api/product';
import type { ProductModelPageLink } from '@/shared/api/product/product.service';
import { CATEGORY_MAP } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { robotsDirective } from '@/shared/config/metadata';
import { convertToWebp } from '@/shared/lib/utils/image';

import { isFromToss, stripPriceFromTitle } from '@/entities/product/lib/from-toss';
import { parseProductId } from '@/entities/product/lib/product-id';

import { CollectProductOnView } from '@/features/product-actions/ui/CollectProductOnView';
import {
  buildOfferFreshness,
  buildProductSeoTitle,
  clipMetaDescription,
  formatDealAgeNotice,
  formatPriceHistorySeoText,
  generateDescription,
  MISSING_PRODUCT_METADATA,
  parseNumericPrice,
  type PriceHistorySeoSummary,
  summarizePriceHistoryForSeo,
} from '@/features/product-detail/lib/product-seo';
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
/** 히어로용 — 실패해도 상세는 막지 않음. generateMetadata 는 안 기다린다. */
const getPriceVerdictCached = cache(async (id: number) => {
  try {
    const data = await ProductService.getPriceVerdict({ id });
    return data?.product?.priceVerdict ?? null;
  } catch {
    return null;
  }
});
/** 댓글 요약 SEO용 — 실패·미생성(커버리지 낮음)이어도 메타는 막지 않음 */
const getProductAdditionalInfoCached = cache(async (id: number) => {
  try {
    return await ProductService.getProductAdditionalInfo({ id });
  } catch {
    return null;
  }
});

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

function priceHistoryFromProduct(
  data: Awaited<ReturnType<typeof ProductService.getPriceHistory>> | null | undefined,
): PriceHistorySeoSummary | null {
  return summarizePriceHistoryForSeo(data?.product?.priceHistory ?? null);
}

/**
 * 서버 HTML 에 넣을 모델 페이지 링크. `basis === 'SIMILAR'` 는 이 상품의 이력이 아니라
 * 유사 상품 이력이라 모델 페이지와 대응이 약해 링크하지 않는다(기존 CTA 조건과 동일).
 */
function modelPageLinkFromProduct(
  data: Awaited<ReturnType<typeof ProductService.getPriceHistory>> | null | undefined,
): ProductModelPageLink | null {
  const modelPage = data?.product?.modelPage ?? null;
  if (!modelPage?.slug) return null;
  if (data?.product?.priceHistory?.basis === 'SIMILAR') return null;

  return modelPage;
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
  hidePrice?: boolean,
  commentSummary?: string | null,
) {
  if (!product) return null;

  const categoryName = resolveCategoryName(product);
  const priceValue = hidePrice ? null : parseNumericPrice(product.price);
  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;
  const description = hidePrice
    ? product.title
    : generateDescription(productGuides, product, categoryName, priceHistorySeo, commentSummary);
  const productUrl = `${METADATA_SERVICE_URL}/products/${product.id}`;
  const mallName = product.mallName?.trim() || null;
  // 게시일 기준 재고·가격 유효기간. 오래된 딜을 InStock 으로 단정하지 않는다.
  const freshness = buildOfferFreshness(product.postedAt, product.isEnd);

  const additionalProperty: Array<Record<string, unknown>> = hidePrice
    ? []
    : [...guidePropertiesToJsonLd(productGuides)];

  const summaryText = commentSummary?.trim();
  if (summaryText) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: '커뮤니티 댓글 요약',
      value: summaryText,
    });
  }

  // 시계열 Offer 배열은 Google 권장과 어긋나기 쉬워, 기간 최저/최고만 additionalProperty로 노출
  if (!hidePrice && priceHistorySeo) {
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
    url: productUrl,
    image: [image],
    description,
    // brand 는 넣지 않는다. 여기서 쓸 수 있는 값은 provider.nameKr(제보 커뮤니티 = 뽐뿌·맘이베베)
    // 뿐이고, 그건 제조사가 아니라 출처다 — 구조화 데이터가 화면과 어긋나면 신뢰만 깎인다.
    // ponytail: 실제 브랜드 컬럼이 상품에 붙으면 그때 채운다.
    category: categoryName,
    ...(additionalProperty.length ? { additionalProperty } : {}),
    // 가격 파싱 실패 시 Offer 자체를 생략한다(price:null 직렬화 방지 — 검색/AI 오인용 차단).
    ...(priceValue
      ? {
          offers: {
            '@type': 'Offer',
            price: priceValue,
            priceCurrency: 'KRW',
            ...freshness,
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
              ...freshness,
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { from } = await searchParams;
  const hidePrice = isFromToss(from);

  // `/products/null` 처럼 id 가 숫자가 아니면 조회를 던져 500 이 나갔다. 404 로 내린다.
  const productId = parseProductId(id);
  if (productId === null) {
    return { ...MISSING_PRODUCT_METADATA };
  }

  const product = await getProductInfoCached(productId);
  if (!product) {
    return { ...MISSING_PRODUCT_METADATA };
  }

  const [productGuides, priceHistoryData, additionalInfo] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
    getProductAdditionalInfoCached(+product.id),
  ]);
  const priceHistorySeo = hidePrice ? null : priceHistoryFromProduct(priceHistoryData);
  const commentSummary = additionalInfo?.commentSummary?.summary ?? null;

  const displayTitle = hidePrice ? stripPriceFromTitle(product.title) : product.title;

  const categoryName = resolveCategoryName(product);
  const priceValue = hidePrice ? null : parseNumericPrice(product.price);
  // 토스 유입(hidePrice)은 가격 노출 금지라 priceValue 가 null → 제목에도 안 붙는다.
  const title = buildProductSeoTitle(displayTitle, product.isEnd, priceValue);
  const description = hidePrice
    ? displayTitle
    : clipMetaDescription(
        generateDescription(productGuides, product, categoryName, priceHistorySeo, commentSummary),
      );

  const image = product.thumbnail || `${METADATA_SERVICE_URL}/opengraph-image.webp`;
  const url = `${METADATA_SERVICE_URL}/products/${productId}`;

  const defaultKeywords =
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림';
  const keywords = `${displayTitle}${categoryName ? `, ${categoryName}` : ''}, ${defaultKeywords}`;

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
    // dev 배포는 noindex 로 내려간다 — 여기 하드코딩된 `index: true` 때문에 dev 상품 페이지가
    // Bing 인덱스와 학습 코퍼스에 들어갔다.
    robots: robotsDirective,
    other,
  };
}

export default async function ProductDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const hidePrice = isFromToss(from);

  // generateMetadata 와 같은 가드. 숫자가 아닌 id 는 진짜 404.
  const productId = parseProductId(id);
  if (productId === null) {
    notFound();
  }

  const token = await getAccessToken();
  const isUserLogin = !!token;

  // post_view 수집은 클라이언트에서 한다(CollectProductOnView). SSR Server Action 경로는
  // next/headers cookies() 로 deviceId 를 읽는데 미들웨어가 막 구운 쿠키가 같은 요청엔 안
  // 보여서 매 페이지뷰 새 deviceId 가 발급됐다(91.9% 1상품/1이벤트 계측 붕괴). 클라 경로는
  // localStorage 기반 안정 id 라 같은 사람이 같은 deviceId 로 누적된다.

  const device = await checkDevice();
  const { isMobile } = device;

  const renderMobile = (
    productData?: any,
    guides?: any,
    verdict?: any,
    priceRangeText?: string | null,
    modelPage?: ProductModelPageLink | null,
    dealAgeNotice?: string | null,
  ) => {
    return (
      <MobileProductDetailPage
        productId={productId}
        isUserLogin={isUserLogin}
        initialProduct={productData}
        device={device}
        initialGuides={guides}
        initialVerdict={verdict}
        hidePrice={hidePrice}
        priceRangeText={priceRangeText}
        modelPage={modelPage}
        ageNotice={dealAgeNotice}
      />
    );
  };
  const renderDesktop = (
    productData?: any,
    guides?: any,
    verdict?: any,
    priceRangeText?: string | null,
    modelPage?: ProductModelPageLink | null,
    dealAgeNotice?: string | null,
  ) => {
    return (
      <DesktopProductDetailPage
        productId={productId}
        isUserLogin={isUserLogin}
        initialProduct={productData}
        device={device}
        initialGuides={guides}
        initialVerdict={verdict}
        hidePrice={hidePrice}
        priceRangeText={priceRangeText}
        modelPage={modelPage}
        ageNotice={dealAgeNotice}
      />
    );
  };

  /* JSON-LD 생성을 위한 상품 정보 조회 (generateMetadata와 dedupe됨) */
  const product = await getProductInfoCached(productId);
  // 없는/종료된 상품은 soft 404(200+홈 폴백) 대신 진짜 404를 반환한다.
  // 폴백 시 title이 홈과 동일해져 서치어드바이저 "동일 title 다수" 유발.
  if (!product) {
    notFound();
  }
  const [productGuides, priceHistoryData, priceVerdict, additionalInfo] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
    getPriceVerdictCached(+product.id),
    getProductAdditionalInfoCached(+product.id),
  ]);
  const priceHistorySeo = priceHistoryFromProduct(priceHistoryData);
  const commentSummary = additionalInfo?.commentSummary?.summary ?? null;
  // 서버 HTML 에 박을 가격 문맥. meta·JSON-LD 와 같은 함수를 써서 문구가 갈리지 않게 한다.
  const priceRangeText =
    !hidePrice && priceHistorySeo ? formatPriceHistorySeoText(priceHistorySeo) : null;
  const modelPageLink = modelPageLinkFromProduct(priceHistoryData);
  // JSON-LD 가 availability 를 생략하는 것과 같은 임계(30일)로 화면에도 안내를 낸다.
  const ageNotice = hidePrice ? null : formatDealAgeNotice(product.postedAt, product.isEnd);
  const jsonLd = generateProductJsonLd(
    product,
    productGuides ?? undefined,
    hidePrice ? null : priceHistorySeo,
    hidePrice,
    commentSummary,
  );
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
      <CollectProductOnView productId={productId} />
      <ProductPrefetch productId={productId}>
        {!isMobile
          ? renderDesktop(
              product ?? undefined,
              productGuides?.productGuides ?? undefined,
              priceVerdict,
              priceRangeText,
              modelPageLink,
              ageNotice,
            )
          : renderMobile(
              product ?? undefined,
              productGuides?.productGuides ?? undefined,
              priceVerdict,
              priceRangeText,
              modelPageLink,
              ageNotice,
            )}
      </ProductPrefetch>
    </>
  );
}
