import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ModelPageService } from '@/shared/api/model-page';
import { CATEGORIES } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

import DealsMobileHeader from './[slug]/DealsMobileHeader';
import DealsCategoryTabs from './DealsCategoryTabs';

// /deals 인덱스 — 퍼블리시된 모델 페이지(상품별 핫딜 최저가 모음)를 한눈에 모아보는 허브.
// 각 카드 → /deals/{slug}. 모델 페이지들의 SEO 내부링크 허브이자 둘러보기 진입점.
// ★현재 사이트 내부 메뉴엔 안 걸림(격리) — sitemap 등재 + URL 직접 접속.

export const metadata: Metadata = {
  title: '핫딜 최저가 모음 | 지름알림',
  description:
    '인기 상품별 핫딜 최저가를 한곳에. 음료·식품·가전·생필품까지 커뮤니티 핫딜과 다나와 최저가를 모아 비교하세요.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: '핫딜 최저가 모음 | 지름알림',
    description: '인기 상품별 핫딜 최저가를 한곳에 모아 비교하세요.',
    url: '/deals',
  },
};

export const revalidate = 600; // 10분 ISR — 목록은 자주 안 바뀜

export default async function DealsIndexPage() {
  const pages = await ModelPageService.getPublishedModelPages();

  const itemListLd =
    pages.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: '핫딜 최저가 모음',
          itemListElement: pages.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.modelName,
            url: `${METADATA_SERVICE_URL}/deals/${p.slug}`,
          })),
        }
      : null;

  // 폭: 모바일 600px 중앙 → PC layout-max(1280) 확장 (홈/랭킹과 동일 패턴).
  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-20 pb-24">
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <DealsMobileHeader title="핫딜 최저가 모음" />

      <header className="mb-5">
        <h1 className="text-2xl font-bold text-black">핫딜 최저가 모음</h1>
        <p className="mt-1 text-sm text-gray-500">
          인기 상품별로 커뮤니티 핫딜과 다나와 최저가를 모았어요.
        </p>
      </header>

      {pages.length === 0 ? (
        <p className="py-20 text-center text-gray-400">준비 중이에요.</p>
      ) : (
        (() => {
          const sections = groupByCategory(pages);
          // 활성 categoryId — 딜 총합순(섹션 순서 그대로). 탭 순서=섹션(스크롤) 순서 일치.
          const activeIdOrder = sections
            .map((s) => (s.anchor.startsWith('cat-') ? Number(s.anchor.slice(4)) : NaN))
            .filter((id) => !Number.isNaN(id));
          const activeIds = new Set(activeIdOrder);
          // 라벨은 CATEGORIES.text 기준(섹션 label=DB categoryName과 표기 다름). id로 매핑.
          const labelById = new Map<number, string>(CATEGORIES.map((c) => [c.value, c.text]));
          // 탭 순서: 활성(딜순) 먼저 → 비활성(CATEGORIES 고정순) 뒤에. 비활성은 disabled.
          const disabledIds = CATEGORIES.map((c) => c.value).filter((v) => !activeIds.has(v));
          const tabCategories = [...activeIdOrder, ...disabledIds].map((id) => ({
            id,
            name: labelById.get(id) ?? '기타',
          }));
          return (
            <>
              {/* 카테고리 탭 — 랭킹 TabbarV2 재사용(sticky top-14). published 없는 건 disabled. 클릭=앵커 스크롤.
                  sticky는 감싸면 부모 영역 벗어날 때 풀리므로 main 직계로 두고 spacer 없이. */}
              <DealsCategoryTabs categories={tabCategories} disabledIds={disabledIds} />
              {sections.map((section) => (
                <section
                  key={section.key}
                  id={section.anchor}
                  className="pc:scroll-mt-16 mb-10 scroll-mt-28"
                >
                  <h2 className="mb-4 text-lg font-bold text-black">{section.label}</h2>
                  {/* 열수: 모바일 2 → sm 3 → PC 5 (랭킹 TrackedProductGridList와 동일). */}
                  <ul className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {section.items.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/deals/${p.slug}`}
                          className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
                        >
                          <div className="relative aspect-square w-full bg-gray-50">
                            {p.heroImage ? (
                              <Image
                                src={p.heroImage}
                                alt={p.modelName}
                                fill
                                sizes="(max-width: 600px) 50vw, 300px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                이미지 없음
                              </div>
                            )}
                          </div>
                          <div className="flex grow flex-col gap-1 p-3">
                            <h3 className="line-clamp-2 text-sm font-semibold text-black">
                              {p.modelName}
                            </h3>
                            {p.heroMinPrice != null ? (
                              <div className="mt-auto">
                                <p className="text-base font-bold text-rose-500">
                                  {p.heroMinPrice.toLocaleString()}원
                                </p>
                                {p.unitLabel && p.unitPrice != null && (
                                  <p className="text-xs text-gray-400">
                                    {p.unitLabel} {p.unitPrice.toLocaleString()}원
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="mt-auto text-xs text-gray-400">핫딜 {p.dealCount}건</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          );
        })()
      )}
    </main>
  );
}

type DealItem = Awaited<ReturnType<typeof ModelPageService.getPublishedModelPages>>[number];

/**
 * 섹션 내부를 브랜드끼리 인접하게 정렬. 같은 브랜드(펩시 라임 5종 등)가 딜수 순으로 흩어지지 않고
 * 한 덩어리로 붙는다. 블록 순서 = 그 브랜드 최다 딜수 순(인기 브랜드 위로), 블록 내부 = 딜수 순.
 * brand 없는 항목은 각자 단독 블록으로 뒤쪽에.
 */
function sortByBrandAdjacency(items: DealItem[]): DealItem[] {
  const blocks = new Map<string, DealItem[]>();
  for (const it of items) {
    // brand 없으면 slug로 유니크 키 — 단독 블록.
    const key = it.brand ?? `__nobrand:${it.slug}`;
    (blocks.get(key) ?? blocks.set(key, []).get(key)!).push(it);
  }
  return [...blocks.values()]
    .map((block) => block.sort((a, b) => b.dealCount - a.dealCount)) // 블록 내부: 딜수 순
    .sort((a, b) => b[0].dealCount - a[0].dealCount) // 블록 순서: 대표(최다) 딜수 순
    .flat();
}

/**
 * 카테고리별 섹션으로 그룹핑. 섹션 순서 = 딜 총합 많은 순(가장 활발한 카테고리 위로).
 * categoryName 없는 항목은 '기타' 섹션으로 모아 맨 아래. 섹션 내부는 브랜드 인접 정렬.
 */
function groupByCategory(pages: DealItem[]) {
  const ETC = '기타';
  const groups = new Map<string, { items: DealItem[]; categoryId: number | null }>();
  for (const p of pages) {
    const key = p.categoryName ?? ETC;
    const bucket = groups.get(key);
    if (bucket) bucket.items.push(p);
    else groups.set(key, { items: [p], categoryId: p.categoryId ?? null });
  }
  return [...groups.entries()]
    .map(([label, { items, categoryId }]) => ({
      key: label,
      label,
      items: sortByBrandAdjacency(items),
      // 앵커 id — 한글 라벨 대신 categoryId 기반(URL·href 안전). '기타'는 id 없어 'etc'.
      anchor: categoryId != null ? `cat-${categoryId}` : 'cat-etc',
      total: items.reduce((s, it) => s + it.dealCount, 0),
    }))
    .sort((a, b) => {
      // '기타'는 항상 맨 아래, 나머지는 딜 총합 많은 순.
      if (a.label === ETC) return 1;
      if (b.label === ETC) return -1;
      return b.total - a.total;
    });
}
