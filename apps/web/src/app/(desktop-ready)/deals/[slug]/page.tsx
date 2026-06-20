import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

// 에버그린 모델 페이지 (/deals/{slug}) — 상품별 정보 모음. SEO 유입(CTR) 타깃.
// 백엔드 model_page(isPublished=true) precompute payload 를 단일 slug 조회로 SSR.
// 6블록: 히어로(이미지) · 다나와비교 · 제품설명(LLM) · 가격추이 · 핫딜타임라인 · 관련모델.
// ★현재 기존 화면 어디에서도 링크 안 함(미연결) — URL 직접 접속으로만 확인.

interface Deal {
  productId: number;
  title: string;
  price: number | null;
  url: string;
  providerId: number;
  postedAt: string | null;
  thumbnail: string | null;
  posReaction: number;
  commentCount: number;
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

interface ModelPagePayload {
  heroImage?: string | null;
  deals?: Deal[];
  priceSummary?: PriceSummary;
  danawa?: DanawaInfo | null;
  priceHistory?: PriceHistory;
  relatedModels?: RelatedModel[];
}

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
  const { heroImage, deals = [], priceSummary, danawa, priceHistory, relatedModels = [] } = payload;
  const histPoints = priceHistory?.points ?? [];
  const histCurrency = priceHistory?.currency ?? 'KRW';
  const fmtHist = (n: number) =>
    histCurrency === 'USD' ? `$${Math.round(n)}` : `${Math.round(n).toLocaleString()}원`;

  // JSON-LD: verified(danawa_stats) 가격일 때만 Product/offer schema (가짜 가격 페널티 회피)
  const jsonLd =
    priceSummary?.source === 'danawa_stats' && priceSummary.min
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: page.modelName,
          image: heroImage ? [heroImage] : undefined,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'KRW',
            lowPrice: priceSummary.min,
            highPrice: priceSummary.max,
            offerCount: page.dealCount,
          },
        }
      : null;

  // 가격 추이 미니 막대 (의존성 없이 인라인, 높이 비율 div)
  const histMax = histPoints.length ? Math.max(...histPoints.map((p) => p.price)) : 0;

  return (
    // 상단 패딩: 모바일은 fixed GNB(h-14) 보정 pt-14, 데스크톱은 pc:pt-7 (recommend 패턴과 일관).
    // 하단 pb-24 = 모바일 BottomNav 가림 방지. 좌우 px-5.
    <main className="pc:pt-7 mx-auto w-full max-w-screen-md px-5 pt-14 pb-24">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

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
          {priceSummary && priceSummary.source !== 'none' && (
            <p className="mt-2 text-lg font-semibold">
              {won(priceSummary.min)} ~ {won(priceSummary.max)}
              {priceSummary.median != null && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  중간값 {won(priceSummary.median)}
                </span>
              )}
            </p>
          )}
        </div>
      </header>

      {/* 블록2: 다나와 가격비교 (verified 일 때만) */}
      {danawa?.danawaUrl && (
        <a
          href={danawa.danawaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
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

      {/* 블록5: 월별 핫딜 최저가 추이 (통화 라벨 — 직구는 $) */}
      {histPoints.length >= 2 && (
        <section className="mb-6">
          <h2 className="mb-1 text-base font-semibold">월별 핫딜 최저가 추이</h2>
          <p className="mb-3 text-xs text-gray-400">
            {histCurrency === 'USD' ? '직구 가격($) 기준' : '원화 기준'}
          </p>
          <div className="flex items-end gap-1" style={{ height: 88 }}>
            {histPoints.map((p) => (
              <div key={p.month} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-gray-500">{fmtHist(p.price)}</span>
                <div
                  className="w-full rounded-t bg-blue-300"
                  style={{ height: `${histMax ? Math.max((p.price / histMax) * 56, 4) : 4}px` }}
                  title={`${p.month}: ${fmtHist(p.price)}`}
                />
                <span className="text-[10px] text-gray-400">{p.month.slice(2)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 블록4: 핫딜 타임라인 (이미지 + 반응) */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold">핫딜 목록</h2>
        <ul className="flex flex-col gap-2">
          {deals.map((deal) => (
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
                    {deal.postedAt && (
                      <span>{new Date(deal.postedAt).toLocaleDateString('ko-KR')}</span>
                    )}
                    {deal.posReaction > 0 && <span>👍 {deal.posReaction}</span>}
                    {deal.commentCount > 0 && <span>💬 {deal.commentCount}</span>}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  {won(deal.price)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {deals.length === 0 && <p className="text-sm text-gray-400">표시할 핫딜이 없습니다.</p>}
      </section>

      {/* 블록6: 관련 모델 (내부링크) */}
      {relatedModels.length > 0 && (
        <section>
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
    </main>
  );
}
