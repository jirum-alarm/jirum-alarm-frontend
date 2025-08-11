'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { motion, useInView } from 'motion/react';
import { Suspense, useRef } from 'react';

import { Info, Thumbsdown, Thumbsup } from '@/components/common/icons';
import Tooltip from '@/components/common/Tooltip';
import SectionHeader from '@/components/SectionHeader';
import { cn } from '@/lib/cn';

import { ProductQueries } from '@entities/product';

import { ProductReport } from '../controls';

import ReactionKeywords from './ReactionKeywords';

const nanSafe = (num: number) => (isNaN(num) ? 0 : num);

export default function CommunityReaction({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );

  const positiveCount = product?.positiveCommunityReactionCount ?? 0;
  const negativeCount = product?.negativeCommunityReactionCount ?? 0;
  const allCount = positiveCount + negativeCount;

  const handleCommunityLinkClick = () => {
    // TODO: Need GTM Migration
  };

  return (
    <>
      {/* @TODO: remove after add hotdeal index section */}
      <section className="mb-4">
        <SectionHeader
          shouldShowMobileUI={true}
          title={
            <>
              커뮤니티 반응
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
        <div className="flex flex-col gap-y-4">
          {allCount !== 0 ? (
            <Reaction
              positiveCount={positiveCount}
              negativeCount={negativeCount}
              allCount={allCount}
            />
          ) : (
            <NoReaction />
          )}
          <Suspense>
            <ReactionKeywords
              productId={productId}
              provider={product.provider.nameKr}
              url={product.url!}
            />
          </Suspense>
          <Suspense>
            <ProductReport productId={productId} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

const Reaction = ({
  positiveCount,
  negativeCount,
  allCount,
}: {
  positiveCount: number;
  negativeCount: number;
  allCount: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });

  const positivePercent = nanSafe((positiveCount / allCount) * 100);
  const negativePercent = nanSafe((negativeCount / allCount) * 100);

  const isPositive = positivePercent >= 50;

  const radius = 58;
  const stroke = 12;
  const circumference = Math.PI * radius;

  const progress = isPositive
    ? (positivePercent / 100) * circumference
    : (negativePercent / 100) * circumference;

  const strokeLinecap = 'round';

  return (
    <div ref={ref} className="rounded-lg bg-gray-800 pb-6">
      <div className="flex justify-between pb-[10px]">
        <div className="flex items-center gap-x-1.5 px-4 pt-4 pb-3">
          {<Thumbsup active={isPositive} />}
          <span className={cn(['font-semibold', isPositive ? 'text-white' : 'text-gray-400'])}>
            구매할래요!
          </span>
        </div>

        <div className="flex items-center gap-x-1.5 px-4 pt-4 pb-3">
          <span className={cn(['font-semibold', !isPositive ? 'text-white' : 'text-gray-400'])}>
            아쉬워요
          </span>
          {<Thumbsdown active={!isPositive} />}
        </div>
      </div>
      <div className="relative flex h-[80px] w-full items-end justify-center">
        <span
          className={cn([
            isPositive ? 'font-semibold text-gray-300' : 'text-sm font-medium text-gray-400',
          ])}
        >
          {positiveCount}명
        </span>
        <div className="flex h-full w-[162px] justify-center">
          <svg
            width="162"
            height="80"
            viewBox="0 0 162 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(23, 10)">
              {/* 배경 반원 */}
              <path
                d="M 0,58 A 58,58 0 0 1 116,58"
                fill="transparent"
                stroke="#667085"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap={strokeLinecap}
              />
              {/* 진행 반원 */}
              {isInView &&
                (isPositive ? (
                  <motion.path
                    d="M 0,58 A 58,58 0 0 1 116,58"
                    fill="transparent"
                    stroke={isPositive ? '#467DFB' : '#F36677'}
                    strokeWidth={stroke}
                    strokeLinecap={strokeLinecap}
                    initial={{
                      strokeDasharray: `0, ${circumference}`,
                    }}
                    animate={{
                      strokeDasharray: `${progress}, ${circumference - progress}`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                ) : (
                  <motion.path
                    d="M 116,58 A 58,58 0 0 0 0,58"
                    fill="transparent"
                    stroke="#F36677"
                    strokeWidth={stroke}
                    strokeLinecap={strokeLinecap}
                    initial={{
                      strokeDasharray: `0, ${circumference}`,
                    }}
                    animate={{
                      strokeDasharray: `${circumference - progress}, ${progress}`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                ))}
            </g>
          </svg>
        </div>
        <span
          className={cn([
            !isPositive ? 'font-semibold text-gray-300' : 'text-sm font-medium text-gray-400',
          ])}
        >
          {negativeCount}명
        </span>

        <div className={cn(['absolute -bottom-1 left-1/2 -translate-x-1/2'])}>
          <span
            className={cn([
              'text-[32px] leading-[38px] font-semibold',
              isPositive ? 'text-secondary-50' : 'text-error-100',
            ])}
          >
            {positivePercent.toFixed(0)}
          </span>
          <span className="absolute bottom-0 left-full text-base text-white">%</span>
        </div>
      </div>
    </div>
  );
};

const NoReaction = () => {
  return (
    <div className="flex h-[156px] items-center justify-center gap-[4px] rounded-[8px] border border-gray-200 px-7 py-6">
      <div className="flex aspect-square w-15 items-center justify-center">
        {/* simplified static svg removed for brevity in feature refactor */}
      </div>
      <p>
        <span className="font-semibold text-gray-700">커뮤니티 반응을 모으고 있어요!</span>
        <br />
        <span className="text-sm text-gray-500">잠시후 다시 확인해 주세요</span>
      </p>
    </div>
  );
};
