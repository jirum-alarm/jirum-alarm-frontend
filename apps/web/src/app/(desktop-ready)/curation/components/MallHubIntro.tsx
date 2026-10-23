import { linkChip, text } from '@jirum/design-system/recipes';
import { COMMUNITY_COUNT } from '@jirum/domain/service-facts';
import Link from 'next/link';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { PromotionService } from '@/shared/api/promotion';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import { jsonLdHtml } from '@/shared/lib/json-ld';

/**
 * 쇼핑몰별 큐레이션(/curation/mall-group-{id})의 검색용 몸통 — 설명 한 문단·다른 쇼핑몰 링크·ItemList.
 * 이 페이지들은 2026-08 부터 색인돼 있었지만 몸통 글자가 없고 서로·홈 밖에선 링크가 없어 «쿠팡 핫딜»(네이버 월 1.4천) 같은
 * 몰 질의에 노출 0 이었다(2026-10-23 GSC·URL 검사: 마지막 크롤 8/29). 목록은 클라이언트가 다시 가져오지만(무한 스크롤),
 * 여기서 공개 캐시(10분)로 첫 20건을 한 번 더 읽어 크롤러가 ItemList 를 보게 한다 — /toss 와 같은 방식.
 */
export const MALL_GROUP_CURATION_ID = /^mall-group-(\d+)$/;

export function mallGroupIdOf(curationId: string): number | null {
  const m = MALL_GROUP_CURATION_ID.exec(curationId);
  return m ? Number(m[1]) : null;
}

/** 큐레이션 제목(«쿠팡») → 검색 결과에 읽히는 이름(«쿠팡 핫딜») — page.tsx 메타 제목과 같은 규칙. */
export const mallDealName = (title: string) => (/핫딜/.test(title) ? title : `${title} 핫딜`);

export const mallHubDescription = (title: string) =>
  `뽐뿌·에펨코리아 등 커뮤니티 ${COMMUNITY_COUNT}에 올라온 ${mallDealName(title)}을 실시간으로 모았어요. 가격·커뮤니티 반응·종료 여부를 한눈에 보고, 원하는 상품은 키워드 알림으로 받아보세요.`;

// 토스는 전용 페이지(/toss, 하루특가)가 정본이라 그쪽으로 보낸다.
const mallHref = (mall: { id: number; title: string }) =>
  mall.title === '토스' ? '/toss' : `/curation/mall-group-${Math.trunc(mall.id)}`;

export default async function MallHubIntro({
  curationId,
  mallGroupId,
  title,
}: {
  curationId: string;
  mallGroupId: number;
  title: string;
}) {
  const [productsResult, mallGroupsResult] = await Promise.allSettled([
    ProductService.getProducts(
      {
        limit: 20,
        mallGroupId,
        orderBy: ProductOrderType.PostedAt,
        orderOption: OrderOptionType.Desc,
      },
      { public: true, revalidate: 600 },
    ),
    PromotionService.getMallGroups(),
  ]);
  const products = productsResult.status === 'fulfilled' ? productsResult.value.products : [];
  const others = (mallGroupsResult.status === 'fulfilled' ? mallGroupsResult.value.mallGroups : [])
    .filter((m) => m.isActive && Math.trunc(m.id) !== mallGroupId)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const name = mallDealName(title);

  const itemListLd =
    products.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${name} 모음`,
          url: `${METADATA_SERVICE_URL}/curation/${curationId}`,
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `${METADATA_SERVICE_URL}/products/${p.id}`,
          })),
        }
      : null;

  return (
    <section className="pc:pt-0 px-5 pt-4">
      {itemListLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(itemListLd)} />
      ) : null}
      <p className={cn(text.body, 'leading-relaxed')}>{mallHubDescription(title)}</p>
      {others.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="다른 쇼핑몰 핫딜">
          {others.map((m) => (
            <li key={m.id}>
              <Link href={mallHref(m)} className={cn('inline-block', linkChip)}>
                {mallDealName(m.title)}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/guide/hotdeal-sites" className={cn('inline-block', linkChip)}>
              핫딜 사이트 고르는 법
            </Link>
          </li>
        </ul>
      ) : null}
    </section>
  );
}
