'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Info } from '@/components/common/icons';
import Tooltip from '@/components/common/Tooltip';
import SectionHeader from '@/components/SectionHeader';

import { ProductQueries } from '@entities/product';

import { ProductReport } from '../controls';

import { NoReactionChart } from './NoReactionChart';
import { ReactionChart } from './ReactionChart';
import { Reactions } from './Reactions';
import { ReactionSummary } from './ReactionSummary';

export default function CommunityReaction({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );

  // const { items, lastUpdatedAt: lastUpdatedAtString } = categorizedReactionKeywords;

  // const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  const positiveCount = product?.positiveCommunityReactionCount ?? 0;
  const negativeCount = product?.negativeCommunityReactionCount ?? 0;
  const allCount = positiveCount + negativeCount;

  const commentSummary = product.commentSummary;

  const handleCommunityLinkClick = () => {
    // TODO: Need GTM Migration
  };

  return (
    <section className="mb-4">
      <SectionHeader
        shouldShowMobileUI={true}
        title={
          <>
            커뮤니티 AI 요약
            {!!product.positiveCommunityReactionCount && (
              <span className="text-secondary-500 pl-2">
                {product.positiveCommunityReactionCount}
              </span>
            )}
          </>
        }
        right={
          <div>
            <Tooltip
              align="right"
              polygonOffset={8}
              content={
                <p className="text-[13px] text-white">
                  <strong className="font-semibold">실제 커뮤니티</strong> 사용자들의
                  <br />
                  핫딜 리뷰를 요약해 확인해요
                </p>
              }
            >
              <button aria-label="커뮤니티 반응" title="커뮤니티 반응" className="-m-2 flex p-2">
                <Info />
              </button>
            </Tooltip>
          </div>
        }
      />
      <div className="space-y-4">
        <div className="bg-secondary-50 flex flex-col gap-y-4 rounded-xl p-4">
          {allCount !== 0 ? (
            <ReactionChart
              positiveCount={positiveCount}
              negativeCount={negativeCount}
              allCount={allCount}
              url={product.url!}
              provider={product.provider.nameKr}
            />
          ) : (
            <NoReactionChart url={product.url!} provider={product.provider.nameKr} />
          )}
          {commentSummary && (
            <ReactionSummary
              commentSummary={commentSummary}
              provider={product.provider.nameKr}
              url={product.url!}
            />
          )}
        </div>
        {commentSummary && <Reactions commentSummary={commentSummary} />}

        <Suspense>
          <ProductReport productId={productId} />
        </Suspense>
      </div>
    </section>
  );
}
