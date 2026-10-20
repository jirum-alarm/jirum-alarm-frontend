'use client';

import { cardThumb } from '@jirum/design-system/recipes';
import {
  formatPriceDiff,
  liveAlternativeKindLabel,
  summarizeLiveAlternatives,
} from '@jirum/domain/live-alternatives';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductInfoFragment } from '@/shared/api/gql/graphql';
import type { LiveAlternativeDeal } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import { ProductQueries } from '@/entities/product';
import { productCardTracking } from '@/entities/product-list/model/card-tracking';
import { useProductCardTracker } from '@/entities/product-list/model/useProductCardTracker';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

import { isLiveAlternativeTarget, LIVE_ALTERNATIVE_LIMIT } from '../lib/live-alternatives';

/**
 * 막 올라온 딜 상세의 「다른 곳 진행 중인 딜」 — 같은 상품을 다른 값에 파는 딜, 용량·구성이 다른 같은 라인 딜.
 * 상세 아래 캐러셀(함께 본·카테고리 인기)은 거의 눌리지 않았고 같은 자리의 종료 딜 블록은 몇 배 더 눌렸다
 * (서버 노출 기록). 그래서 이 상품과 이어진 것만, 종료 딜 블록 자리(가격 이력 위)에 둔다.
 * 실험 등록부 obs_detail_live_alternatives.
 */
export default function LiveAlternativeDeals({
  product,
  className,
}: {
  product: ProductInfoFragment;
  className?: string;
}) {
  if (!isLiveAlternativeTarget(product)) return null;
  return (
    <Suspense>
      <LiveAlternativeDealList product={product} className={className} />
    </Suspense>
  );
}

function LiveAlternativeDealList({
  product,
  className,
}: {
  product: ProductInfoFragment;
  className?: string;
}) {
  const { data } = useSuspenseQuery(
    ProductQueries.liveAlternativeDeals({ id: Number(product.id), limit: LIVE_ALTERNATIVE_LIMIT }),
  );
  const { recordImpression, recordClick } = useProductCardTracker('live_alternative');
  const deals = data.liveAlternativeDeals;
  if (deals.length === 0) return null;

  const summary = summarizeLiveAlternatives(deals);

  return (
    <section className={className} aria-label="다른 곳 진행 중인 딜">
      <DetailSectionHeader title={summary.title} subtitle={summary.subtitle} className="mb-3" />
      <ul className="flex flex-col gap-3">
        {deals.map((deal, position) => (
          <LiveAlternativeRow
            key={deal.product.id}
            deal={deal}
            position={position}
            recordImpression={recordImpression}
            recordClick={recordClick}
          />
        ))}
      </ul>
    </section>
  );
}

function LiveAlternativeRow({
  deal,
  position,
  recordImpression,
  recordClick,
}: {
  deal: LiveAlternativeDeal;
  position: number;
  recordImpression: (productId: number, position: number) => void;
  recordClick: (productId: number, position: number) => void;
}) {
  const { product } = deal;
  const productId = Number(product.id);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (inView && Number.isFinite(productId)) recordImpression(productId, position);
  }, [inView, productId, position, recordImpression]);

  const diff = formatPriceDiff(deal.priceDiff);
  const where = product.mallName || product.provider?.nameKr;

  return (
    <li>
      <Link
        href={PAGE.DETAIL + '/' + product.id}
        prefetch={false}
        ref={ref}
        onClick={() => {
          if (Number.isFinite(productId)) recordClick(productId, position);
        }}
        className="flex items-center gap-3"
        {...productCardTracking('live_alternative', product.id)}
      >
        <div className={cn('relative h-16 w-16 shrink-0', cardThumb)}>
          <ProductThumbnail
            src={product.thumbnail ?? ''}
            title={product.title}
            categoryId={product.categoryId}
            type="product"
            alt={product.title}
            sizes="64px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="line-clamp-1 text-sm break-all text-gray-700">{product.title}</span>
          <div className="flex items-baseline gap-2">
            <DisplayListPrice price={product.price} className="text-base" />
            {diff ? (
              <span
                className={cn(
                  'shrink-0 text-xs font-semibold',
                  diff.cheaper ? 'text-error-600' : 'text-gray-500',
                )}
              >
                {diff.text}
              </span>
            ) : null}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span>{liveAlternativeKindLabel(deal.kind)}</span>
            {where ? (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{where}</span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <DisplayTime time={product.postedAt} />
          </span>
        </div>
      </Link>
    </li>
  );
}
