import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { UploaderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import type { ProductModelPageLink } from '@/shared/api/product/product.service';
import { CATEGORY_MAP } from '@/shared/config/categories';
import { categoryRankingPath } from '@/shared/config/category-ranking';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { robotsDirective } from '@/shared/config/metadata';
import { isLightSsrCrawlerUA, isLinkPreviewUA } from '@/shared/config/user-agent';

import { isFromToss, stripPriceFromTitle } from '@/entities/product/lib/from-toss';
import { parseProductId } from '@/entities/product/lib/product-id';

import { buildModelDisplayName } from '@/features/deals/lib/model-page-insights';
import { CollectProductOnView } from '@/features/product-actions/ui/CollectProductOnView';
import {
  buildOfferFreshness,
  buildProductSeoTitle,
  clipMetaDescription,
  dealFreshnessAt,
  formatDealAgeNotice,
  formatEvidenceSentence,
  generateDescription,
  MISSING_PRODUCT_METADATA,
  parseNumericPrice,
  type PriceHistorySeoSummary,
  seoTitleVariantOf,
  summarizePriceHistoryForSeo,
  toSeoImageUrl,
} from '@/features/product-detail/lib/product-seo';
import {
  buildProductBreadcrumbItems,
  buildProductItemPageJsonLd,
} from '@/features/product-detail/lib/product-structured-data';
import { isShareRequest } from '@/features/product-detail/lib/share-card';
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
/** 근거 블록(왜 핫딜인지)용 — 실패해도 상세는 막지 않음. generateMetadata 도 설명 둘째 문장에 쓴다. */
const getDealEvidenceCached = cache(async (id: number) => {
  try {
    return await ProductService.getDealEvidence({ id });
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
  currentPrice: number | null,
): PriceHistorySeoSummary | null {
  return summarizePriceHistoryForSeo(data?.product?.priceHistory ?? null, currentPrice);
}

const DEFAULT_OG_IMAGE = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

/** 공유 링크의 og:url — 정식 URL 에 공유 utm(과 토스 유입 표시)만 다시 붙인다. 다른 쿼리는 버린다. */
function buildShareOgUrl(
  canonical: string,
  { from, utm_medium }: { from?: string | string[]; utm_medium?: string | string[] },
): string {
  const share = new URL(canonical);
  if (isFromToss(from)) share.searchParams.set('from', Array.isArray(from) ? from[0] : from!);
  share.searchParams.set('utm_source', 'share');
  const medium = Array.isArray(utm_medium) ? utm_medium[0] : utm_medium;
  if (medium) share.searchParams.set('utm_medium', medium);
  return share.toString();
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
  evidenceSentence?: string | null,
) {
  if (!product) return null;

  const categoryName = resolveCategoryName(product);
  const priceValue = hidePrice ? null : parseNumericPrice(product.price);
  const image = toSeoImageUrl(product.thumbnail) ?? DEFAULT_OG_IMAGE;
  const description = hidePrice
    ? product.title
    : generateDescription(
        productGuides,
        product,
        categoryName,
        priceHistorySeo,
        commentSummary,
        evidenceSentence,
      );
  const productUrl = `${METADATA_SERVICE_URL}/products/${product.id}`;
  const mallName = product.mallName?.trim() || null;
  // 게시일 기준 재고·가격 유효기간. 오래된 딜을 InStock 으로 단정하지 않는다.
  const freshness = buildOfferFreshness(dealFreshnessAt(product), product.isEnd);

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
    // ItemPage.mainEntity 가 이 id 로 가리킨다(generateItemPageJsonLd).
    '@id': `${productUrl}#product`,
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

function generateBreadcrumbJsonLd(
  product: Awaited<ReturnType<typeof ProductService.getProductInfo>>,
  modelPage?: ProductModelPageLink | null,
) {
  if (!product) return null;

  const categoryName = resolveCategoryName(product);
  const items = buildProductBreadcrumbItems({
    serviceUrl: METADATA_SERVICE_URL,
    productId: product.id,
    productTitle: product.title,
    category: categoryName
      ? { name: categoryName, path: categoryRankingPath(product.categoryId) }
      : null,
    modelPage: modelPage
      ? { name: buildModelDisplayName(modelPage.brand, modelPage.modelName), slug: modelPage.slug }
      : null,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${METADATA_SERVICE_URL}/products/${product.id}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
  };
}

function generateItemPageJsonLd(
  product: Awaited<ReturnType<typeof ProductService.getProductInfo>>,
  description: string,
) {
  if (!product) return null;

  return buildProductItemPageJsonLd({
    serviceUrl: METADATA_SERVICE_URL,
    productId: product.id,
    name: product.title,
    description,
    postedAt: product.postedAt,
    image: toSeoImageUrl(product.thumbnail) ?? DEFAULT_OG_IMAGE,
    // 사용자가 직접 올린 상품의 url 은 커뮤니티 글이 아니라 쇼핑몰 링크다.
    sourceUrl: product.uploaderType === UploaderType.User ? null : product.url,
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    from?: string | string[];
    utm_source?: string | string[];
    utm_medium?: string | string[];
  }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { from, utm_source, utm_medium } = await searchParams;
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

  const [productGuides, priceHistoryData, additionalInfo, dealEvidence] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
    getProductAdditionalInfoCached(+product.id),
    hidePrice ? null : getDealEvidenceCached(+product.id),
  ]);
  const priceValue = hidePrice ? null : parseNumericPrice(product.price);
  const priceHistorySeo = hidePrice ? null : priceHistoryFromProduct(priceHistoryData, priceValue);
  const commentSummary = additionalInfo?.commentSummary?.summary ?? null;

  const displayTitle = hidePrice ? stripPriceFromTitle(product.title) : product.title;

  const categoryName = resolveCategoryName(product);
  // 토스 유입(hidePrice)은 가격 노출 금지라 priceValue 가 null → 제목에도 안 붙는다.
  const title = buildProductSeoTitle(displayTitle, product.isEnd, priceValue, {
    postedAt: dealFreshnessAt(product),
    historyMinPrice: priceHistorySeo?.minPrice ?? null,
    variant: seoTitleVariantOf(productId),
  });
  const description = hidePrice
    ? displayTitle
    : clipMetaDescription(
        generateDescription(
          productGuides,
          product,
          categoryName,
          priceHistorySeo,
          commentSummary,
          formatEvidenceSentence(dealEvidence?.headline, {
            postedAt: dealFreshnessAt(product),
            isEnd: product.isEnd,
          }),
        ),
      );

  const image = toSeoImageUrl(product.thumbnail) ?? DEFAULT_OG_IMAGE;
  const url = `${METADATA_SERVICE_URL}/products/${productId}`;
  // 공유 링크(카톡·X·스레드·복사)로 열린 미리보기엔 가격·배지를 얹은 카드를 준다(api/og/product).
  // 정식 URL(검색엔진)은 상품 사진 그대로 — 크롤러가 상세를 훑을 때마다 카드를 그리지 않게.
  const isShare = isShareRequest(utm_source);
  const shareImage = isShare
    ? {
        url: `${METADATA_SERVICE_URL}/api/og/product/${productId}.jpg${hidePrice ? '?hp=1' : ''}`,
        width: 1200,
        height: 630,
        alt: product.title,
      }
    : null;

  const defaultKeywords =
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림';
  const keywords = `${displayTitle}${categoryName ? `, ${categoryName}` : ''}, ${defaultKeywords}`;

  const retailerName = product.mallName?.trim();
  const otherMeta: Record<string, string | number> = {
    'product:id': product.id,
    // 루트의 Smart App Banner 를 이 상품으로 덮는다. 앱이 깔린 사람이 "열기"를 누르면
    // 앱 첫 화면이 아니라 이 상품이 열린다(앱 딥링크가 /products 를 받는다).
    'apple-itunes-app': `app-id=6474611420, app-argument=${url}`,
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

  const other = Object.keys(otherMeta).length ? otherMeta : undefined;

  // 게시일을 article 로 알린다. 네이버 검색결과에서 경쟁 딜 사이트는 72~95%에 날짜가 붙는데
  // 우리는 0%였다(2026-10-01 실측) — og:type=website 에 게시일 메타가 없어서다.
  const postedAt = product.postedAt ? new Date(product.postedAt) : null;
  const publishedTime =
    postedAt && !Number.isNaN(postedAt.getTime()) ? postedAt.toISOString() : undefined;

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
      // ★공유 링크는 og:url 도 공유 링크 그대로. 정식 URL 을 주면 카톡 scrap 이 그 주소를 다시 읽어
      // (=카드 없는 메타) 상품 사진으로 떨어졌다(2026-10-12 운영 실측). canonical 은 아래 alternates 가 지킨다.
      url: isShare ? buildShareOgUrl(url, { from, utm_medium }) : url,
      type: 'article',
      ...(publishedTime ? { publishedTime } : {}),
      ...(categoryName ? { section: categoryName } : {}),
      siteName: '지름알림',
      locale: 'ko_KR',
      images: [shareImage ?? { url: image, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage?.url ?? image,
    },
    alternates: {
      canonical: url,
    },
    // dev 배포는 noindex 로 내려간다 — 여기 하드코딩된 `index: true` 때문에 dev 상품 페이지가
    // Bing 인덱스와 학습 코퍼스에 들어갔다.
    // 제목이 비면(7월 이전 수집분 ~1.9천 건) `<title> | 지름알림` 로 나가 네이버가 "동일 제목 다수"로
    // 잡는다. 내세울 내용이 없는 페이지라 색인에서 뺀다(링크는 따라가게 follow 유지).
    robots: displayTitle.trim() ? robotsDirective : { ...robotsDirective, index: false },
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
  const userAgent = (await headers()).get('user-agent') ?? '';
  const lightSsr = isLightSsrCrawlerUA(userAgent);

  const renderMobile = (
    productData?: any,
    guides?: any,
    evidence?: any,
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
        initialEvidence={evidence}
        hidePrice={hidePrice}
        modelPage={modelPage}
        ageNotice={dealAgeNotice}
      />
    );
  };
  const renderDesktop = (
    productData?: any,
    guides?: any,
    evidence?: any,
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
        initialEvidence={evidence}
        hidePrice={hidePrice}
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
  const [productGuides, priceHistoryData, dealEvidence, additionalInfo] = await Promise.all([
    getProductGuidesCached(+product.id),
    getPriceHistoryCached(+product.id),
    // AI 학습·SEO 도구 봇엔 근거 블록(사람용)을 안 그린다 → 판정을 포함한 최중량 호출 하나를 건너뛴다(user-agent.ts).
    lightSsr ? null : getDealEvidenceCached(+product.id),
    getProductAdditionalInfoCached(+product.id),
  ]);
  const priceHistorySeo = priceHistoryFromProduct(
    priceHistoryData,
    parseNumericPrice(product.price),
  );
  const commentSummary = additionalInfo?.commentSummary?.summary ?? null;
  const modelPageLink = modelPageLinkFromProduct(priceHistoryData);
  // JSON-LD 가 availability 를 생략하는 것과 같은 임계(30일)로 화면에도 안내를 낸다.
  const ageNotice = hidePrice ? null : formatDealAgeNotice(dealFreshnessAt(product), product.isEnd);
  // JSON-LD description 도 meta 와 같은 근거 문장 — 같은 페이지가 두 설명을 내지 않게.
  const evidenceSentence = formatEvidenceSentence(dealEvidence?.headline, {
    postedAt: dealFreshnessAt(product),
    isEnd: product.isEnd,
  });
  const jsonLd = generateProductJsonLd(
    product,
    productGuides ?? undefined,
    hidePrice ? null : priceHistorySeo,
    hidePrice,
    commentSummary,
    evidenceSentence,
  );
  const breadcrumbLd = generateBreadcrumbJsonLd(product, modelPageLink);
  const itemPageLd = jsonLd ? generateItemPageJsonLd(product, jsonLd.description) : null;

  // LCP 이미지 preload 는 ProductDetailImage 의 next/image `priority` 가 head 에 만든다. 여기서
  // react-dom preload() 를 부르면 RSC HL 힌트로 나가 JS 로드 뒤에나 실행되고(Slow 4G 7.4s) URL 도 달라
  // 히어로를 두 번 받았다.

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {itemPageLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemPageLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <CollectProductOnView productId={productId} />
      <ProductPrefetch
        productId={productId}
        initial={{ product, productGuides, additionalInfo }}
        skipPriceChart={lightSsr || isLinkPreviewUA(userAgent)}
      >
        {!isMobile
          ? renderDesktop(
              product ?? undefined,
              productGuides?.productGuides ?? undefined,
              dealEvidence,
              modelPageLink,
              ageNotice,
            )
          : renderMobile(
              product ?? undefined,
              productGuides?.productGuides ?? undefined,
              dealEvidence,
              modelPageLink,
              ageNotice,
            )}
      </ProductPrefetch>
    </>
  );
}
