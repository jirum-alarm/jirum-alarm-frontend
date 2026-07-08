import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

import DealsMobileHeader from './DealsMobileHeader';
import DealsTracking from './DealsTracking';

// 에버그린 모델 페이지 (/deals/{slug}) — 상품별 정보 모음. SEO 유입(CTR) 타깃.
// 백엔드 model_page(isPublished=true) precompute payload 를 단일 slug 조회로 SSR.
// 블록: 히어로 · 용량/수량별 대표상품(단위가격·다나와링크) · 다나와비교 · 가격추이 · 핫딜목록(싼순) · 관련모델.
// ★현재 기존 화면 어디에서도 링크 안 함(미연결) — URL 직접 접속으로만 확인.

interface Deal {
  productId: number;
  title: string;
  price: number | null;
  url: string;
  providerId: number;
  mallName: string | null; // 출처(쇼핑몰명)
  postedAt: string | null;
  thumbnail: string | null;
}

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
  points: PricePoint[];
}

interface RelatedModel {
  slug: string;
  modelName: string;
  dealCount: number;
}

interface Representative {
  label: string; // "120g 40개" 등 수량/용량
  danawaPrice: number | null;
  mallCount: number | null;
  priceRank: string | null; // "1위" 등 다나와 랭킹
  danawaUrl: string | null;
  activeDeals: number;
  dealMinPrice: number | null;
  unitPrice: number | null; // 개당 가격
  unitLabel: string | null; // "개당"
}

interface HeroPrice {
  minPrice: number | null; // 신뢰 가능한 핫딜 최저가(단위 명확)
  label: string; // "210ml 30개" 등 그 가격의 수량
  unitPrice: number | null;
  unitLabel: string | null; // "100ml당" 등
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

// ISR — 발행 페이지를 10분 캐시(목록과 동일). http-client public 모드(cookies 미read)와 함께라야
// 실제로 정적/ISR 렌더됨. revalidate 만으론 부족(cookies()가 동적 렌더 옵트아웃의 진범이었음).
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
  const url = `${METADATA_SERVICE_URL}/deals/${slug}`;
  const image = payload.heroImage ?? `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [{ url: image }] },
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
    priceSummary,
    danawa,
    priceHistory,
    relatedModels = [],
  } = payload;
  const histPoints = priceHistory?.points ?? [];
  const histCurrency = priceHistory?.currency ?? 'KRW';
  const fmtHist = (n: number) =>
    histCurrency === 'USD' ? `$${Math.round(n)}` : `${Math.round(n).toLocaleString()}원`;

  // JSON-LD: verified(danawa_stats) 가격일 때만 Product/offer schema (가짜 가격 페널티 회피).
  // brand/url/priceValidUntil 보강(2026-07-08): AI 검색 인용은 구조화 완성도에 좌우 —
  // 인용 페이지의 65~71%가 스키마 보유, Product 필드 완결성이 상품 질의 노출 조건.
  const jsonLd =
    priceSummary?.source === 'danawa_stats' && priceSummary.min
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: page.modelName,
          brand: page.brand ? { '@type': 'Brand', name: page.brand } : undefined,
          url: `${METADATA_SERVICE_URL}/deals/${page.slug}`,
          image: heroImage ? [heroImage] : undefined,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'KRW',
            lowPrice: priceSummary.min,
            highPrice: priceSummary.max,
            offerCount: page.dealCount,
            // 핫딜 가격의 유효기한 — ISR(10분) 재렌더마다 +7일로 갱신되는 롤링 윈도우.
            priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          },
        }
      : null;

  // 가격 추이 — min~max 범위로 정규화해 차이를 도드라지게(절대0 기준이면 평탄해짐).
  const histPrices = histPoints.map((p) => p.price);
  const histMax = histPrices.length ? Math.max(...histPrices) : 0;
  const histMin = histPrices.length ? Math.min(...histPrices) : 0;
  // 막대 높이: 최저=20%, 최고=100% 사이로 스케일(범위 좁아도 차이 보이게). 단일값이면 전부 중간.
  const histBarH = (price: number) => {
    if (histMax === histMin) return 40;
    return 20 + ((price - histMin) / (histMax - histMin)) * 52; // 20~72px
  };

  return (
    // ★폭: 모바일 600px 중앙(세로 흐름) → PC layout-max(1280) 2단(좌 본문 / 우 sticky 요약).
    //   PC 상품상세(grid-cols-12, 좌 본문·우 sticky 구매정보) 패턴 차용. 모바일은 pc: 무영향.
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-20 pb-24">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* 판별 스프린트 계측 — 랜딩 cohort(referrer) + outbound/deal 클릭 (GTM dataLayer) */}
      <DealsTracking slug={page.slug} />

      {/* 모바일 전용 상단 헤더(데스크톱은 GNB라 pc:hidden). pt-20이 이 fixed 헤더 높이 보정. */}
      <DealsMobileHeader title={page.modelName} />

      {/* PC 2단 grid: 좌(본문 2/3)·우(sticky 요약 1/3). 모바일은 단일 컬럼 세로 흐름. */}
      <div className="pc:grid pc:grid-cols-3 pc:items-start pc:gap-x-10">
        {/* === 좌측 본문 (PC 2/3) === */}
        <div className="pc:col-span-2">
          {/* 블록1: 히어로 (대표 이미지 + 모델명 + 최저가) */}
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {heroImage && (
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={heroImage}
                  alt={page.modelName}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold">{page.modelName} 핫딜 최저가 모음</h1>
              <p className="mt-1 text-sm text-gray-500">
                {page.brand ? `${page.brand} · ` : ''}최근 핫딜 {page.dealCount}건
                {page.lastDealAt
                  ? ` · 마지막 ${new Date(page.lastDealAt).toLocaleDateString('ko-KR')}`
                  : ''}
              </p>
              {/* 핫딜 최저가 — 단위 명확하게(수량 + 단위가격). 단위 불명한 brand_item 통계 대신 heroPrice. */}
              {heroPrice?.minPrice != null && (
                <div className="mt-2">
                  <p className="text-lg font-semibold text-rose-500">
                    핫딜 최저 {won(heroPrice.minPrice)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {heroPrice.label}
                    {heroPrice.unitPrice != null && heroPrice.unitLabel
                      ? ` · ${heroPrice.unitLabel} ${won(heroPrice.unitPrice)}`
                      : ''}
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* 블록0: 용량/수량별 대표 상품 맵 (다나와 판매처수 순, 핫딜 있는 수량만) */}
          {representatives.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-3 text-base font-semibold">용량·수량별 대표 상품</h2>
              <div className="grid grid-cols-2 gap-2">
                {representatives.map((rep, i) => {
                  // 다나와 링크 있으면 클릭 가능한 a, 없으면 div
                  const Card = rep.danawaUrl ? 'a' : 'div';
                  return (
                    <Card
                      key={i}
                      {...(rep.danawaUrl
                        ? { href: rep.danawaUrl, target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium">{rep.label}</span>
                        {rep.priceRank && (
                          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            다나와 {rep.priceRank}
                          </span>
                        )}
                      </div>
                      {rep.dealMinPrice != null && (
                        <span className="text-sm font-semibold text-rose-500">
                          핫딜 {won(rep.dealMinPrice)}
                        </span>
                      )}
                      {rep.unitPrice != null && (
                        <span className="text-xs text-gray-500">
                          {rep.unitLabel} {won(rep.unitPrice)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {rep.danawaPrice != null ? `다나와 ${won(rep.danawaPrice)}` : ''}
                        {rep.mallCount ? ` · ${rep.mallCount}곳` : ''}
                        {rep.danawaUrl ? ' ›' : ''}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* 블록5: 월별 핫딜 최저가 추이 — min~max 정규화 + 최저가 강조 */}
          {histPoints.length >= 2 && (
            <section className="mb-6">
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">월별 핫딜 최저가 추이</h2>
                <span className="text-xs text-gray-400">
                  {histCurrency === 'USD' ? '직구가($)' : '원화'}
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                역대 최저 <span className="font-semibold text-rose-500">{fmtHist(histMin)}</span>
                <span className="text-gray-300"> · </span>
                최고 {fmtHist(histMax)}
              </p>
              {/* 막대 위 가격 라벨은 최저/최고만(겹침 방지, 나머지는 hover title). 월 라벨은 격월. */}
              <div className="flex items-end gap-1" style={{ height: 96 }}>
                {histPoints.map((p, i) => {
                  const isLow = p.price === histMin;
                  const isHigh = p.price === histMax;
                  const showMonth = i % 2 === 0 || i === histPoints.length - 1;
                  return (
                    <div
                      key={p.month}
                      className="flex flex-1 flex-col items-center justify-end gap-1"
                    >
                      {(isLow || isHigh) && (
                        <span
                          className={`text-[9px] whitespace-nowrap ${isLow ? 'font-semibold text-rose-500' : 'text-gray-400'}`}
                        >
                          {fmtHist(p.price)}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t ${isLow ? 'bg-rose-400' : 'bg-blue-300'}`}
                        style={{ height: `${histBarH(p.price)}px` }}
                        title={`${p.month}: ${fmtHist(p.price)}`}
                      />
                      <span className="h-3 text-[9px] text-gray-400">
                        {showMonth ? p.month.slice(2) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 블록4: 핫딜 목록 (싼 순). 역대 최저가 배지 + 출처 */}
          <section className="mb-6">
            <h2 className="mb-3 text-base font-semibold">핫딜 목록 (싼 순)</h2>
            <ul className="flex flex-col gap-2">
              {deals.map((deal) => {
                // 역대 최저: 이 딜 가격이 가격추이 최저값 이하 (histMin>0 일 때만)
                const isAllTimeLow = histMin > 0 && deal.price != null && deal.price <= histMin;
                return (
                  <li key={deal.productId}>
                    <a
                      href={`/products/${deal.productId}`}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                    >
                      {deal.thumbnail && (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-50">
                          <Image
                            src={deal.thumbnail}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm">{deal.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          {deal.mallName && <span className="text-gray-500">{deal.mallName}</span>}
                          {deal.postedAt && (
                            <span>{new Date(deal.postedAt).toLocaleDateString('ko-KR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {isAllTimeLow && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                            역대 최저
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-700">{won(deal.price)}</span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
            {deals.length === 0 && <p className="text-sm text-gray-400">표시할 핫딜이 없습니다.</p>}
          </section>
        </div>
        {/* === /좌측 본문 === */}

        {/* === 우측 요약 (PC 1/3, sticky). 모바일은 본문 아래 세로로 이어짐 === */}
        <aside className="pc:sticky pc:top-24 pc:col-span-1 flex flex-col gap-4">
          {/* 블록2: 다나와 가격비교 (verified 일 때만) */}
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
                  {danawa.mallCount ? `${danawa.mallCount}개 쇼핑몰` : ''}
                  {danawa.danawaPrice ? ` · ${won(danawa.danawaPrice)}` : ''}
                </div>
              </div>
              <span className="text-sm text-gray-400">바로가기 →</span>
            </a>
          )}

          {/* 블록6: 관련 모델 (내부링크) */}
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
        {/* === /우측 요약 === */}
      </div>
    </main>
  );
}
