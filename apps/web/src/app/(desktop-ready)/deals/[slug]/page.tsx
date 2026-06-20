import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ModelPageService } from '@/shared/api/model-page';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

// 에버그린 모델 페이지 (/deals/{slug}). SEO 유입(CTR) 타깃.
// 백엔드 model_page(isPublished=true)를 단일 slug 조회로 SSR.
// ★현재 기존 화면 어디에서도 링크하지 않음(미연결) — URL 직접 접속으로만 확인 가능.

interface Deal {
  productId: number;
  title: string;
  price: number | null;
  url: string;
  providerId: number;
  postedAt: string | null;
}

interface PriceSummary {
  source: 'danawa_stats' | 'parsed_price' | 'none';
  min?: number;
  max?: number;
  median?: number;
  q1?: number;
  q3?: number;
}

interface ModelPagePayload {
  deals?: Deal[];
  priceSummary?: PriceSummary;
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

  const title = `${page.modelName} 핫딜 최저가 모음 | 지름알림`;
  const description =
    page.metaDescription ??
    `${page.modelName} 역대 핫딜 ${page.dealCount}건. 지름알림에서 가격 모아보기.`;
  const url = `${METADATA_SERVICE_URL}/deals/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
  };
}

export default async function ModelDealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await ModelPageService.getModelPage({ slug: decodeURIComponent(slug) });
  if (!page) notFound();

  const payload = (page.payload ?? {}) as ModelPagePayload;
  const deals = payload.deals ?? [];
  const price = payload.priceSummary;

  // JSON-LD: verified(danawa_stats) 가격일 때만 Product/offer schema (가짜 가격 페널티 회피)
  const jsonLd =
    price?.source === 'danawa_stats' && price.min
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: page.modelName,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'KRW',
            lowPrice: price.min,
            highPrice: price.max,
            offerCount: page.dealCount,
          },
        }
      : null;

  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <header className="mb-4">
        <h1 className="text-xl font-bold">{page.modelName} 핫딜 최저가 모음</h1>
        <p className="mt-1 text-sm text-gray-500">
          {page.brand ? `${page.brand} · ` : ''}최근 핫딜 {page.dealCount}건
          {page.lastDealAt
            ? ` · 마지막 ${new Date(page.lastDealAt).toLocaleDateString('ko-KR')}`
            : ''}
        </p>
      </header>

      {price && price.source !== 'none' && (
        <section className="mb-6 rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">가격대</div>
          <div className="mt-1 text-lg font-semibold">
            {won(price.min)} ~ {won(price.max)}
          </div>
          {price.median != null && (
            <div className="mt-0.5 text-sm text-gray-500">중간값 {won(price.median)}</div>
          )}
          {price.source === 'danawa_stats' && (
            <div className="mt-1 text-xs text-gray-400">다나와 가격비교 기준</div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">핫딜 목록</h2>
        <ul className="flex flex-col gap-2">
          {deals.map((deal) => (
            <li key={deal.productId}>
              <a
                href={`/products/${deal.productId}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <span className="line-clamp-2 text-sm">{deal.title}</span>
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  {won(deal.price)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {deals.length === 0 && <p className="text-sm text-gray-400">표시할 핫딜이 없습니다.</p>}
      </section>
    </main>
  );
}
