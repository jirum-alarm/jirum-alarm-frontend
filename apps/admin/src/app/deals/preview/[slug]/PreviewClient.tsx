'use client';

import dayjs from 'dayjs';
import Image from 'next/image';

import { QueryModelPagePreviewByAdmin } from '@/graphql/modelPage';
import {
  useGetModelPagePreviewByAdmin,
  useSetModelPagePublishedByAdmin,
} from '@/hooks/graphql/modelPage';

// 운영 /deals/{slug} 페이지의 payload 구조(읽기 전용 미러). 발행하면 이렇게 보인다.
interface Deal {
  productId: number;
  title: string;
  price: number | null;
  mallName: string | null;
  postedAt: string | null;
  thumbnail: string | null;
}
interface Representative {
  label: string;
  danawaPrice: number | null;
  mallCount: number | null;
  priceRank: string | null;
  dealMinPrice: number | null;
  unitPrice: number | null;
  unitLabel: string | null;
}
interface HeroPrice {
  minPrice: number | null;
  label: string;
  unitPrice: number | null;
  unitLabel: string | null;
}
interface PricePoint {
  month: string;
  price: number;
}
interface Payload {
  heroImage?: string | null;
  heroPrice?: HeroPrice | null;
  representatives?: Representative[];
  deals?: Deal[];
  priceHistory?: { currency: 'KRW' | 'USD'; points: PricePoint[] };
  danawa?: {
    danawaPrice: number | null;
    mallCount: number | null;
    danawaUrl: string | null;
  } | null;
}

const won = (n?: number | null) => (n == null ? '-' : `${Math.round(n).toLocaleString()}원`);

const PreviewClient = ({ slug }: { slug: string }) => {
  const { data, loading } = useGetModelPagePreviewByAdmin({ slug });
  const [setPublished, { loading: mutating }] = useSetModelPagePublishedByAdmin({
    // 미리보기 쿼리를 다시 받아 상태 배지·버튼 갱신.
    refetchQueries: [{ query: QueryModelPagePreviewByAdmin, variables: { slug } }],
  });

  if (loading) return <div className="py-20 text-center text-bodydark2">불러오는 중…</div>;
  const page = data?.modelPagePreviewByAdmin;
  if (!page)
    return <div className="py-20 text-center text-bodydark2">페이지를 찾을 수 없습니다.</div>;

  const payload = (page.payload ?? {}) as Payload;
  const { heroImage, heroPrice, representatives = [], deals = [], priceHistory, danawa } = payload;
  const histPoints = priceHistory?.points ?? [];
  const histCur = priceHistory?.currency ?? 'KRW';
  const fmtHist = (n: number) =>
    histCur === 'USD' ? `$${Math.round(n)}` : `${Math.round(n).toLocaleString()}원`;
  const histPrices = histPoints.map((p) => p.price);
  const histMin = histPrices.length ? Math.min(...histPrices) : 0;
  const histMax = histPrices.length ? Math.max(...histPrices) : 0;

  const isPublished = !!page.isPublished;
  const handlePublish = () => {
    if (page.id == null) return;
    const next = !isPublished;
    if (!confirm(`"${page.modelName}" 페이지를 ${next ? '발행' : '발행 취소'}하시겠습니까?`))
      return;
    setPublished({ variables: { id: page.id, isPublished: next } });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 발행 액션 바 */}
      <div className="flex items-center justify-between rounded-md border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 text-sm">
          {isPublished ? (
            <span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 font-medium text-success">
              발행됨
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 font-medium text-warning">
              초안 — 운영 사이트에선 아직 안 보임
            </span>
          )}
          <span className="text-bodydark2">발행 시 사용자에게 보일 모습입니다.</span>
        </div>
        <button
          disabled={mutating}
          onClick={handlePublish}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
            isPublished ? 'bg-meta-1' : 'bg-primary'
          }`}
        >
          {isPublished ? '발행 취소' : '발행하기'}
        </button>
      </div>

      {/* 히어로 */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {heroImage && (
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-2">
            <Image
              src={heroImage}
              alt={page.modelName}
              fill
              sizes="160px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-black dark:text-white">
            {page.modelName} 핫딜 최저가 모음
          </h1>
          <p className="mt-1 text-sm text-bodydark2">
            {page.brand ? `${page.brand} · ` : ''}최근 핫딜 {page.dealCount}건
            {page.lastDealAt ? ` · 마지막 ${dayjs(page.lastDealAt).format('YYYY/MM/DD')}` : ''}
          </p>
          {heroPrice?.minPrice != null && (
            <div className="mt-2">
              <p className="text-lg font-semibold text-meta-1">
                핫딜 최저 {won(heroPrice.minPrice)}
              </p>
              <p className="mt-0.5 text-sm text-bodydark2">
                {heroPrice.label}
                {heroPrice.unitPrice != null && heroPrice.unitLabel
                  ? ` · ${heroPrice.unitLabel} ${won(heroPrice.unitPrice)}`
                  : ''}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* 대표 상품 */}
      {representatives.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-black dark:text-white">
            용량·수량별 대표 상품
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {representatives.map((rep, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-stroke p-3 dark:border-strokedark"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium text-black dark:text-white">
                    {rep.label}
                  </span>
                  {rep.priceRank && (
                    <span className="shrink-0 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                      다나와 {rep.priceRank}
                    </span>
                  )}
                </div>
                {rep.dealMinPrice != null && (
                  <span className="text-sm font-semibold text-meta-1">
                    핫딜 {won(rep.dealMinPrice)}
                  </span>
                )}
                {rep.unitPrice != null && (
                  <span className="text-xs text-bodydark2">
                    {rep.unitLabel} {won(rep.unitPrice)}
                  </span>
                )}
                <span className="text-xs text-bodydark2">
                  {rep.danawaPrice != null ? `다나와 ${won(rep.danawaPrice)}` : ''}
                  {rep.mallCount ? ` · ${rep.mallCount}곳` : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 가격 추이 */}
      {histPoints.length >= 2 && (
        <section>
          <h2 className="mb-1 text-base font-semibold text-black dark:text-white">
            월별 핫딜 최저가 추이
          </h2>
          <p className="mb-3 text-xs text-bodydark2">
            역대 최저 <span className="font-semibold text-meta-1">{fmtHist(histMin)}</span> · 최고{' '}
            {fmtHist(histMax)}
          </p>
          <div className="flex items-end gap-1" style={{ height: 96 }}>
            {histPoints.map((p) => {
              const h =
                histMax === histMin ? 40 : 20 + ((p.price - histMin) / (histMax - histMin)) * 52;
              const isLow = p.price === histMin;
              return (
                <div
                  key={p.month}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                  title={`${p.month}: ${fmtHist(p.price)}`}
                >
                  <div
                    className={`w-full rounded-t ${isLow ? 'bg-meta-1' : 'bg-primary/40'}`}
                    style={{ height: `${h}px` }}
                  />
                  <span className="h-3 text-[9px] text-bodydark2">{p.month.slice(2)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 다나와 */}
      {danawa?.danawaUrl && (
        <a
          href={danawa.danawaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-strokedark"
        >
          <span className="text-sm font-medium text-black dark:text-white">
            다나와 최저가 비교 {danawa.mallCount ? `· ${danawa.mallCount}곳` : ''}{' '}
            {danawa.danawaPrice ? `· ${won(danawa.danawaPrice)}` : ''}
          </span>
          <span className="text-sm text-bodydark2">바로가기 →</span>
        </a>
      )}

      {/* 핫딜 목록 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-black dark:text-white">
          핫딜 목록 (싼 순)
        </h2>
        <ul className="flex flex-col gap-2">
          {deals.map((deal) => (
            <li
              key={deal.productId}
              className="flex items-center gap-3 rounded-lg border border-stroke p-3 dark:border-strokedark"
            >
              {deal.thumbnail && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-2">
                  <Image
                    src={deal.thumbnail}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm text-black dark:text-white">{deal.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-bodydark2">
                  {deal.mallName && <span>{deal.mallName}</span>}
                  {deal.postedAt && <span>{dayjs(deal.postedAt).format('YYYY/MM/DD')}</span>}
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-black dark:text-white">
                {won(deal.price)}
              </span>
            </li>
          ))}
        </ul>
        {deals.length === 0 && <p className="text-sm text-bodydark2">표시할 핫딜이 없습니다.</p>}
      </section>
    </div>
  );
};

export default PreviewClient;
