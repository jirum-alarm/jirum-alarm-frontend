/**
 * 상품 상세 JSON-LD 의 페이지 골격 — 빵부스러기·ItemPage. Product 본체는 page.tsx 가 만든다.
 * 경로 별칭 import 없이 순수 함수로 둔다(`[id]` 라우트 안 테스트는 node --test 가 건너뛴다).
 */

export type ProductBreadcrumbItem = { name: string; item: string };

/**
 * 지름알림 > (카테고리 핫딜) > (모델 핫딜 모음) > 상품.
 *
 * 전엔 모델 페이지가 있을 때만 3단이었고, 매핑된 상품은 소수라(2026-10-01 무작위 59개 중 0개) 거의 전부
 * 「지름알림 > 상품명」 2단이었다. 네이버는 검색결과에 이 경로를 그대로 찍는다 — 2단이면 주제가 안 보인다.
 * 카테고리는 거의 모든 상품에 있으니 카테고리 허브(랭킹 탭)를 가운데 둔다.
 */
export function buildProductBreadcrumbItems({
  serviceUrl,
  productId,
  productTitle,
  category,
  modelPage,
}: {
  serviceUrl: string;
  productId: number | string;
  productTitle: string;
  /** path = `categoryRankingPath(categoryId)`. 없으면 단계를 뺀다. */
  category?: { name: string; path: string | null } | null;
  modelPage?: { name: string; slug: string } | null;
}): ProductBreadcrumbItem[] {
  const items: ProductBreadcrumbItem[] = [{ name: '지름알림', item: serviceUrl }];

  const categoryName = category?.name?.trim();
  if (categoryName && category?.path) {
    items.push({ name: `${categoryName} 핫딜`, item: `${serviceUrl}${category.path}` });
  }
  if (modelPage?.slug) {
    items.push({
      name: `${modelPage.name} 핫딜 모음`,
      item: `${serviceUrl}/deals/${modelPage.slug}`,
    });
  }
  items.push({ name: productTitle, item: `${serviceUrl}/products/${productId}` });

  return items;
}

/** 원문(커뮤니티 글) 주소로 쓸 수 있는지 — http(s) 절대 URL 만. */
function toSourceUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/**
 * 상세 페이지 자체(ItemPage) — 게시일과 원문 출처를 싣는 자리.
 *
 * Product 에는 날짜 속성이 없어 게시일이 og/article 메타에만 있었다. AI 검색(ChatGPT·Perplexity 등은 상세를
 * 하루 수천 번 읽는다)이 「언제 올라온 가격인지」와 「어디서 온 정보인지」를 구조화 데이터로 읽게 한다.
 * `isBasedOn` = 이 딜을 처음 올린 커뮤니티 글. 우리는 모아 보여주는 쪽이라 출처를 밝히는 게 맞고,
 * 화면의 「{커뮤니티} 반응 보기」 링크와 같은 주소다.
 */
export function buildProductItemPageJsonLd({
  serviceUrl,
  productId,
  name,
  description,
  postedAt,
  image,
  sourceUrl,
}: {
  serviceUrl: string;
  productId: number | string;
  name: string;
  description?: string | null;
  postedAt?: string | Date | null;
  image?: string | null;
  /** 커뮤니티 원문 URL. 사용자가 직접 올린 상품은 원문이 없으니 넘기지 않는다. */
  sourceUrl?: string | null;
}) {
  const url = `${serviceUrl}/products/${productId}`;
  const posted = postedAt ? new Date(postedAt) : null;
  const datePublished = posted && !Number.isNaN(posted.getTime()) ? posted.toISOString() : null;
  const source = toSourceUrl(sourceUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    '@id': `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: 'ko-KR',
    isPartOf: { '@type': 'WebSite', name: '지름알림', url: serviceUrl },
    ...(datePublished ? { datePublished } : {}),
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
    breadcrumb: { '@id': `${url}#breadcrumb` },
    mainEntity: { '@id': `${url}#product` },
    ...(source ? { isBasedOn: source } : {}),
  };
}
