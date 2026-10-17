import { Metadata } from 'next';
import Link from 'next/link';

import { ModelPageService } from '@/shared/api/model-page';
import { CATEGORIES } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';

import { buildModelDisplayName } from '@/features/deals/lib/model-page-insights';

import DealsMobileHeader from './[slug]/DealsMobileHeader';
import DealsCategoryTabs from './DealsCategoryTabs';
import DealsFoldedMore from './DealsFoldedMore';
import { type DealItem, DealRows, verdictBadge, waitingPriceText } from './DealsListParts';
import DealsSearch, { DealsSearchItem } from './DealsSearch';
import {
  BUY_NOW_VISIBLE,
  FoldedGrid,
  RECENT_VISIBLE,
  SectionTitle,
  splitByVerdict,
  toFoldedLink,
} from './DealsSections';

// /deals 인덱스 — "이 상품, 지금 사도 되나?"에 답하는 곳. 새 딜 피드(홈·랭킹)와 역할이 다르다.
// 섹션: ① 지금 사기 좋아요(진행 딜이 추이보다 쌈) ② 최근 핫딜(진행 중, 평소·비쌈 그대로 표시)
// ③ 기다리는 상품(3일 내 진행 딜 없음 — 종료된 최근 딜은 있을 수 있다. 적정가 + 알림). 판정은 백엔드 publishedModelPages 가 상세와 같은 규칙으로 계산.
// ③을 숨기지 않는 이유: 모델 페이지 751개의 내부링크 허브이고, 옛 딜 페이지가 검색 유입 원천이다.
// ③은 사진 카드 대신 줄 목록 — 사진 카드 500장이 같은 모양으로 이어져 "그냥 나열"로 읽혔다(2026-10-13).
// 맨 위 검색창은 그 500장을 훑는 대신 사려던 상품으로 바로 가는 길.
// 앱은 /deals 를 열지 않는다(apps/mobile tab-routing) — 웹 전용.
// 2026-10-17 메뉴에서 내렸다: 키워드(/keywords)가 위층, 모델 페이지가 아래층이다. 이 목록은 모델 페이지 전체(1,273개)를 잇는
// 내부링크 허브로 남는다 — 키워드 허브에 걸리는 모델 페이지는 22%뿐이라 이걸 지우면 나머지가 고아가 된다(구글 유입 원천).

export const metadata: Metadata = {
  title: '핫딜 최저가 모음 | 지름알림',
  description:
    '인기 상품별 핫딜 최저가를 한곳에. 음료·식품·가전·생필품까지 커뮤니티 핫딜과 다나와 최저가를 모아 비교하세요.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: '핫딜 최저가 모음 | 지름알림',
    description: '인기 상품별 핫딜 최저가를 한곳에 모아 비교하세요.',
    url: '/deals',
    // openGraph 를 라우트가 지정하면 루트의 images 까지 통째로 교체된다(top-level key shallow merge).
    // 없으면 네이버·카톡 공유 썸네일이 빈다 — 2026-09-02 운영 HTML 에서 og:image 0개 실측.
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

export const revalidate = 600; // 10분 ISR — 판정의 '3일 이내'도 이 주기로 갱신된다(배치는 매시)

export default async function DealsIndexPage() {
  const pages = await ModelPageService.getPublishedModelPages();
  const { buyNow, recent, waiting } = splitByVerdict(pages);

  // 구체 수치 = AI 답변 엔진이 인용할 수 있는 유일한 형태. "여러 상품"은 인용되지 않는다.
  const leadSentence =
    pages.length > 0
      ? `상품 ${pages.length.toLocaleString('ko-KR')}개의 핫딜 가격을 추이와 비교해요. 지금 핫딜이 진행 중인 ${(buyNow.length + recent.length).toLocaleString('ko-KR')}개 중 ${buyNow.length.toLocaleString('ko-KR')}개가 평소보다 싸요.`
      : null;

  const itemListLd =
    pages.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: '핫딜 최저가 모음',
          description: leadSentence ?? undefined,
          numberOfItems: pages.length,
          itemListElement: pages.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.modelName,
            url: `${METADATA_SERVICE_URL}/deals/${p.slug}`,
          })),
        }
      : null;

  const searchItems: DealsSearchItem[] = pages.map((p) => ({
    slug: p.slug,
    name: buildModelDisplayName(p.brand, p.modelName),
    hint: searchHint(p),
  }));

  const sections = groupByCategory(waiting);
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

  // 폭: 모바일 600px 중앙 → PC layout-max(1280) 확장 (홈/랭킹과 동일 패턴).
  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <DealsMobileHeader title="핫딜 최저가 모음" />

      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">핫딜 최저가 모음</h1>
        <p className="mt-1 text-sm text-gray-600">
          {leadSentence ?? '인기 상품별로 커뮤니티 핫딜 가격을 모았어요.'}
        </p>
        <Link
          href={PAGE.KEYWORDS}
          className="mt-2 inline-block text-sm text-gray-500 underline underline-offset-2"
        >
          키워드별 핫딜로 보기
        </Link>
      </header>

      {pages.length > 0 && <DealsSearch items={searchItems} />}

      {pages.length === 0 ? (
        <p className="py-20 text-center text-gray-500">준비 중이에요.</p>
      ) : (
        <>
          {buyNow.length > 0 && (
            <section className="mb-12">
              <SectionTitle
                title="지금 사기 좋아요"
                description="진행 중인 핫딜이 그동안의 가격보다 싼 상품이에요."
              />
              <FoldedGrid items={buyNow} visible={BUY_NOW_VISIBLE} />
            </section>
          )}

          {recent.length > 0 && (
            <section className="mb-12">
              <SectionTitle
                title="최근 핫딜이 떴어요"
                description="사흘 안에 올라온 핫딜이에요. 평소 가격과 비교해 보세요."
              />
              <FoldedGrid items={recent} visible={RECENT_VISIBLE} />
            </section>
          )}

          {waiting.length > 0 && (
            <>
              <SectionTitle
                title="핫딜을 기다리는 상품"
                description="지금 진행 중인 핫딜이 없어요. 적정가 아래로 내려오면 알림으로 알려드릴게요."
                action={
                  <Link
                    href={PAGE.MYPAGE_KEYWORD}
                    rel="nofollow"
                    className="text-primary-800 shrink-0 text-sm font-semibold"
                  >
                    알림 설정
                  </Link>
                }
              />
              {/* 카테고리 탭 — 랭킹 TabbarV2 재사용(sticky top-14). 클릭=앵커 스크롤.
                  sticky는 감싸면 부모 영역 벗어날 때 풀리므로 main 직계로 두고 spacer 없이. */}
              <DealsCategoryTabs categories={tabCategories} disabledIds={disabledIds} />
              {sections.map((section) => (
                <section
                  key={section.key}
                  id={section.anchor}
                  // 앵커 스크롤 시 상단 여백 = 헤더(h-14) + sticky 탭바 높이만큼 확보해야 타이틀이 탭에 안 가림.
                  // ponytail: 헤더56+탭~56 기준값. 타이틀이 탭에 가리면 이 값만 키우면 됨.
                  className="pc:scroll-mt-28 mb-10 scroll-mt-32"
                >
                  <h3 className="mb-4 text-base font-bold text-gray-900">
                    {section.label}
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      {section.items.length}
                    </span>
                  </h3>
                  <FoldedRows items={section.items} visible={CATEGORY_VISIBLE} />
                </section>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}

/** ③ 카테고리 섹션마다 접지 않고 보여줄 줄 수(PC 3열 × 2줄). 모바일은 1열이라 12줄 × 카테고리 10개면 너무 길었다. */
const CATEGORY_VISIBLE = 6;

/** ③ 줄 목록 — FoldedGrid 와 같은 접기. 줄 하나 = 작은 사진·이름·적정가·마지막 핫딜. */
function FoldedRows({ items, visible }: { items: DealItem[]; visible: number }) {
  return (
    <>
      <DealRows items={items.slice(0, visible)} />
      {items.length > visible && (
        <DealsFoldedMore variant="rows" links={items.slice(visible).map(toFoldedLink)} />
      )}
    </>
  );
}

/** 검색 결과 한 줄 — 진행 중이면 지금 가격과 판정, 아니면 적정가. */
function searchHint(p: DealItem): string | null {
  if (p.activeDealCount > 0 && p.activePrice != null) {
    const verdict = verdictBadge(p)?.text;
    return [`진행 중 ${p.activePrice.toLocaleString()}원`, verdict].filter(Boolean).join(' · ');
  }
  return waitingPriceText(p);
}

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
