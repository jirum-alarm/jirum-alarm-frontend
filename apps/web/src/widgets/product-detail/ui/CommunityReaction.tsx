'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getFromNow } from '@shared/lib/utils/date';
import { Info } from '@shared/ui/icons';
import SectionHeader from '@shared/ui/SectionHeader';
import Tooltip from '@shared/ui/Tooltip';

import { ProductQueries, ReactionChart } from '@entities/product';

import { ProductReport } from '@features/product-actions';
import {
  NoReactionChart,
  ReactionChartHeader,
  ReactionKeywords,
  Reactions,
} from '@features/product-reaction';

export default function CommunityReaction({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );

  const { data: reactionKeywordsData } = useSuspenseQuery(
    ProductQueries.reactionKeywords({ id: productId }),
  );

  const { lastUpdatedAt: lastUpdatedAtString } = reactionKeywordsData.categorizedReactionKeywords;

  const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  const positiveCount = product?.positiveCommunityReactionCount ?? 0;
  const negativeCount = product?.negativeCommunityReactionCount ?? 0;
  const allCount = positiveCount + negativeCount;

  const commentSummary = product.commentSummary;

  const handleCommunityLinkClick = () => {
    // TODO: Need GTM Migration
  };

  return (
    <section>
      <SectionHeader
        shouldShowMobileUI={true}
        titleClassName="pc:text-[20px]"
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
      <div className="mt-2 space-y-4">
        <div className="bg-secondary-50 space-y-3 rounded-xl p-4">
          <div className="space-y-1 rounded-xl bg-white pb-5">
            <ReactionChartHeader
              url={product.url!}
              provider={product.provider.nameKr}
              lastUpdatedAt={lastUpdatedAt}
            />
            {allCount !== 0 ? (
              <ReactionChart
                positiveCount={positiveCount}
                negativeCount={negativeCount}
                allCount={allCount}
              />
            ) : (
              <NoReactionChart />
            )}
          </div>
          <ReactionKeywords productId={productId} />
        </div>
        {commentSummary && <Reactions commentSummary={commentSummary} />}

        <Suspense>
          <ProductReport productId={productId} />
        </Suspense>
      </div>
    </section>
  );
}
