'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';
import { getFromNow } from '@/shared/lib/utils/date';
import { ArrowRight, Info, Thumbsdown, Thumbsup } from '@/shared/ui/common/icons';
import Tooltip from '@/shared/ui/common/Tooltip';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ProductQueries } from '@/entities/product';

import ProductReport from '@/features/product-actions/ui/ProductReport';
import {
  buildDealStatusSummary,
  splitReactionKeywords,
} from '@/features/product-detail/lib/deal-status-reaction';
import { Reactions } from '@/features/product-reaction/ui/Reactions';

type ReactionItem = {
  name: string;
  tag: string;
  count: number;
  type: 'POSITIVE' | 'NEGATIVE' | 'SYNONYM' | string;
  role?: string | null;
};

function CommunityLink({ url, provider }: { url: string; provider: string }) {
  return (
    <motion.a
      className="text-secondary-500 flex items-center gap-x-1 text-xs font-semibold"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <span>{provider} 반응 보기</span>
      <span className="bg-secondary-500 flex size-4 items-center justify-center rounded-full">
        <ArrowRight color="#FFFFFF" width={12} height={12} strokeWidth={1.5} />
      </span>
    </motion.a>
  );
}

function KeywordChip({ item }: { item: ReactionItem }) {
  return (
    <li
      className={cn('flex gap-x-1 rounded-[40px] border bg-white px-3 py-1.5', {
        'border-secondary-300': item.type === 'POSITIVE',
        'border-error-200': item.type === 'NEGATIVE',
        'border-gray-300': item.type !== 'POSITIVE' && item.type !== 'NEGATIVE',
      })}
    >
      {item.tag ? <span className="text-xs font-medium text-gray-500">{item.tag}</span> : null}
      <span className="text-xs font-medium text-gray-900">{item.name}</span>
      <span
        className={cn('text-xs font-semibold', {
          'text-secondary-700': item.type === 'POSITIVE',
          'text-error-400': item.type === 'NEGATIVE',
          'text-gray-500': item.type !== 'POSITIVE' && item.type !== 'NEGATIVE',
        })}
      >
        {item.count}
      </span>
    </li>
  );
}

function KeywordRow({
  label,
  labelClassName,
  items,
}: {
  label: string;
  labelClassName: string;
  items: ReactionItem[];
}) {
  if (!items.length) return null;

  return (
    <div className="flex items-start gap-2">
      <span className={cn('mt-1.5 w-8 shrink-0 text-xs font-semibold', labelClassName)}>
        {label}
      </span>
      <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
        {items.map((item) => (
          <KeywordChip key={`${item.type}-${item.name}`} item={item} />
        ))}
      </ul>
    </div>
  );
}

/**
 * 커뮤니티 반응 — 품질 반응만 (품절·종료·가격변동 등 상태 신호 제외).
 */
export default function CommunityReaction({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );
  const { data: reactionKeywordsData } = useSuspenseQuery(
    ProductQueries.reactionKeywords({ id: productId }),
  );

  const { items, lastUpdatedAt: lastUpdatedAtString } =
    reactionKeywordsData.categorizedReactionKeywords;
  const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  const { quality, status } = splitReactionKeywords(items);
  const positiveItems = quality.filter((item) => item.type === 'POSITIVE');
  const negativeItems = quality.filter((item) => item.type === 'NEGATIVE');
  const statusSummary = buildDealStatusSummary(status);

  // QUALITY 칩 기준 % (서버 pos/neg도 DEAL_STATUS 제외와 동일 정책)
  const positiveCount = positiveItems.reduce((sum, item) => sum + item.count, 0);
  const negativeCount = negativeItems.reduce((sum, item) => sum + item.count, 0);
  const allCount = positiveCount + negativeCount;
  const positivePercent = allCount === 0 ? 0 : Math.round((positiveCount / allCount) * 100);
  const isPositive = positivePercent >= 50;
  const dominantPercent = isPositive ? positivePercent : 100 - positivePercent;

  const commentSummary = product.commentSummary;

  return (
    <section>
      <SectionHeader
        shouldShowMobileUI={true}
        titleClassName="pc:text-[20px]"
        title="커뮤니티 반응"
        right={
          <Tooltip
            align="right"
            polygonOffset={8}
            content={
              <p className="text-[13px] text-white">
                <strong className="font-semibold">실제 커뮤니티</strong> 사용자들의
                <br />
                핫딜 반응을 요약해 확인해요
              </p>
            }
          >
            <button aria-label="커뮤니티 반응" title="커뮤니티 반응" className="-m-2 flex p-2">
              <Info />
            </button>
          </Tooltip>
        }
      />
      <p className="-mt-2 mb-3 text-sm text-gray-500">
        실제 커뮤니티 반응을 AI로 요약한 내용이에요
      </p>

      <div className="space-y-4">
        <div className="bg-secondary-50 space-y-3 rounded-xl p-4">
          <div className="space-y-3 rounded-xl bg-white px-3 py-3">
            {allCount > 0 ? (
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <Thumbsup className="size-4.5" active />
                ) : (
                  <Thumbsdown className="size-4.5" active />
                )}
                <span className="text-base font-semibold text-gray-800">
                  {isPositive ? '추천해요' : '아쉬워요'}
                </span>
                <span className="text-sm text-gray-400 tabular-nums">· {dominantPercent}%</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">아직 모은 반응이 없어요</p>
            )}

            {(positiveItems.length > 0 || negativeItems.length > 0) && (
              <div className="space-y-2">
                <KeywordRow
                  label="긍정"
                  labelClassName="text-secondary-600"
                  items={positiveItems}
                />
                <KeywordRow label="부정" labelClassName="text-error-400" items={negativeItems} />
              </div>
            )}

            {statusSummary && <p className="text-xs text-gray-500">{statusSummary.message}</p>}

            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
              <span className="text-xs text-gray-400">{lastUpdatedAt ?? '\u00a0'}</span>
              {product.url ? (
                <CommunityLink url={product.url} provider={product.provider.nameKr} />
              ) : null}
            </div>
          </div>
        </div>

        {commentSummary && <Reactions commentSummary={commentSummary} />}

        <Suspense>
          <ProductReport productId={productId} />
        </Suspense>
      </div>
    </section>
  );
}
