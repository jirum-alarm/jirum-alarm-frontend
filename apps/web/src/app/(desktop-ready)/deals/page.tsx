import { Metadata } from 'next';
import Link from 'next/link';

import { ModelPageService } from '@/shared/api/model-page';
import { CATEGORIES } from '@/shared/config/categories';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';

import { buildModelDisplayName } from '@/features/deals/lib/model-page-insights';

import DealsMobileHeader from './[slug]/DealsMobileHeader';
import DealsCategoryTabs from './DealsCategoryTabs';

import type { ReactNode } from 'react';

// /deals 인덱스 — "이 상품, 지금 사도 되나?"에 답하는 곳. 새 딜 피드(홈·랭킹)와 역할이 다르다.
// 섹션: ① 지금 사기 좋아요(진행 딜이 추이보다 쌈) ② 최근 핫딜(진행 중, 평소·비쌈 그대로 표시)
// ③ 기다리는 상품(30일 내 진행 딜 없음 — 종료된 최근 딜은 있을 수 있다. 적정가 + 알림). 판정은 백엔드 publishedModelPages 가 상세와 같은 규칙으로 계산.
// ③을 숨기지 않는 이유: 모델 페이지 751개의 내부링크 허브이고, 옛 딜 페이지가 검색 유입 원천이다.
// 앱은 /deals 를 열지 않는다(apps/mobile tab-routing) — 웹 전용.

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

export const revalidate = 600; // 10분 ISR — 판정의 '30일 이내'도 이 주기로 갱신된다

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

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-black">핫딜 최저가 모음</h1>
        <p className="mt-1 text-sm text-gray-600">
          {leadSentence ?? '인기 상품별로 커뮤니티 핫딜 가격을 모았어요.'}
        </p>
      </header>

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
              <DealGrid items={buyNow} />
            </section>
          )}

          {recent.length > 0 && (
            <section className="mb-12">
              <SectionTitle
                title="최근 핫딜이 떴어요"
                description="한 달 안에 올라온 핫딜이에요. 평소 가격과 비교해 보세요."
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
                    className="text-primary-600 shrink-0 text-sm font-semibold"
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
                  <h3 className="mb-4 text-base font-bold text-black">
                    {section.label}
                    <span className="ml-1 text-sm font-medium text-gray-400">
                      {section.items.length}
                    </span>
                  </h3>
                  <FoldedGrid items={section.items} visible={CATEGORY_VISIBLE} />
                </section>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}

type DealItem = Awaited<ReturnType<typeof ModelPageService.getPublishedModelPages>>[number];

/** ② 최근 핫딜에서 접지 않고 보여줄 개수. 모바일 2열 기준 6줄. */
const RECENT_VISIBLE = 12;
/** ③ 카테고리 섹션마다 접지 않고 보여줄 개수. 안 접으면 식품 한 섹션만 수백 장이라 아래 카테고리에 닿지 못했다. */
const CATEGORY_VISIBLE = 10;

const GOOD_TONES = new Set(['lowest', 'cheap']);

/**
 * 판정으로 세 덩어리. ①② 는 최근 올라온 딜 순(새 딜이 위), ③ 은 카테고리 섹션이 정렬한다.
 * ①② 를 할인율 순으로 두지 않는 이유: 추이 점이 5~9개인 상품이 대부분이라 % 의 정밀도가 낮다.
 */
function splitByVerdict(pages: DealItem[]) {
  const byRecent = (a: DealItem, b: DealItem) =>
    Date.parse(b.activePostedAt ?? '') - Date.parse(a.activePostedAt ?? '');
  const active = pages.filter((p) => p.activeDealCount > 0 && p.activePrice != null);
  const activeSlugs = new Set(active.map((p) => p.slug));
  return {
    buyNow: active.filter((p) => GOOD_TONES.has(p.priceTone ?? '')).sort(byRecent),
    recent: active.filter((p) => !GOOD_TONES.has(p.priceTone ?? '')).sort(byRecent),
    waiting: pages.filter((p) => !activeSlugs.has(p.slug)),
  };
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-black">{title}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DealGrid({ items, className }: { items: DealItem[]; className?: string }) {
  // 열수: 모바일 2 → sm 3 → PC 5 (랭킹 TrackedProductGridList와 동일).
  return (
    <ul
      className={`pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 gap-3 sm:grid-cols-3 ${className ?? ''}`}
    >
      {items.map((p) => (
        <li key={p.slug}>
          <DealCard item={p} />
        </li>
      ))}
    </ul>
  );
}

/** 앞 `visible` 개만 펼치고 나머지는 "더 보기"로 접는다. 링크는 HTML 에 그대로 남아 크롤러가 따라간다(details 는 렌더 후 접기만). */
function FoldedGrid({ items, visible }: { items: DealItem[]; visible: number }) {
  return (
    <>
      <DealGrid items={items.slice(0, visible)} />
      {items.length > visible && (
        <details className="group mt-4">
          <summary className="cursor-pointer list-none rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 group-open:hidden">
            {items.length - visible}개 더 보기
          </summary>
          <DealGrid items={items.slice(visible)} className="mt-3" />
        </details>
      )}
    </>
  );
}

function DealCard({ item: p }: { item: DealItem }) {
  const isActive = p.activeDealCount > 0 && p.activePrice != null;
  const verdict = verdictBadge(p);
  return (
    <Link
      href={`/deals/${p.slug}`}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-gray-50">
        {/* CDN 은 webp 만 있고 원본 확장자(.jpg 등)는 403 — 원본을 그대로 쓰면 카드 90% 가 깨졌다
            (2026-10-05 운영 실측 60장 중 53장). 상세 히어로와 같이 webp 우선 + 원본 폴백. */}
        <ImageComponent
          src={convertToWebp(p.heroImage) ?? p.heroImage ?? ''}
          fallbackSrc={p.heroImage ?? undefined}
          fallback={<NoImage />}
          alt={p.modelName}
          // 고정 크기 = srcset 1x·2x 두 개뿐. fill+sizes 는 너비 14개를 카드마다 찍어
          // 757장에 img 태그만 1.2MB(HTML 3MB)였다(2026-10-05). 카드 실폭은 최대 ~240px.
          width={256}
          height={256}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex grow flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-black">
          {buildModelDisplayName(p.brand, p.modelName)}
        </h3>
        {isActive ? (
          <div className="mt-auto">
            {verdict && (
              <span
                className={`text-11 mb-1 inline-block rounded-full px-1.5 py-0.5 font-semibold ${verdict.className}`}
              >
                {verdict.text}
              </span>
            )}
            <p className="text-lg font-semibold text-gray-900">
              {p.activePrice!.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-500">
              {[
                relativeDayLabel(p.activePostedAt),
                p.activeDealCount > 1 ? `진행 ${p.activeDealCount}건` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        ) : (
          <div className="mt-auto">
            {p.buyLine != null && p.buyLine > 0 ? (
              <>
                <p className="text-xs text-gray-500">적정가</p>
                <p className="text-base font-semibold text-gray-900">
                  {p.buyLineUnitLabel ? `${p.buyLineUnitLabel} ` : ''}
                  {p.buyLine.toLocaleString()}원 이하
                </p>
              </>
            ) : p.heroMinPrice != null ? (
              <>
                <p className="text-xs text-gray-500">지난 핫딜 최저</p>
                <p className="text-base font-semibold text-gray-900">
                  {p.heroMinPrice.toLocaleString()}원
                </p>
              </>
            ) : null}
            {p.lastDealAt && (
              <p className="text-xs text-gray-500">마지막 핫딜 {relativeDayLabel(p.lastDealAt)}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function NoImage() {
  return <div className="flex h-full items-center justify-center text-gray-300">이미지 없음</div>;
}

/**
 * 판정 배지. 색은 상세 페이지의 타이밍 배지와 같다(좋음=emerald·비쌈=amber·평소=gray).
 * 단위 축이면 "%"가 용량당 비교라 단위를 붙인다 — 총액은 팩 크기가 달라 더 비싸 보일 수 있다.
 */
function verdictBadge(p: DealItem): { text: string; className: string } | null {
  const unit = p.buyLineUnitLabel ? `${p.buyLineUnitLabel} ` : '';
  switch (p.priceTone) {
    case 'lowest':
      return {
        text: `역대 최저 · ${unit}${p.savePct}%↓`,
        className: 'bg-success-50 text-success-700',
      };
    case 'cheap':
      return {
        text: `평소보다 ${unit}${p.savePct}%↓`,
        className: 'bg-success-50 text-success-700',
      };
    case 'fair':
      return { text: '평소 수준', className: 'bg-gray-100 text-gray-600' };
    case 'high':
      return { text: '평소보다 비싸요', className: 'bg-warning-50 text-warning-800' };
    default:
      return null;
  }
}

/**
 * "오늘"/"어제"/"N일 전"/"N달 전"/"N년 전". 서버 렌더라 KST 자정 경계는 근사(경과 시간 기준) — 목록 표기엔 충분.
 */
function relativeDayLabel(at?: string | null): string | null {
  if (!at) return null;
  const then = Date.parse(at);
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 30) return `${days}일 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
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
