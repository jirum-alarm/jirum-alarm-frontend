import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';

import DealsListSection from './DealsListSection';
import DealsMobileHeader from './DealsMobileHeader';
import DealsTracking from './DealsTracking';
import {
  buildTimingInsight,
  Deal,
  HeroPrice,
  rankRepresentatives,
  Representative,
  splitDealsForList,
} from './model-page-insights';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await ModelPageService.getModelPage({ slug: decodeURIComponent(slug) });
  if (!page) return { title: '핫딜 모음 | 지름알림' };

  const payload = (page.payload ?? {}) as ModelPagePayload;
  const title = `${page.modelName} 핫딜 최저가 모음 | 지름알림`;
  const description =
    page.metaDescription ??
    `${page.modelName} 역대 핫딜 ${page.dealCount}건. 지름알림에서 가격 모아보기.`;
  const url = `${METADATA_SERVICE_URL}/deals/${page.slug}`;
  const image = payload.heroImage ?? `${METADATA_SERVICE_URL}/opengraph-image.webp`;

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
  const fmtHist = (n: number) => {
    if (histBasis === 'unit') {
      return `${Math.round(n).toLocaleString()}원`;
    }
    return histCurrency === 'USD' ? `$${Math.round(n)}` : `${Math.round(n).toLocaleString()}원`;
  };

  const offerPrice = heroPrice?.minPrice ?? null;
  const productLd =
    offerPrice != null
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: page.modelName,
          brand: page.brand ? { '@type': 'Brand', name: page.brand } : undefined,
          url: `${METADATA_SERVICE_URL}/deals/${page.slug}`,
          image: heroImage ? [heroImage] : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KRW',
            price: Math.round(offerPrice),
            availability: 'https://schema.org/InStock',
            url: `${METADATA_SERVICE_URL}/deals/${page.slug}`,
            priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          },
        }
      : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: METADATA_SERVICE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: '핫딜 최저가 모음',
        item: `${METADATA_SERVICE_URL}/deals`,
      },
      { '@type': 'ListItem', position: 3, name: page.modelName },
    ],
  };
  const jsonLd = productLd ? [productLd, breadcrumbLd] : [breadcrumbLd];

  const histPrices = histPoints.map((p) => p.price);
  const histMax = histPrices.length ? Math.max(...histPrices) : 0;
  const histMin = histPrices.length ? Math.min(...histPrices) : 0;
  const histBarH = (price: number) => {
    if (histMax === histMin) return 40;
    return 20 + ((price - histMin) / (histMax - histMin)) * 52;
  };

  const timing = buildTimingInsight({
    deals,
    histPrices,
    histBasis,
    histUnitLabel,
    heroPrice,
  });
  const { active: activeDeals, history: historyDeals } = splitDealsForList(
    deals,
    histBasis,
    histUnitLabel,
  );
  const rankedReps = rankRepresentatives(representatives);
  const bestRep = rankedReps.find((r) => r.isBestUnit);

  const timingToneClass =
    timing.tone === 'good'
      ? 'bg-emerald-50 text-emerald-700'
      : timing.tone === 'high'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-gray-100 text-gray-600';

  const listTitleSuffix =
    histBasis === 'unit' && histUnitLabel ? `${histUnitLabel} 싼 순` : '싼 순';

  // 추이 막대에 "지금" 표시 — 현재가가 어느 막대에 가장 가까운지(없으면 라인만 설명).
  const nowPrice = timing.current > 0 ? timing.current : null;

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
      <DealsMobileHeader title={page.modelName} />

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
                  alt={page.modelName}
                  fill
                  sizes="160px"
                  priority
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{page.modelName}, 지금 사도 될까?</h1>
              <p className="mt-1 text-sm text-gray-500">
                커뮤니티 핫딜을 단위가로 모아, 사도 되는 가격을 알려드립니다.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {page.brand ? `${page.brand} · ` : ''}최근 핫딜 {page.dealCount}건
                {page.lastDealAt
                  ? ` · 마지막 ${new Date(page.lastDealAt).toLocaleDateString('ko-KR')}`
                  : ''}
              </p>

              {(timing.current > 0 || heroPrice?.minPrice != null) && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {timing.tone !== 'unknown' && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${timingToneClass}`}
                      >
                        {timing.label}
                      </span>
                    )}
                    {timing.activeDealCount > 0 && (
                      <span className="text-[11px] text-gray-400">
                        진행 중 {timing.activeDealCount}건 기준
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] text-gray-400">
                        지금 진행 최저
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
                      {heroPrice?.label && (
                        <p className="text-xs text-gray-500">
                          {heroPrice.label}
                          {heroPrice.minPrice != null ? ` · 총액 ${won(heroPrice.minPrice)}` : ''}
                        </p>
                      )}
                    </div>
                    {timing.avg != null && (
                      <div>
                        <p className="text-[11px] text-gray-400">추이 평균 대비</p>
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
                        <p className="text-[11px] text-gray-400">이하면 사도 됨</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {fmtHist(timing.buyLine)}
                        </p>
                        <p className="text-xs text-gray-500">추이 하위 구간 기준</p>
                      </div>
                    )}
                  </div>

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
            </div>
          </header>

          {/* 용량·수량 — 추천 팩 */}
          {rankedReps.length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">용량·수량별 대표 상품</h2>
                {bestRep && (
                  <span className="text-xs text-gray-400">
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
                        rep.isBestUnit ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium">{rep.label}</span>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          {rep.isBestUnit && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              단위가 최저
                            </span>
                          )}
                          {(rep.activeDeals > 0 || rep.dealMinPrice != null) && (
                            <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                              핫딜
                            </span>
                          )}
                          {rep.priceRank && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              다나와 {rep.priceRank}
                            </span>
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
                      <span className="text-xs text-gray-400">
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
                <span className="text-xs text-gray-400">
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
                추이 최저 <span className="text-error-500 font-semibold">{fmtHist(histMin)}</span>
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
                    const isHigh = p.price === histMax;
                    const isNearNow =
                      nowPrice != null && Math.abs(p.price - nowPrice) / (histMax || 1) < 0.02;
                    const showLabel = i % 2 === 0 || i === histPoints.length - 1;
                    return (
                      <div
                        key={p.month}
                        className="flex flex-1 flex-col items-center justify-end gap-1"
                      >
                        {(isLow || isHigh || isNearNow) && (
                          <span
                            className={`text-[9px] whitespace-nowrap ${
                              isNearNow
                                ? 'font-semibold text-emerald-600'
                                : isLow
                                  ? 'text-error-500 font-semibold'
                                  : 'text-gray-400'
                            }`}
                          >
                            {isNearNow ? `지금 ${fmtHist(p.price)}` : fmtHist(p.price)}
                          </span>
                        )}
                        <div
                          className={`w-full rounded-t ${
                            isNearNow
                              ? 'bg-emerald-500'
                              : isLow
                                ? 'bg-error-400'
                                : 'bg-secondary-300'
                          }`}
                          style={{ height: `${histBarH(p.price)}px` }}
                          title={`${p.month}: ${fmtHist(p.price)}`}
                        />
                        <span className="h-3 text-[9px] text-gray-400">
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
              <span className="text-sm text-gray-400">바로가기 →</span>
            </a>
          )}

          {relatedModels.length > 0 && (
            <section className="rounded-lg border border-gray-100 p-4">
              <h2 className="mb-3 text-base font-semibold">{page.brand} 다른 모델</h2>
              <div className="flex flex-wrap gap-2">
                {relatedModels.map((m) => (
                  <a
                    key={m.slug}
                    href={`/deals/${m.slug}`}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    {m.modelName} <span className="text-gray-400">({m.dealCount})</span>
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
