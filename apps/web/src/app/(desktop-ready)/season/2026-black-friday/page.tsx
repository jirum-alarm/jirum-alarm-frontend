import { button, emptyText, infoBox, linkChip } from '@jirum/design-system/recipes';
import * as Sentry from '@sentry/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';

import {
  SEASON_FALLBACK_KEYWORD,
  SEASON_SALE_KEYWORD,
  type SeasonDeal,
  SeasonService,
} from '@/shared/api/season';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { robotsDirective } from '@/shared/config/metadata';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { jsonLdHtml } from '@/shared/lib/json-ld';
import { OKACHAT_LINK } from '@/shared/lib/okachat';

import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import { searchHref } from '@/widgets/search/lib/search-href';

import DealsMobileHeader from '../../deals/[slug]/DealsMobileHeader';

import {
  DOMESTIC_EVENTS,
  OVERSEAS_EVENTS,
  type SeasonEvent,
  seasonStatus,
  US_EVENTS,
} from './season-calendar';
import SeasonContentGroup from './SeasonContentGroup';

/**
 * 해외직구 시즌 허브 — 알리 광군제·블프·12.12 일정, 쿠폰 확인처, 직구 주의점, 지금 올라온 직구 딜(2026-10-19).
 *
 * 왜: 알리 딜은 클릭당 가치가 높은데 구매 클릭에서 차지하는 몫이 작다. 11~12월엔 알리 딜이 평소보다 크게 몰리고,
 * 사람들은 그 전에 «알리 블프 언제», «광군제 쿠폰»을 찾는다(네이버 월 검색 알리할인코드 2.6만·알리쿠폰 1.4만·블랙프라이데이 4.6만).
 * 네이버·구글 색인에 몇 주가 걸려 시즌 한 달 전(10월)에 연다. 실험 obs_overseas_season_v1(crawling-server 등록부).
 *
 * 구매로 이어지는 자리는 두 곳 — ① 「알리 행사장 가기」: 제휴 추적이 세션 단위라 행사장으로 바로 가서 사는 것도 잡힌다(링크는 서버가
 * 콜백 표식 dp=season_hub: 를 실어 준다 → 허브 몫을 따로 셀 수 있다). ② 지금 올라온 직구 딜 카드(상품 링크도 제휴).
 * 국내 행사(빅스마일데이·십일절)는 이미 쇼핑몰별 핫딜에 제휴 링크가 붙어 있어 새 노출 없이 검색 링크만 둔다.
 *
 * 쓰는 법:
 * - 날짜는 2025 실제 일정이라고 밝힌다(2026 공식 발표 전). 발표되면 season-calendar.ts 와 서버 달력 env 를 같이 고친다.
 * - 쿠폰 코드는 적지 않는다 — 기간·조건이 자주 바뀌고 틀린 코드는 신뢰를 깎는다. 공식 행사 페이지로 보낸다.
 * - 제휴 고지는 페이지 안에 그대로 둔다(공정위 추천·보증 심사지침).
 * - 앱은 홈 「직구 특가」 섹션이 같은 딜을 보여 줘서 이 허브를 따로 만들지 않았다(검색 유입용 웹 문서).
 */
const PATH = '/season/2026-black-friday';
const title = '2026 알리 블프·광군제 일정과 쿠폰 확인법';
const description =
  '알리익스프레스 광군제(11.11)·블랙프라이데이·12.12 일정을 작년 기준으로 정리하고, 공식 쿠폰 확인처·면세 한도·KC 인증 주의점과 지금 올라온 해외직구 핫딜을 모았어요.';
const ALI_HOME = 'https://ko.aliexpress.com/';
const DEAL_LIMIT = 12;

// 빌드 때 정적 생성하면 빌드 API(dev crawling-server)에 새 공개 쿼리(seasonAliexpressLink)가 없어 400 으로 빌드가 멈춘다
// (2026-10-14 키워드 허브 실측). 요청마다 렌더하되 데이터는 fetch 캐시(10분, season.service)를 탄다.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${METADATA_SERVICE_URL}${PATH}` },
  robots: robotsDirective,
  openGraph: {
    title,
    description,
    url: `${METADATA_SERVICE_URL}${PATH}`,
    type: 'article',
    siteName: '지름알림',
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

/** 시즌 섹션이 열려 있으면 그 딜(서버가 기간 밖엔 빈 배열), 아니면 최근 알리 딜. 실패해도 허브의 글은 나와야 한다. */
async function loadDeals(): Promise<{ deals: SeasonDeal[]; saleOpen: boolean }> {
  try {
    const sale = await SeasonService.getDeals(SEASON_SALE_KEYWORD, DEAL_LIMIT);
    if (sale.length > 0) return { deals: sale, saleOpen: true };
    return {
      deals: await SeasonService.getDeals(SEASON_FALLBACK_KEYWORD, DEAL_LIMIT),
      saleOpen: false,
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { page: 'season_hub', query: 'productsByKeyword' } });
    return { deals: [], saleOpen: false };
  }
}

async function loadAliLink(): Promise<string> {
  try {
    return (await SeasonService.getAliexpressLink()) ?? ALI_HOME;
  } catch (error) {
    Sentry.captureException(error, { tags: { page: 'season_hub', query: 'seasonAliexpressLink' } });
    return ALI_HOME;
  }
}

/** 요청마다 렌더(force-dynamic)라 «지금» 은 요청 시각이다. */
async function renderedStatus() {
  return seasonStatus(Date.now());
}

const FAQS = [
  {
    q: '2026 알리 블랙프라이데이는 언제인가요?',
    a: '알리익스프레스의 2026 공식 일정은 아직 발표 전이에요(10월 기준). 작년(2025)엔 11월 20일부터 12월 3일까지였고, 미국 블랙프라이데이는 2026년 11월 27일(금)이에요. 공식 일정이 나오면 이 페이지를 고쳐요.',
  },
  {
    q: '광군제(11.11)는 언제 시작하나요?',
    a: '광군제는 매년 11월 11일에 시작해요. 2025년 알리익스프레스 광군제는 11월 11일부터 19일까지였어요.',
  },
  {
    q: '알리 쿠폰·할인 코드는 어디서 확인하나요?',
    a: '알리익스프레스 앱·홈페이지의 행사 페이지가 정본이에요. 블로그에 도는 코드는 기간·최소 금액 조건이 달라서 결제 직전에 다시 확인하는 게 안전해요.',
  },
  {
    q: '해외직구 면세 한도는 얼마인가요?',
    a: '목록통관 물품은 물건값 미화 150달러(미국에서 보내는 물건은 200달러) 이하면 관세·부가세가 붙지 않아요(2025년 기준). 같은 날 같은 나라에서 들어온 물건은 합쳐서 따지니 나눠 주문할 때 조심하세요.',
  },
];

function EventRows({ events }: { events: SeasonEvent[] }) {
  return (
    <dl className="divide-y divide-gray-100">
      {events.map((e) => (
        <div key={e.name} className="pc:flex pc:gap-6 py-3">
          <dt className="pc:w-56 shrink-0 text-sm font-semibold text-gray-900">{e.name}</dt>
          <dd className="mt-0.5 text-sm text-gray-700">
            {e.when}
            {e.note ? <span className="mt-0.5 block text-xs text-gray-500">{e.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SeasonBlackFriday2026Page() {
  const [{ deals, saleOpen }, aliLink, status] = await Promise.all([
    loadDeals(),
    loadAliLink(),
    renderedStatus(),
  ]);

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
    isYearLowest: d.isYearLowest,
    priceSaving: d.priceSaving,
    provider: d.provider,
  }));

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: '지름알림', item: METADATA_SERVICE_URL },
      { name: '2026 블프·광군제 직구 달력', item: `${METADATA_SERVICE_URL}${PATH}` },
    ].map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
  };

  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      {[faqLd, breadcrumbLd].map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(ld)} />
      ))}
      <SeasonContentGroup />
      <DealsMobileHeader title="블프·광군제 직구 달력" />

      <header className="mb-8">
        <p className="text-secondary-600 text-xs font-semibold">2026 해외직구 시즌</p>
        <h1 className="mt-1 text-2xl font-bold break-keep text-gray-900">
          알리 블프·광군제 일정과 쿠폰 확인법
        </h1>
        <p className="mt-2 text-sm leading-relaxed break-keep text-gray-600">
          알리익스프레스는 11월 광군제부터 블랙프라이데이·12.12까지 한 달 넘게 행사를 이어 가요.
          작년 일정과 지름알림에 쌓인 주문 흐름으로 언제 무엇을 사면 좋은지, 쿠폰은 어디서
          확인하는지, 직구 전에 볼 것을 모았어요.
        </p>
        <p
          className={cn(
            'mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold',
            status.live ? 'bg-error-50 text-error-600' : 'bg-gray-100 text-gray-700',
          )}
        >
          {status.label}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={aliLink}
            target="_blank"
            rel="sponsored nofollow noopener"
            data-track="season-ali-event"
            data-source="season_hub"
            className={cn(
              'inline-flex items-center',
              button.size.md.box,
              button.tone.primary.box,
              button.tone.primary.text,
              'text-sm',
            )}
          >
            알리익스프레스 행사장 가기
          </a>
          <Link href="#calendar" className="text-sm text-gray-500 underline underline-offset-2">
            일정 먼저 보기
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          이 페이지의 알리익스프레스 등 쇼핑몰 링크는 제휴 링크예요. 링크로 사면 지름알림이 수수료를
          받을 수 있고, 사는 가격은 같아요.
        </p>
      </header>

      <section aria-labelledby="season-deals" className="mb-12">
        <h2 id="season-deals" className="mb-3 text-base font-semibold text-gray-900">
          {saleOpen ? '지금 올라온 해외직구 특가' : '최근 올라온 알리 핫딜'}
        </h2>
        {cards.length > 0 ? (
          <ProductGridList products={cards} priorityCount={4} source="season_hub" />
        ) : (
          <p className={cn('py-12 text-center', emptyText)}>지금은 올라온 직구 핫딜이 없어요.</p>
        )}
        <p className="mt-6 text-center">
          <Link
            href={saleOpen ? '/curation/overseas-sale' : searchHref(SEASON_FALLBACK_KEYWORD)}
            rel={saleOpen ? undefined : 'nofollow'}
            className="text-sm text-gray-500 underline underline-offset-2"
          >
            {saleOpen ? '직구 특가 더 보기' : '알리 핫딜 더 보기'}
          </Link>
        </p>
      </section>

      <section id="calendar" aria-labelledby="season-calendar" className="mb-12 scroll-mt-20">
        <h2 id="season-calendar" className="text-base font-semibold text-gray-900">
          2026 시즌 달력
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          알리익스프레스의 2026 공식 일정은 아직 발표 전이에요(10월 기준). 아래는 2025년 실제
          일정이고, 발표되면 고쳐요.
        </p>
        <h3 className="mt-5 text-sm font-semibold text-gray-700">해외직구(알리익스프레스)</h3>
        <EventRows events={OVERSEAS_EVENTS} />
        <h3 className="mt-5 text-sm font-semibold text-gray-700">미국 쇼핑몰</h3>
        <EventRows events={US_EVENTS} />
        <div className={cn('mt-5 px-4 py-3', infoBox)}>
          <p className="text-sm font-semibold text-gray-900">언제 사면 좋을까요?</p>
          <p className="mt-1 text-sm leading-relaxed break-keep text-gray-600">
            작년 지름알림에서 알리 딜은 광군제 주에 가장 많이 올라왔지만(평소의 약 3배), 주문 한
            건의 크기는 블랙프라이데이와 12.12에 가장 컸어요. 생활용품·소모품은 광군제에,
            미니PC·이어폰 같은 비싼 전자제품은 블프·12.12 쿠폰을 기다려 보세요.
          </p>
        </div>
      </section>

      <section aria-labelledby="season-coupon" className="mb-12">
        <h2 id="season-coupon" className="text-base font-semibold text-gray-900">
          쿠폰은 어디서 확인하나요?
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed break-keep text-gray-700">
          <li>
            알리익스프레스 앱·홈페이지의 행사 페이지가 정본이에요. 쿠폰 코드는 기간·최소 금액이 자주
            바뀌어서 여기 적지 않아요.
          </li>
          <li>블로그·커뮤니티에 도는 코드는 결제 직전에 적용되는지 다시 확인하세요.</li>
          <li>카드사 즉시할인은 해마다 바뀌어요 — 결제 화면에 보이는 혜택을 확인하세요.</li>
        </ul>
        <a
          href={aliLink}
          target="_blank"
          rel="sponsored nofollow noopener"
          data-track="season-ali-event"
          data-source="season_hub_coupon"
          className="mt-3 inline-block text-sm font-semibold text-gray-900 underline underline-offset-2"
        >
          알리익스프레스 행사·쿠폰 페이지 열기
        </a>
      </section>

      <section aria-labelledby="season-caution" className="mb-12">
        <h2 id="season-caution" className="text-base font-semibold text-gray-900">
          해외직구 전에 확인할 3가지
        </h2>
        <dl className="mt-2 space-y-3 text-sm leading-relaxed break-keep">
          <div>
            <dt className="font-semibold text-gray-900">면세 한도</dt>
            <dd className="mt-0.5 text-gray-700">
              목록통관 물품은 물건값 미화 150달러(미국에서 보내는 물건은 200달러) 이하면
              관세·부가세가 붙지 않아요(2025년 기준). 같은 날 같은 나라에서 들어온 물건은 합쳐서
              따지니 나눠 주문할 때 도착 날짜를 보세요.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">KC 인증</dt>
            <dd className="mt-0.5 text-gray-700">
              어린이 제품·충전기 같은 전기용품은 국내 안전 인증(KC) 없이 들어오는 경우가 있어요.
              사기 전에{' '}
              <a
                href="https://www.safetykorea.kr/"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2"
              >
                제품안전정보센터
              </a>
              에서 리콜·위해 제품인지 찾아보세요.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">개인통관고유부호</dt>
            <dd className="mt-0.5 text-gray-700">
              해외직구에는 개인통관고유부호가 필요해요.{' '}
              <a
                href="https://unipass.customs.go.kr/"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2"
              >
                관세청 UNI-PASS
              </a>
              에서 바로 발급받을 수 있어요.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="season-domestic" className="mb-12">
        <h2 id="season-domestic" className="text-base font-semibold text-gray-900">
          국내 쇼핑 행사 — 지금 올라온 딜
        </h2>
        <EventRows events={DOMESTIC_EVENTS} />
        <ul className="mt-3 flex flex-wrap gap-2">
          {DOMESTIC_EVENTS.map((e) => (
            <li key={e.searchKeyword}>
              <Link
                href={searchHref(e.searchKeyword)}
                rel="nofollow"
                className={cn('inline-block', linkChip)}
              >
                {e.searchKeyword} 핫딜
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="season-faq" className="mb-12">
        <h2 id="season-faq" className="mb-2 text-base font-semibold text-gray-900">
          자주 묻는 질문
        </h2>
        <dl className="divide-y divide-gray-100 border-y border-gray-100 text-sm">
          {FAQS.map((f) => (
            <div key={f.q} className="py-3">
              <dt className="font-medium text-gray-900">{f.q}</dt>
              <dd className="mt-1 leading-relaxed break-keep text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={cn('px-4 py-4', infoBox)}>
        <p className="text-sm font-semibold text-gray-900">블프 직구 특가, 놓치지 않게</p>
        <p className="mt-1 text-sm leading-relaxed break-keep text-gray-600">
          지름알림 카톡방에서 커뮤니티 인기 핫딜과 시즌 직구 특가를 실시간으로 받아 보세요.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={OKACHAT_LINK}
            target="_blank"
            rel="noopener"
            data-track="season-okachat"
            data-source="season_hub"
            className="text-sm font-semibold text-gray-900 underline underline-offset-2"
          >
            카톡방 들어가기
          </a>
          <Link href={PAGE.HELP} className="text-sm text-gray-500 underline underline-offset-2">
            지름알림 사용법
          </Link>
        </div>
      </section>
    </main>
  );
}
