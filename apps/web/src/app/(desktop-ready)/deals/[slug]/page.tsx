import { infoBox, linkChip } from '@jirum/design-system/recipes';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { ProductService } from '@/shared/api/product';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import { fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import {
  findKeywordHubsForTitle,
  formatHubCount,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';

import {
  buildDealsLeadSentence,
  buildModelDisplayName,
  buildRecentDeals,
  buildTimingInsight,
  Deal,
  HeroPrice,
  rankRepresentatives,
  Representative,
  SearchedDeal,
  splitDealsForList,
  withTopicParticle,
} from '@/features/deals/lib/model-page-insights';
import { toSeoImageUrl } from '@/features/product-detail/lib/product-seo';

import KeywordHubAlertButton from '@/widgets/keyword-hub/ui/KeywordHubAlertButton';

import DealsListSection from './DealsListSection';
import DealsMobileHeader from './DealsMobileHeader';
import DealsTracking from './DealsTracking';
import RecentDealsSection from './RecentDealsSection';

// 에버그린 모델 페이지 (/deals/{slug}) — 상품별 핫딜 구매 판단 허브. SEO + 상품상세 CTA 유입.
// 백엔드 model_page(isPublished=true) precompute payload 를 단일 slug 조회로 SSR.
// 판정·진행중 우선·팩 추천은 payload에서 프론트 파생(슬러그 공통 템플릿).

interface PriceSummary {
  source: 'danawa_stats' | 'parsed_price' | 'none';
  min?: number;
  max?: number;
  median?: number;
}

interface DanawaInfo {
  danawaPrice: number | null;
  mallCount: number | null;
  danawaUrl: string | null;
}

interface PricePoint {
  month: string;
  price: number;
}

interface PriceHistory {
  currency: 'KRW' | 'USD';
  /** unit=단위가 축, total(또는 생략)=총액 축. 구 payload 호환 위해 optional. */
  basis?: 'unit' | 'total';
  unitLabel?: string;
  /** day/week/month. 구 payload 없으면 month. points[].month 에 기간 키. */
  granularity?: 'day' | 'week' | 'month';
  points: PricePoint[];
}

/** 추이 X축 라벨 — granularity 에 맞게 짧게. */
function histPeriodLabel(period: string, granularity: 'day' | 'week' | 'month'): string {
  if (granularity === 'week') {
    const m = period.match(/W(\d+)$/i);
    return m ? `W${m[1]}` : period.slice(-3);
  }
  if (granularity === 'day') {
    const m = period.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (m) return `${Number(m[1])}/${Number(m[2])}`;
  }
  return period.length >= 7 ? period.slice(2) : period;
}

interface RelatedModel {
  slug: string;
  modelName: string;
  dealCount: number;
}

interface ModelPagePayload {
  heroImage?: string | null;
  heroPrice?: HeroPrice | null;
  representatives?: Representative[];
  deals?: Deal[];
  priceSummary?: PriceSummary;
  danawa?: DanawaInfo | null;
  priceHistory?: PriceHistory;
  relatedModels?: RelatedModel[];
}

export const revalidate = 600;

function won(n?: number | null): string {
  if (n == null) return '-';
  return `${Math.round(n).toLocaleString()}원`;
}

/** 지금 딜 구성보다 단위가가 20% 넘게 싼 다른 구성(같은 단위 라벨) 중 가장 싼 것. */
function rankedRepsForHint(
  reps: Representative[],
  timing: { current: number; unitLabel?: string | null; bestPackLabel: string | null },
): Representative | null {
  const cheaper = reps
    .filter(
      (r) =>
        r.label !== timing.bestPackLabel &&
        r.unitLabel === timing.unitLabel &&
        r.unitPrice != null &&
        r.unitPrice > 0 &&
        r.unitPrice < timing.current * 0.8,
    )
    .sort((a, b) => (a.unitPrice ?? 0) - (b.unitPrice ?? 0));
  return cheaper[0] ?? null;
}

type ModelPageData = NonNullable<Awaited<ReturnType<typeof ModelPageService.getModelPage>>>;

/**
 * 가격 추이·구매 타이밍·리드 문장. 본문 첫 문단·JSON-LD description·meta description 이 같은 문장을 쓴다.
 * meta description 을 백엔드 metaDescription 대신 이걸로 쓰는 이유: 단위가 모델(SSD GB당 등)에서
 * 백엔드 문구가 "최저 108.06원~" 처럼 단위 없이 나갔다(2026-09-23 실측). 리드 문장은 단위를 문장 안에 넣는다.
 */
function deriveModelPageInsights(page: ModelPageData, displayName: string) {
  const payload = (page.payload ?? {}) as ModelPagePayload;
  const { heroPrice, deals = [], priceHistory, representatives = [] } = payload;
  const histCurrency = priceHistory?.currency ?? 'KRW';
  const histBasis = priceHistory?.basis ?? 'total';
  const histUnitLabel = priceHistory?.unitLabel;
  const fmtHist = (n: number) => {
    if (histBasis === 'unit') {
      return `${Math.round(n).toLocaleString()}원`;
    }
    return histCurrency === 'USD' ? `$${Math.round(n)}` : `${Math.round(n).toLocaleString()}원`;
  };
  const histPrices = (priceHistory?.points ?? []).map((p) => p.price);
  const timing = buildTimingInsight({
    deals,
    histPrices,
    histBasis,
    histUnitLabel,
    heroPrice,
    representatives,
    currency: histCurrency,
  });
  const fmtWithUnit = (price: number) =>
    histBasis === 'unit' && histUnitLabel ? `${histUnitLabel} ${fmtHist(price)}` : fmtHist(price);
  const leadSentence = buildDealsLeadSentence({
    modelName: displayName,
    timing,
    dealCount: page.dealCount,
    formatPrice: fmtWithUnit,
  });
  return { fmtHist, histPrices, timing, leadSentence };
}

/** 이름 검색으로 찾을 최근 딜 기간. */
const RECENT_SEARCH_DAYS = 14;

/**
 * 모델 이름으로 최근 딜 검색 — 매칭 안 된 같은 상품 딜을 "최근 올라온 핫딜"에 붙이려고.
 * 시작일을 하루 단위로 내림해 fetch 캐시 키를 하루 동안 같게 둔다(밀리초 시각이면 매 요청 캐시 미스).
 * 검색이 실패해도 페이지는 매칭된 딜만으로 그린다.
 */
async function searchRecentDeals(modelName: string): Promise<SearchedDeal[]> {
  const day = 24 * 60 * 60 * 1000;
  const startDate = new Date(Math.floor(Date.now() / day) * day - RECENT_SEARCH_DAYS * day);
  try {
    const res = await ProductService.getProducts(
      { limit: 30, keyword: modelName, startDate: startDate.toISOString() },
      { public: true, revalidate: 600 },
    );
    return (res.products ?? []).map((p) => ({
      id: Number(p.id),
      title: p.title,
      price: p.price ?? null,
      mallName: p.mallName ?? null,
      postedAt: p.postedAt,
      thumbnail: p.thumbnail ?? null,
      isEnd: p.isEnd ?? null,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await ModelPageService.getModelPage({ slug: decodeURIComponent(slug) });
  if (!page) return { title: '핫딜 모음 | 지름알림' };

  const payload = (page.payload ?? {}) as ModelPagePayload;
  const displayName = buildModelDisplayName(page.brand, page.modelName);
  // 건수를 제목에 넣는다 — 네이버 상위 경쟁 허브가 "역대 최저 N원 · 최근 N건" 형태(2026-09-23 실측).
  // 가격은 안 넣는다: 수량이 섞인 모델(생수 6병/24병)에서 "최저 N원" 은 어느 구성인지 모호하다.
  const title = `${displayName} 핫딜 최저가 모음 · 최근 ${page.dealCount.toLocaleString('ko-KR')}건 | 지름알림`;
  const { leadSentence } = deriveModelPageInsights(page, displayName);
  const description =
    leadSentence ?? `${displayName} 역대 핫딜 ${page.dealCount}건. 지름알림에서 가격 모아보기.`;
  const url = `${METADATA_SERVICE_URL}/deals/${page.slug}`;
  // 우리 CDN 은 webp 만 있어 원본 확장자는 403 — og·JSON-LD 도 화면처럼 변환한다.
  const image = toSeoImageUrl(payload.heroImage) ?? `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ModelDealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await ModelPageService.getModelPage({ slug: decodeURIComponent(slug) });
  if (!page) notFound();
  const searched = await searchRecentDeals(page.modelName);
  // 이 모델이 속한 키워드 허브(삼다수 2L → 삼다수 핫딜). 구글은 사람을 모델 페이지로 데려오고(10/1~13 착지 53),
  // 허브는 아직 거의 안 데려온다 — 같은 키워드의 다른 상품을 보러 갈 길을 낸다(허브 → 모델 페이지 칩과 짝).
  // 상위 키워드(page.keywordHub)는 서버가 고른 가장 좁은 허브 — 경로 표시의 부모이고 칩도 맨 앞이다(2026-10-17 키워드가 위층).
  const parentHub = page.keywordHub ?? null;
  // 모델명만 본다 — 브랜드까지 넣으면 회사명 속 낱말이 걸린다(코카콜라음료 파워에이드 → 콜라). 브랜드 허브(켈로그)는 부모로 온다.
  const keywordHubs = [
    ...(parentHub ? [parentHub] : []),
    ...findKeywordHubsForTitle(page.modelName, await fetchKeywordHubs(), 10),
  ]
    .filter((hub, i, all) => all.findIndex((h) => h.slug === hub.slug) === i)
    .slice(0, 2);

  const payload = (page.payload ?? {}) as ModelPagePayload;
  const {
    heroImage,
    heroPrice,
    representatives = [],
    deals = [],
    danawa,
    priceHistory,
    relatedModels = [],
  } = payload;
  const histPoints = priceHistory?.points ?? [];
  const histCurrency = priceHistory?.currency ?? 'KRW';
  const histBasis = priceHistory?.basis ?? 'total';
  const histUnitLabel = priceHistory?.unitLabel;
  const histGranularity = priceHistory?.granularity ?? 'month';
  const histTitle =
    histGranularity === 'day'
      ? '일별 핫딜 최저가 추이'
      : histGranularity === 'week'
        ? '주별 핫딜 최저가 추이'
        : '월별 핫딜 최저가 추이';
  const displayName = buildModelDisplayName(page.brand, page.modelName);
  const { fmtHist, histPrices, timing, leadSentence } = deriveModelPageInsights(page, displayName);
  const histMax = histPrices.length ? Math.max(...histPrices) : 0;
  const histMin = histPrices.length ? Math.min(...histPrices) : 0;
  const histBarH = (price: number) => {
    if (histMax === histMin) return 40;
    return 20 + ((price - histMin) / (histMax - histMin)) * 52;
  };

  const { active: activeDeals, history: historyDeals } = splitDealsForList(
    deals,
    histBasis,
    histUnitLabel,
    undefined,
    histCurrency,
  );

  const recentRows = buildRecentDeals({
    deals,
    searched,
    modelName: page.modelName,
    brand: page.brand,
    currency: histCurrency,
  });

  const offerPrice = heroPrice?.minPrice ?? null;
  // 진행 중인 딜이 없으면 재고를 주장하지 않고, 가격 유효기간도 마지막 딜 기준으로 잡는다.
  // 예전엔 항상 InStock + `오늘+7일` 이라 3년째 딜이 없는 모델도 "지금 살 수 있다"고 말했다.
  const hasActiveDeal = timing.activeDealCount > 0;
  const lastDealMs = page.lastDealAt ? Date.parse(page.lastDealAt) : NaN;
  const priceValidFrom =
    !hasActiveDeal && Number.isFinite(lastDealMs)
      ? lastDealMs
      : // eslint-disable-next-line react-hooks/purity -- 서버 컴포넌트라 요청마다 한 번 렌더된다. 구조화 데이터의 "지금" 시각이 필요하다.
        Date.now();
  const productLd =
    offerPrice != null
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: displayName,
          // 본문 첫 문단과 같은 문장. AI 답변 엔진이 인용할 근거 문장을 구조화 데이터에도 남긴다.
          description: leadSentence ?? page.metaDescription ?? undefined,
          brand: page.brand ? { '@type': 'Brand', name: page.brand } : undefined,
          url: `${METADATA_SERVICE_URL}/deals/${page.slug}`,
          image: heroImage ? [toSeoImageUrl(heroImage)] : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KRW',
            price: Math.round(offerPrice),
            ...(hasActiveDeal ? { availability: 'https://schema.org/InStock' } : {}),
            url: `${METADATA_SERVICE_URL}/deals/${page.slug}`,
            priceValidUntil: new Date(priceValidFrom + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          },
        }
      : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: '지름알림', item: METADATA_SERVICE_URL },
      ...(parentHub
        ? [
            { name: '키워드별 핫딜', item: `${METADATA_SERVICE_URL}${PAGE.KEYWORDS}` },
            {
              name: `${parentHub.name} 핫딜`,
              item: `${METADATA_SERVICE_URL}${keywordHubPath(parentHub)}`,
            },
          ]
        : [{ name: '핫딜 최저가 모음', item: `${METADATA_SERVICE_URL}${PAGE.DEALS}` }]),
      { name: displayName },
    ].map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
  };
  const jsonLd = productLd ? [productLd, breadcrumbLd] : [breadcrumbLd];
  const rankedReps = rankRepresentatives(representatives);
  const bestRep = rankedReps.find((r) => r.isBestUnit);

  // 판정 색 — 좋음=success·비쌈=warning·평소=gray(/deals 목록 판정 배지와 같다).
  const timingTone =
    timing.tone === 'good'
      ? 'success'
      : timing.tone === 'high' || timing.tone === 'mall'
        ? 'warning'
        : 'gray';
  // 판정은 지금 딜과 같은 구성 안에서만 한다 — 다른 구성이 단위가로 훨씬 싸면 따로 알려 준다(2026-10-19 보성녹차:
  // 350ml 24개 100ml당 140원 「사기 좋은 구간」인데 1.5L 12개는 다나와 100ml당 63원). 같은 단위·20% 넘게 쌀 때만.
  const cheaperPack =
    timing.isActivePrice && timing.basis === 'unit'
      ? rankedRepsForHint(representatives, timing)
      : null;
  const histSpanLabel =
    histGranularity === 'day' ? '일' : histGranularity === 'week' ? '주' : '개월';

  const listTitleSuffix =
    histBasis === 'unit' && histUnitLabel ? `${histUnitLabel} 싼 순` : '싼 순';

  // 추이 막대에 "지금" 표시 — 현재가에 가장 가까운 막대 하나만(2% 안일 때, 동률이면 최근).
  // 예전엔 2% 안의 막대마다 "지금 N원" 을 찍어 평평한 추이에서 라벨 10개가 겹쳤다(2026-10-05 스팸).
  // 최저·최고 라벨도 같은 값이 여러 막대면 하나씩만(최저=최근, 최고=처음).
  const nowPrice = timing.current > 0 ? timing.current : null;
  let nowIdx = -1;
  if (nowPrice != null) {
    let bestDiff = Infinity;
    histPoints.forEach((p, i) => {
      const diff = Math.abs(p.price - nowPrice);
      if (diff <= bestDiff) {
        bestDiff = diff;
        nowIdx = i;
      }
    });
    if (bestDiff / (histMax || 1) >= 0.02) nowIdx = -1;
  }
  const lowIdx = histPrices.lastIndexOf(histMin);
  const highIdx = histPrices.indexOf(histMax);

  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <DealsTracking slug={page.slug} />
      <DealsMobileHeader title={displayName} />

      <nav aria-label="위치" className="mb-3 text-sm text-gray-500">
        {parentHub ? (
          <>
            <Link href={PAGE.KEYWORDS} className="hover:underline">
              키워드별 핫딜
            </Link>
            <span aria-hidden> › </span>
            <Link
              href={keywordHubPath(parentHub)}
              data-track="keyword-hub-link"
              data-source="model_page_breadcrumb"
              className="font-medium text-gray-700 hover:underline"
            >
              {parentHub.name} 핫딜
            </Link>
          </>
        ) : (
          <Link href={PAGE.DEALS} className="hover:underline">
            핫딜 최저가 모음
          </Link>
        )}
      </nav>

      <div className="pc:grid pc:grid-cols-3 pc:items-start pc:gap-x-10">
        <div className="pc:col-span-2">
          {/* 히어로 — 구매 판단 */}
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
            {heroImage && (
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                {/* webp 우선 + 없으면 원본 폴백. S3 webp 변환 커버리지가 91.8% 라
                    (2026-09-02 전수 실측: 원본 87.5만 중 7.1만 누락) 폴백 없이 webp 를 쓰면
                    8% 가 403 으로 깨진다 — CDN 은 폴백을 안 해준다(실측 403).
                    ImageComponent 는 fallbackSrc 가 있으면 클라 컴포넌트로 가서 priority
                    preload 가 빠지는데, 히어로 1장 preload 보다 안 깨지는 게 우선. */}
                <ImageComponent
                  src={convertToWebp(heroImage) ?? heroImage}
                  fallbackSrc={heroImage}
                  alt={displayName}
                  width={160}
                  height={160}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{displayName}, 지금 사도 될까?</h1>
              {/* h1 다음 첫 문단 = 답. 수치가 UI 토큰으로만 흩어져 있으면 AI 가 인용할 문장이
                  없다. 아래 카드와 같은 값을 문장으로 한 번 더 쓴다(JSON-LD description 도 동일). */}
              <p className="mt-1 text-sm text-gray-600">
                {leadSentence ?? '커뮤니티 핫딜을 단위가로 모아, 사도 되는 가격을 알려드립니다.'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {page.brand ? `${page.brand} · ` : ''}지금까지 핫딜 {page.dealCount}건
                {page.lastDealAt
                  ? ` · 마지막 ${new Date(page.lastDealAt).toLocaleDateString('ko-KR')}`
                  : ''}
              </p>

              {(timing.current > 0 || heroPrice?.minPrice != null) && (
                <div className={cn('mt-3 p-3', infoBox)}>
                  <div className="flex flex-wrap items-center gap-2">
                    {timing.tone !== 'unknown' && (
                      <Badge pill tone={timingTone}>
                        {timing.label}
                      </Badge>
                    )}
                    {timing.activeDealCount > 0 && (
                      <span className="text-11 text-gray-500">
                        진행 중 {timing.activeDealCount}건
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-11 text-gray-500">
                        {timing.isActivePrice ? '지금 진행 최저' : '지난 핫딜 최저'}
                        {timing.basis === 'unit' && timing.unitLabel
                          ? ` (${timing.unitLabel})`
                          : ''}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {timing.current > 0
                          ? won(timing.current)
                          : histBasis === 'unit' && heroPrice?.unitPrice != null
                            ? won(heroPrice.unitPrice)
                            : won(heroPrice?.minPrice)}
                      </p>
                      {timing.isActivePrice && timing.bestPackLabel ? (
                        <p className="text-xs text-gray-500">
                          {timing.bestPackLabel}
                          {timing.totalPrice != null ? ` · 총액 ${won(timing.totalPrice)}` : ''}
                        </p>
                      ) : (
                        heroPrice?.label && (
                          <p className="text-xs text-gray-500">
                            {heroPrice.label}
                            {heroPrice.minPrice != null ? ` · 총액 ${won(heroPrice.minPrice)}` : ''}
                          </p>
                        )
                      )}
                    </div>
                    {timing.avg != null && (
                      <div>
                        <p className="text-11 text-gray-500">추이 평균 대비</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {timing.savePct != null
                            ? timing.savePct > 0
                              ? `약 ${timing.savePct}% 저렴`
                              : timing.savePct < 0
                                ? `약 ${Math.abs(timing.savePct)}% 비쌈`
                                : '평균 수준'
                            : '-'}
                        </p>
                        <p className="text-xs text-gray-500">평균 {fmtHist(timing.avg)}</p>
                      </div>
                    )}
                    {timing.buyLine != null && (
                      <div>
                        <p className="text-11 text-gray-500">이하면 사도 됨</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {fmtHist(timing.buyLine)}
                        </p>
                        <p className="text-xs text-gray-500">추이 최저~최고의 하위 30%</p>
                      </div>
                    )}
                  </div>

                  {/* 판정 근거 — 결론이 어느 구성·몇 점의 추이·어떤 비교에서 나왔는지 한 자리에서 보이게. */}
                  {timing.isActivePrice && (
                    <ul className="mt-3 flex flex-col gap-1 border-t border-gray-200 pt-2 text-xs text-gray-600">
                      {timing.mallPrice != null && timing.totalPrice != null && (
                        <li>
                          다나와 같은 구성 최저가{' '}
                          <span className="font-semibold text-gray-900">
                            {won(timing.mallPrice)}
                          </span>
                          {timing.mallPrice <= timing.totalPrice
                            ? ` — 핫딜이 ${won(timing.totalPrice - timing.mallPrice)} 더 비싸요`
                            : ` — 핫딜이 ${won(timing.mallPrice - timing.totalPrice)} 더 싸요`}
                        </li>
                      )}
                      {histPrices.length > 0 && (
                        <li>
                          {timing.bestPackLabel ? `${timing.bestPackLabel} 기준 · ` : ''}핫딜 추이{' '}
                          {timing.historyPoints}
                          {histSpanLabel}치 (최저 {fmtHist(histMin)} · 최고 {fmtHist(histMax)})
                          {timing.historyPoints < 5 ? ' — 추이가 짧아 판정하지 않아요' : ''}
                        </li>
                      )}
                      {cheaperPack && cheaperPack.unitPrice != null && (
                        <li>
                          다른 구성 {withTopicParticle(cheaperPack.label)} {cheaperPack.unitLabel}{' '}
                          <span className="font-semibold text-gray-900">
                            {won(cheaperPack.unitPrice)}
                          </span>
                          {cheaperPack.dealMinPrice != null ? '(핫딜)' : '(다나와)'}로 더 싸요
                        </li>
                      )}
                    </ul>
                  )}

                  {timing.tone === 'mall' && danawa?.danawaUrl && (
                    <a
                      href={danawa.danawaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 mr-4 inline-flex text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
                    >
                      다나와 최저가 보기 →
                    </a>
                  )}
                  {activeDeals.length > 0 && (
                    <a
                      href="#deals-list"
                      className="mt-3 inline-flex text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
                    >
                      지금 살 수 있는 딜 보기 →
                    </a>
                  )}
                </div>
              )}
              {/* 모델 페이지 → 키워드 알림. 검색으로 온 사람을 북극성(알림 경유 재방문)으로 올리는 자리라
                  딜 유무와 상관없이 늘 둔다. 키워드는 최근 딜 검색에 쓰는 모델명 그대로(브랜드를 붙이면 제목에 안 걸린다). */}
              <KeywordHubAlertButton keyword={page.modelName} placement="model_page" />
            </div>
          </header>

          <RecentDealsSection rows={recentRows} />

          {/* 용량·수량 — 추천 팩 */}
          {rankedReps.length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">용량·수량별 대표 상품</h2>
                {bestRep && (
                  <span className="text-xs text-gray-500">
                    가성비 1위 {bestRep.label}
                    {bestRep.unitPrice != null && bestRep.unitLabel
                      ? ` · ${bestRep.unitLabel} ${won(bestRep.unitPrice)}`
                      : ''}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {rankedReps.map((rep, i) => {
                  const Card = rep.danawaUrl ? 'a' : 'div';
                  const danawaDisplay =
                    rep.danawaPrice != null && rep.danawaPrice > 0 ? rep.danawaPrice : null;
                  return (
                    <Card
                      key={i}
                      {...(rep.danawaUrl
                        ? { href: rep.danawaUrl, target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className={`flex flex-col gap-1 rounded-lg border p-3 hover:bg-gray-50 ${
                        rep.isBestUnit ? 'border-success-300 bg-success-50/40' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium">{rep.label}</span>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          {rep.isBestUnit && (
                            <Badge size="xs" tone="success">
                              단위가 최저
                            </Badge>
                          )}
                          {(rep.activeDeals > 0 || rep.dealMinPrice != null) && (
                            <Badge size="xs" tone="secondary">
                              핫딜
                            </Badge>
                          )}
                          {rep.priceRank && (
                            <Badge size="xs" tone="warning">
                              다나와 {rep.priceRank}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {rep.dealMinPrice != null && (
                        <span className="text-sm font-semibold text-gray-900">
                          핫딜 {won(rep.dealMinPrice)}
                        </span>
                      )}
                      {rep.unitPrice != null && (
                        <span className="text-xs text-gray-500">
                          {rep.unitLabel} {won(rep.unitPrice)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {danawaDisplay != null ? `다나와 ${won(danawaDisplay)}` : ''}
                        {rep.mallCount ? ` · ${rep.mallCount}곳` : ''}
                        {rep.danawaSaving != null ? ` · ${won(rep.danawaSaving)} 절약` : ''}
                        {rep.danawaUrl ? ' ›' : ''}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* 핫딜 최저가 추이 + 지금 위치 */}
          {histPoints.length >= 2 && (
            <section className="mb-6">
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">{histTitle}</h2>
                <span className="text-xs text-gray-500">
                  {histBasis === 'unit' && histUnitLabel
                    ? histUnitLabel
                    : histCurrency === 'USD'
                      ? '직구가($)'
                      : '원화'}
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                {nowPrice != null && (
                  <>
                    지금 <span className="font-semibold text-gray-800">{fmtHist(nowPrice)}</span>
                    <span className="text-gray-300"> · </span>
                  </>
                )}
                추이 최저 <span className="text-error-600 font-semibold">{fmtHist(histMin)}</span>
                <span className="text-gray-300"> · </span>
                최고 {fmtHist(histMax)}
                {timing.buyLine != null && (
                  <>
                    <span className="text-gray-300"> · </span>
                    기준 {fmtHist(timing.buyLine)}
                  </>
                )}
              </p>
              <div className="relative">
                {timing.buyLine != null && histMax > histMin && (
                  <div
                    className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-gray-300"
                    style={{
                      // 막대 영역 96px 중 라벨(~16) + 바(72 max) + x라벨. 바 bottom≈12px(x라벨).
                      bottom: `${12 + histBarH(timing.buyLine)}px`,
                    }}
                    title={`기준 ${fmtHist(timing.buyLine)}`}
                  />
                )}
                <div className="flex items-end gap-1" style={{ height: 96 }}>
                  {histPoints.map((p, i) => {
                    const isLow = p.price === histMin;
                    const isNearNow = i === nowIdx;
                    const showPriceLabel = isNearNow || i === lowIdx || i === highIdx;
                    // 막대가 많으면 x라벨이 겹친다 — 최근 막대부터 거꾸로 세어 ~8개만.
                    const labelStep = Math.max(2, Math.ceil(histPoints.length / 8));
                    const showLabel = (histPoints.length - 1 - i) % labelStep === 0;
                    return (
                      <div
                        key={p.month}
                        className="flex flex-1 flex-col items-center justify-end gap-1"
                      >
                        {showPriceLabel && (
                          <span
                            className={`text-10 whitespace-nowrap ${
                              isNearNow
                                ? 'text-success-600 font-semibold'
                                : isLow
                                  ? 'text-error-600 font-semibold'
                                  : 'text-gray-500'
                            }`}
                          >
                            {isNearNow ? `지금 ${fmtHist(p.price)}` : fmtHist(p.price)}
                          </span>
                        )}
                        <div
                          className={`w-full rounded-t ${
                            isNearNow
                              ? 'bg-success-500'
                              : isLow
                                ? 'bg-error-400'
                                : 'bg-secondary-300'
                          }`}
                          style={{ height: `${histBarH(p.price)}px` }}
                          title={`${p.month}: ${fmtHist(p.price)}`}
                        />
                        <span className="text-10 h-3 text-gray-500">
                          {showLabel ? histPeriodLabel(p.month, histGranularity) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <DealsListSection
            activeDeals={activeDeals}
            historyDeals={historyDeals}
            histBasis={histBasis}
            histUnitLabel={histUnitLabel}
            histMin={histMin}
            listTitleSuffix={listTitleSuffix}
            currency={histCurrency}
            suppressPick={timing.tone === 'mall'}
          />
        </div>

        <aside className="pc:sticky pc:top-24 pc:col-span-1 flex flex-col gap-4">
          {danawa?.danawaUrl && (
            <a
              href={danawa.danawaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div>
                <div className="text-sm font-medium">다나와 최저가 비교</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  상시몰 가격 검증
                  {danawa.mallCount ? ` · ${danawa.mallCount}곳` : ''}
                  {danawa.danawaPrice ? ` · ${won(danawa.danawaPrice)}` : ''}
                </div>
              </div>
              <span className="text-sm text-gray-500">바로가기 →</span>
            </a>
          )}

          {keywordHubs.length > 0 && (
            <section className="rounded-lg border border-gray-100 p-4">
              <h2 className="mb-3 text-base font-semibold">같은 키워드 핫딜</h2>
              <div className="flex flex-wrap gap-2">
                {keywordHubs.map((hub) => (
                  <Link
                    key={hub.slug}
                    href={keywordHubPath(hub)}
                    data-track="keyword-hub-link"
                    data-source="model_page"
                    className={linkChip}
                  >
                    {hub.name} 핫딜 전체
                    {hub.recentDealCount > 0 && (
                      <span className="text-gray-500"> (최근 30일 {formatHubCount(hub)})</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedModels.length > 0 && (
            <section className="rounded-lg border border-gray-100 p-4">
              <h2 className="mb-3 text-base font-semibold">{page.brand} 다른 모델</h2>
              <div className="flex flex-wrap gap-2">
                {relatedModels.map((m) => (
                  <a key={m.slug} href={`/deals/${m.slug}`} className={linkChip}>
                    {m.modelName} <span className="text-gray-500">({m.dealCount})</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
