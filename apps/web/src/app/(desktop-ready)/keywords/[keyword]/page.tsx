import { emptyText, linkChip } from '@jirum/design-system/recipes';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { robotsDirective } from '@/shared/config/metadata';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

import { fetchKeywordHub, fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import {
  buildKeywordHubSeo,
  formatHubCount,
  KEYWORD_HUB_WINDOW_DAYS,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';
import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import KeywordHubAlertButton from '@/widgets/keyword-hub/ui/KeywordHubAlertButton';
import { searchHref } from '@/widgets/search/lib/search-href';

import DealsMobileHeader from '../../deals/[slug]/DealsMobileHeader';

type Params = Promise<{ keyword: string }>;

const OG_IMAGE = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function loadHub(params: Params) {
  const detail = await fetchKeywordHub(safeDecode((await params).keyword));
  if (!detail) return null;
  return { ...detail, seo: buildKeywordHubSeo(detail.hub, detail.deals) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const loaded = await loadHub(params);
  if (!loaded) {
    return { title: '페이지를 찾을 수 없어요 | 지름알림', robots: { index: false, follow: false } };
  }
  const { hub, seo } = loaded;
  const url = `${METADATA_SERVICE_URL}${keywordHubPath(hub)}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    // 얇은 허브(최근 딜이 적음)는 색인에서 빼고 링크만 따라가게 한다.
    robots: seo.indexable ? robotsDirective : { ...robotsDirective, index: false },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: 'website',
      siteName: '지름알림',
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function KeywordHubPage({ params }: { params: Params }) {
  const loaded = await loadHub(params);
  if (!loaded) notFound();
  const { hub, deals, modelPages, seo } = loaded;

  // 서버가 진행 중 먼저·최신순으로 최대 40개를 준다. 건수(제목·설명)는 30일 전체로 센 값.
  const cards: ProductCardType[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    thumbnail: d.thumbnail,
    price: d.price,
    postedAt: new Date(d.postedAt),
    categoryId: d.categoryId,
    isEnd: d.isEnd,
    isHot: d.isHot,
    hotDealType: d.hotDealType,
    mallName: d.mallName,
    provider: d.provider,
  }));

  const itemListLd =
    deals.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${hub.name} 핫딜`,
          itemListElement: deals.slice(0, 30).map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${METADATA_SERVICE_URL}/products/${d.id}`,
            name: d.title,
          })),
        }
      : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: '지름알림', item: METADATA_SERVICE_URL },
      { name: '키워드별 핫딜', item: `${METADATA_SERVICE_URL}${PAGE.KEYWORDS}` },
      { name: `${hub.name} 핫딜`, item: `${METADATA_SERVICE_URL}${keywordHubPath(hub)}` },
    ].map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
  };

  const otherHubs = (await fetchKeywordHubs()).filter((h) => h.slug !== hub.slug);

  // 얼마나 자주·어디에 — 셀 수 있는 사실만(가격은 원값 오독이 많아 쓰지 않는다).
  const { rhythm } = seo;
  const faqs = rhythm
    ? [
        {
          q: `${hub.name} 핫딜은 얼마나 자주 올라오나요?`,
          a: `${rhythm.headline}. 모두 ${formatHubCount(hub)}이에요. ${rhythm.advice}`,
        },
        ...(rhythm.sources
          ? [
              {
                q: `${hub.name} 핫딜은 어디에 주로 올라오나요?`,
                a: `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 기준 ${rhythm.sources} 순으로 많이 올라왔어요.`,
              },
            ]
          : []),
        {
          q: `${hub.name} 핫딜 알림은 어떻게 받나요?`,
          a: `이 페이지의 「${hub.name} 핫딜 알림 받기」를 누르거나 지름알림 마이페이지 → 키워드 알림에 「${hub.name}」를 등록하면 ${hub.name} 핫딜이 올라올 때 푸시로 알려드려요. 제외할 단어와 가격 범위도 정할 수 있어요.`,
        },
      ]
    : [];
  const faqLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  // /deals 와 같은 틀: UA 분기 없이 한 마크업(크롤러·모바일 모두 같은 h1·본문).
  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      {[itemListLd, breadcrumbLd, faqLd].filter(Boolean).map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <DealsMobileHeader title={`${hub.name} 핫딜`} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{hub.name} 핫딜</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{seo.lead}</p>
        <div className="flex flex-wrap items-center gap-x-3">
          <KeywordHubAlertButton keyword={hub.name} />
          <Link
            href="/guide/hotdeal-alarm"
            className="mt-3 inline-block text-sm text-gray-500 underline underline-offset-2"
          >
            알림 받는 법
          </Link>
        </div>
      </header>

      {rhythm ? (
        <section
          aria-label={`${hub.name} 핫딜이 올라오는 리듬`}
          className="mb-6 rounded-xl bg-gray-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-gray-900">{rhythm.headline}</p>
          {rhythm.sources ? (
            <p className="mt-0.5 text-xs text-gray-500">주로 올라오는 곳 · {rhythm.sources}</p>
          ) : null}
          <p className="mt-1.5 text-sm text-gray-600">{rhythm.advice}</p>
        </section>
      ) : null}

      {modelPages.length > 0 && (
        // 같은 키워드 안에서도 상품이 갈린다(삼다수 2L·500ml). 상품별 가격 비교는 모델 페이지가 한다 —
        // 허브에서 가격을 섞어 비교하지 않는 대신 그쪽으로 보낸다. 구글은 모델 페이지로 사람을 데려오는 쪽이라
        // 모델 페이지 → 허브 링크와 짝이다.
        <nav aria-label={`${hub.name} 상품별 최저가`} className="mb-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">상품별 최저가 모음</h2>
          <ul className="flex flex-wrap gap-2">
            {modelPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/deals/${page.slug}`}
                  data-track="model-page-cta"
                  data-source="keyword_hub"
                  className={cn('inline-block', linkChip)}
                >
                  {[page.brand?.trim(), page.modelName].filter(Boolean).join(' ')}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {cards.length > 0 ? (
        <ProductGridList products={cards} priorityCount={4} />
      ) : (
        <p className={cn('py-20 text-center', emptyText)}>최근 올라온 {hub.name} 핫딜이 없어요.</p>
      )}

      {/* 허브는 최근 30일 요약이다. 그 전 딜·필터(품절 포함·커뮤니티)는 검색 결과에 있다. */}
      <p className="mt-6 text-center">
        <Link
          href={searchHref(hub.name)}
          rel="nofollow"
          className="text-sm text-gray-500 underline underline-offset-2"
        >
          ‘{hub.name}’ 전체 검색 결과 보기
        </Link>
      </p>

      {faqs.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            {hub.name} 핫딜, 자주 묻는 질문
          </h2>
          <dl className="divide-y divide-gray-100 border-y border-gray-100 text-sm">
            {faqs.map((f) => (
              <div key={f.q} className="py-3">
                <dt className="font-medium text-gray-900">{f.q}</dt>
                <dd className="mt-1 leading-relaxed text-gray-600">{f.a}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={PAGE.HELP}
            className="mt-3 inline-block text-sm text-gray-500 underline underline-offset-2"
          >
            지름알림 사용법 · 자주 묻는 질문
          </Link>
        </section>
      ) : null}

      <nav aria-label="다른 키워드 핫딜" className="mt-14">
        <h2 className="mb-3 text-base font-semibold text-gray-900">다른 키워드 핫딜</h2>
        <ul className="flex flex-wrap gap-2">
          {otherHubs.map((h) => (
            <li key={h.slug}>
              <Link href={keywordHubPath(h)} className={cn('inline-block', linkChip)}>
                {h.name} 핫딜
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
