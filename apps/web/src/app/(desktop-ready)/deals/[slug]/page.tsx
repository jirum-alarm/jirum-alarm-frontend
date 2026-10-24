import { linkChip, text } from '@jirum/design-system/recipes';
import { buildHubModelGroups, findHubModelLine } from '@jirum/domain/hub-model-pages';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { jsonLdHtml } from '@/shared/lib/json-ld';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import { fetchKeywordHub, fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import {
  findKeywordHubsForTitle,
  formatHubCount,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';

import {
  buildDealsAnswer,
  buildDealsLeadSentence,
  buildModelDisplayName,
  cleanDealTitle,
  Deal,
  formatDealPrice,
  HeroPrice,
  MIN_HISTORY_POINTS,
  pickModelAlertKeyword,
  RankedRepresentative,
  rankRepresentatives,
  recentDealRows,
  relativeTimeLabel,
  Representative,
  splitDealsForList,
  timingFromVerdict,
  type TimingInsight,
  withTopicParticle,
} from '@/features/deals/lib/model-page-insights';
import { toSeoImageUrl } from '@/features/product-detail/lib/product-seo';

import HubModelChipList from '@/widgets/keyword-hub/ui/HubModelChipList';
import KeywordHubAlertButton from '@/widgets/keyword-hub/ui/KeywordHubAlertButton';

import DealsAnswerCard, { type AnswerDealRow } from './DealsAnswerCard';
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
 * 마지막 딜 — 진행 딜이 없을 때 「지금 사도 될까?」의 답(마지막 핫딜 N일 전 · 가격). 검수된 딜 먼저(검수 전 딜은 다른 상품일 수 있다),
 * 없으면 검수 전 딜. 서버 순서를 믿지 않고 날짜로 고른다. 직구 달러 가격은 원으로 못 쓰니 가격만 뺀다.
 */
function latestDeal(page: ModelPageData) {
  type Row = NonNullable<ModelPageData['recentDeals']>[number];
  const newest = (rows: Row[]) =>
    rows.reduce<Row | null>(
      (a, d) => (!a || Date.parse(d.postedAt) > Date.parse(a.postedAt) ? d : a),
      null,
    );
  const rows = page.recentDeals ?? [];
  const d = newest(rows.filter((r) => r.isVerified)) ?? newest(rows);
  if (!d) return null;
  return {
    productId: d.productId,
    postedAt: d.postedAt,
    price: d.priceCurrency === 'USD' ? null : (d.price ?? null),
  };
}

/**
 * 가격 추이·구매 타이밍·리드 문장. 본문 첫 문단·JSON-LD description·meta description 이 같은 문장을 쓴다.
 * meta description 을 백엔드 metaDescription 대신 이걸로 쓰는 이유: 단위가 모델(SSD GB당 등)에서
 * 백엔드 문구가 "최저 108.06원~" 처럼 단위 없이 나갔다(2026-09-23 실측). 리드 문장은 단위를 문장 안에 넣는다.
 */
function deriveModelPageInsights(page: ModelPageData, displayName: string) {
  const lastDeal = latestDeal(page);
  const payload = (page.payload ?? {}) as ModelPagePayload;
  const { heroPrice, priceHistory } = payload;
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
  const timing = timingFromVerdict({
    verdict: page.priceVerdict,
    histBasis,
    histUnitLabel,
    heroPrice,
  });
  const fmtWithUnit = (price: number) =>
    histBasis === 'unit' && histUnitLabel ? `${histUnitLabel} ${fmtHist(price)}` : fmtHist(price);
  const leadSentence = buildDealsLeadSentence({
    modelName: displayName,
    timing,
    dealCount: page.dealCount,
    formatPrice: fmtWithUnit,
    lastDeal,
  });
  return { fmtHist, fmtWithUnit, histPrices, timing, leadSentence, lastDeal };
}

/**
 * 허브에서 이 상품이 묶인 줄(진라면 → 순한맛·매운맛·매운맛 컵) — 허브 「상품별 최저가 모음」 칩을 눌러 온 사람이 옆 맛·구성으로
 * 건너가게 허브와 같은 묶음·순서로. 묶음은 이름만으로 정해지니 먼저 판정 없이 줄이 있는지 보고, 있을 때만 판정 목록(허브와 같은
 * 데이터 캐시)을 읽어 「지금 싼」 칩을 앞으로. 링크는 부가 요소라 실패하면 줄 없이 그린다.
 */
async function loadModelLine(hubSlug: string, slug: string) {
  const hub = await fetchKeywordHub(hubSlug).catch(() => null);
  if (!hub || hub.modelPages.length < 2) return null;
  if (!findHubModelLine(buildHubModelGroups(hub.hub.name, hub.modelPages, []).groups, slug)) {
    return null;
  }
  const verdicts = await ModelPageService.getPublishedModelPages().catch(() => []);
  return findHubModelLine(buildHubModelGroups(hub.hub.name, hub.modelPages, verdicts).groups, slug);
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
  const modelLine = parentHub ? await loadModelLine(parentHub.slug, page.slug) : null;

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
  const { fmtHist, fmtWithUnit, histPrices, timing, leadSentence, lastDeal } =
    deriveModelPageInsights(page, displayName);
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
    page.priceVerdict,
    histCurrency,
  );

  const recentRows = recentDealRows(page.recentDeals ?? []);

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
  // 구성별 가격 표 — 단위가 싼 순(값 없는 구성은 뒤).
  const packRows = [...rankedReps].sort(
    (a, b) => (a.unitPrice ?? Number.POSITIVE_INFINITY) - (b.unitPrice ?? Number.POSITIVE_INFINITY),
  );
  // 서버 추이(priceHistory)는 하루 최저 단위가를 구성 구분 없이 섞는다 — 구성이 여럿이면 막대 높낮이가 가격이 아니라
  // «그날 2L 이 올라왔나 500ml 가 올라왔나»를 그리고, 한 구성으로 정한 「사기 좋은 가격」 선과도 기준이 다르다(2026-10-24).
  // 그땐 막대 대신 구성별 표가 비교를 맡는다. 구성이 하나(총액 기준·전자제품)면 추이가 곧 가격 변화라 막대를 둔다.
  const showHistChart = histPoints.length >= 2 && !(histBasis === 'unit' && packRows.length >= 2);

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

  // 답 카드 — 지금 상태 → 평소와 비교 → 살 기준 → 살 곳. 진행 딜이 있으면 판정한 딜(없으면 진행 목록 첫 줄)을 바로 누를 수 있게.
  const answer = buildDealsAnswer({ timing, formatPrice: fmtWithUnit, lastDeal });
  const answerDeal =
    timing.activeDealCount > 0
      ? (activeDeals.find((d) => d.productId === page.priceVerdict?.bestProductId) ??
        activeDeals[0] ??
        null)
      : null;
  const answerDealRow: AnswerDealRow | null = answerDeal
    ? {
        productId: answerDeal.productId,
        title: cleanDealTitle(answerDeal.title),
        thumbnail: answerDeal.thumbnail,
        meta:
          [answerDeal.mallName, relativeTimeLabel(answerDeal.postedAt)]
            .filter(Boolean)
            .join(' · ') || null,
        priceText: formatDealPrice(answerDeal, histCurrency),
        unitText:
          answerDeal.unitPrice != null && answerDeal.unitLabel
            ? `${answerDeal.unitLabel} ${won(answerDeal.unitPrice)}`
            : null,
      }
    : null;
  // 알림 키워드 — 모델명이 이 상품 딜 제목에 잘 안 걸리면 제목에서 뽑은 이름으로(알림은 제목에 그 글자가 있어야 간다).
  const alertKeyword = pickModelAlertKeyword({
    modelName: page.modelName,
    brand: page.brand,
    hubName: parentHub?.name,
    titles: [...deals.map((d) => d.title), ...(page.recentDeals ?? []).map((d) => d.title)],
  });

  // 추이 막대에 "지금" 표시 — 현재가에 가장 가까운 막대 하나만(2% 안일 때, 동률이면 최근).
  // 예전엔 2% 안의 막대마다 "지금 N원" 을 찍어 평평한 추이에서 라벨 10개가 겹쳤다(2026-10-05 스팸).
  // 최저·최고 라벨도 같은 값이 여러 막대면 하나씩만(최저=최근, 최고=처음).
  // 진행 딜이 없으면 timing.current 는 지난 핫딜 가격(히어로 폴백)이라 「지금」이라 부르지 않는다.
  const nowPrice = timing.isActivePrice && timing.current > 0 ? timing.current : null;
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
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(ld)} />
      ))}

      <DealsTracking slug={page.slug} />
      <DealsMobileHeader title={displayName} />

      <nav aria-label="위치" className={cn(text.muted, 'mb-3')}>
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

      {/* 허브에서 온 사람이 어디쯤인지 — 허브 「상품별 최저가 모음」의 같은 줄 칩을 그대로, 지금 상품은 고른 칩. */}
      {modelLine && (
        <nav aria-label={`${modelLine.name} 다른 상품`} className="mb-5 flex items-start gap-3">
          <p className={cn(text.label, 'shrink-0 pt-1.5')}>{modelLine.name}</p>
          <HubModelChipList
            chips={modelLine.chips}
            source="model_page_line"
            currentSlug={page.slug}
          />
        </nav>
      )}

      <div className="pc:grid pc:grid-cols-3 pc:items-start pc:gap-x-10">
        <div className="pc:col-span-2">
          {/* 히어로 — 무엇에 대한 답인지(이름·사진) 다음 바로 답 카드. 사진은 딜 화면 캡처가 많아 작게 — 폰 첫 화면에 답이 들어오게. */}
          <header className="mb-4">
            <div className="flex items-start gap-4">
              {heroImage && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-24 sm:w-24">
                  {/* webp 우선 + 없으면 원본 폴백. S3 webp 변환 커버리지가 91.8% 라
                      (2026-09-02 전수 실측) 폴백 없이 webp 를 쓰면
                      8% 가 403 으로 깨진다 — CDN 은 폴백을 안 해준다(실측 403).
                      ImageComponent 는 fallbackSrc 가 있으면 클라 컴포넌트로 가서 priority
                      preload 가 빠지는데, 히어로 1장 preload 보다 안 깨지는 게 우선. */}
                  <ImageComponent
                    src={convertToWebp(heroImage) ?? heroImage}
                    fallbackSrc={heroImage}
                    alt={displayName}
                    width={96}
                    height={96}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">{displayName}, 지금 사도 될까?</h1>
                <p className={cn(text.caption, 'mt-1')}>
                  {page.brand ? `${page.brand} · ` : ''}지금까지 핫딜 {page.dealCount}건
                  {page.lastDealAt
                    ? ` · 마지막 ${new Date(page.lastDealAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}`
                    : ''}
                </p>
              </div>
            </div>
            {/* h1 다음 첫 문단 = 답. 수치가 UI 토큰으로만 흩어져 있으면 AI 가 인용할 문장이
                없다. 아래 카드와 같은 값을 문장으로 한 번 더 쓴다(JSON-LD description 도 동일). */}
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {leadSentence ?? '커뮤니티 핫딜을 단위가로 모아, 사도 되는 가격을 알려 드려요.'}
            </p>
          </header>

          <DealsAnswerCard
            answer={answer}
            activeDealCount={timing.activeDealCount}
            deal={answerDealRow}
            lastDealHref={
              timing.activeDealCount === 0 && lastDeal ? `/products/${lastDeal.productId}` : null
            }
            evidence={
              // 판정 근거 — 결론이 어느 구성·몇 점의 추이·어떤 비교에서 나왔는지 한 자리에서 보이게.
              timing.isActivePrice ? (
                <ul className="mt-3 flex flex-col gap-1 border-t border-gray-200 pt-2 text-xs text-gray-600">
                  {histPrices.length > 0 && (
                    <li>
                      {timing.bestPackLabel ? `${timing.bestPackLabel} 기준 · ` : ''}핫딜 추이{' '}
                      {timing.historyPoints}
                      {histSpanLabel}치
                      {/* 구성이 여럿이면 추이 최저·최고는 다른 구성 값이 섞인 것(「2L 24개 기준」인데 최고가 500ml) — 뺀다. */}
                      {showHistChart
                        ? ` (최저 ${fmtHist(histMin)} · 최고 ${fmtHist(histMax)})`
                        : ''}
                      {timing.historyPoints < MIN_HISTORY_POINTS
                        ? ' — 추이가 짧아 판정하지 않아요'
                        : ''}
                    </li>
                  )}
                  {/* 다나와가 같거나 더 싸면 위 비교 문장이 이미 말한다(그땐 판정이 «다나와가 더 쌈»). */}
                  {timing.tone !== 'mall' &&
                    timing.mallPrice != null &&
                    timing.totalPrice != null && (
                      <li>
                        다나와 같은 구성 최저가{' '}
                        <span className="font-semibold text-gray-900">{won(timing.mallPrice)}</span>
                        {` — 핫딜이 ${won(timing.mallPrice - timing.totalPrice)} 더 싸요`}
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
              ) : null
            }
            actions={
              (timing.tone === 'mall' && danawa?.danawaUrl) || activeDeals.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {timing.tone === 'mall' && danawa?.danawaUrl && (
                    <a
                      href={danawa.danawaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(text.label, 'underline-offset-2 hover:underline')}
                    >
                      다나와 최저가 보기 →
                    </a>
                  )}
                  {activeDeals.length > 1 && (
                    <a
                      href="#deals-list"
                      className={cn(text.label, 'underline-offset-2 hover:underline')}
                    >
                      진행 중 핫딜 {activeDeals.length}건 모두 보기 →
                    </a>
                  )}
                </div>
              ) : null
            }
          >
            {/* 모델 페이지 → 키워드 알림. 검색으로 온 사람을 북극성(알림 경유 재방문)으로 올리는 자리라 딜 유무와 상관없이
                늘 둔다 — 진행 딜이 없을 땐 이게 답의 끝(다음 핫딜이 오면 알려 준다). */}
            <KeywordHubAlertButton keyword={alertKeyword} placement="model_page" />
          </DealsAnswerCard>

          <RecentDealsSection rows={recentRows} />

          {/* 핫딜 최저가 추이 + 지금 위치 — 구성이 하나일 때만(showHistChart) */}
          {showHistChart && (
            <section className="mb-6">
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">{histTitle}</h2>
                <span className={text.caption}>
                  {histBasis === 'unit' && histUnitLabel
                    ? histUnitLabel
                    : histCurrency === 'USD'
                      ? '직구가($)'
                      : '원화'}
                </span>
              </div>
              <p className={cn(text.caption, 'mb-3')}>
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
                    사기 좋은 가격 {fmtHist(timing.buyLine)} 이하
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
                    title={`사기 좋은 가격 ${fmtHist(timing.buyLine)} 이하`}
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
                                ? 'text-success-700 font-semibold'
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

          {/* 구성별 가격 — 구성마다 지난 핫딜 최저·단위가·다나와 지금을 한 줄로. 「핫딜 X원」만 쓰면 지금 가격으로 읽혀
              (실제론 지난 최저) 「지난 최저」라고 쓴다. 지금 진행 중인 핫딜의 구성엔 그 가격을 붙인다. 2026-10-24 카드 8장 → 표. */}
          {packRows.length >= 2 && (
            <section className="mb-6">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">구성별 가격</h2>
                <span className={text.caption}>
                  {packRows[0].unitLabel ? `${packRows[0].unitLabel} 싼 순` : '싼 순'}
                </span>
              </div>
              <PackRows rows={packRows.slice(0, PACK_ROWS_VISIBLE)} timing={timing} />
              {packRows.length > PACK_ROWS_VISIBLE && (
                <details className="group">
                  <summary
                    className={cn(
                      text.muted,
                      'cursor-pointer list-none py-2 group-open:hidden hover:text-gray-900',
                    )}
                  >
                    {packRows.length - PACK_ROWS_VISIBLE}개 구성 더 보기 ›
                  </summary>
                  <PackRows rows={packRows.slice(PACK_ROWS_VISIBLE)} timing={timing} />
                </details>
              )}
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
            pickProductId={
              timing.tone === 'mall' ? null : (page.priceVerdict?.bestProductId ?? null)
            }
            bundleProductIds={page.priceVerdict?.bundleProductIds ?? []}
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
                <div className={cn(text.caption, 'mt-0.5')}>
                  상시몰 가격 검증
                  {danawa.mallCount ? ` · ${danawa.mallCount}곳` : ''}
                  {danawa.danawaPrice ? ` · ${won(danawa.danawaPrice)}` : ''}
                </div>
              </div>
              <span className={text.muted}>바로가기 →</span>
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

/** 구성별 가격 표에서 펼쳐 둘 줄 수. */
const PACK_ROWS_VISIBLE = 5;

function PackRows({
  rows,
  timing,
}: {
  rows: RankedRepresentative[];
  timing: Pick<TimingInsight, 'isActivePrice' | 'bestPackLabel' | 'totalPrice'>;
}) {
  return (
    <ul className="divide-y divide-gray-100 border-y border-gray-100">
      {rows.map((rep) => {
        const nowHere =
          timing.isActivePrice && timing.totalPrice != null && rep.label === timing.bestPackLabel;
        const danawa = rep.danawaPrice != null && rep.danawaPrice > 0 ? rep.danawaPrice : null;
        const Row = rep.danawaUrl ? 'a' : 'div';
        return (
          <li key={rep.label}>
            <Row
              {...(rep.danawaUrl
                ? { href: rep.danawaUrl, target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="flex items-center gap-3 py-2.5 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={text.label}>{rep.label}</span>
                  {rep.isBestUnit && (
                    <Badge size="xs" tone="success">
                      단위가 최저
                    </Badge>
                  )}
                  {nowHere && (
                    <span className="text-success-700 text-xs font-semibold">
                      지금 핫딜 {won(timing.totalPrice!)}
                    </span>
                  )}
                </p>
                <p className={cn(text.caption, 'mt-0.5')}>
                  {[
                    rep.dealMinPrice != null ? `지난 핫딜 최저 ${won(rep.dealMinPrice)}` : null,
                    rep.unitPrice != null && rep.unitLabel
                      ? `${rep.unitLabel} ${won(rep.unitPrice)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {danawa != null && (
                <span className={cn(text.caption, 'shrink-0 text-right')}>
                  다나와 {won(danawa)}
                  {rep.danawaUrl ? ' ›' : ''}
                </span>
              )}
            </Row>
          </li>
        );
      })}
    </ul>
  );
}
