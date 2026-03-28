'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { motion, useAnimation } from 'motion/react';
import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Info } from '@/shared/ui/common/icons';
import Tooltip from '@/shared/ui/common/Tooltip';
import HotdealBadge from '@/shared/ui/HotdealBadge';

import { ProductQueries } from '@/entities/product';

const HotdealScore = ({ productId }: { productId: number }) => {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );

  const hotDealIndex = product.hotDealIndex;
  return (
    <>
      {hotDealIndex ? (
        <section>
          <div className="flex items-center justify-between gap-2 pb-4">
            <h2 className="pc:text-[20px] font-semibold text-gray-900">핫딜 지수</h2>
            <Tooltip
              align="right"
              polygonOffset={8}
              content={
                <p className="text-[13px] text-white">
                  <strong className="font-semibold">다나와 최저가</strong>와{' '}
                  <strong className="font-semibold">역대 최저가</strong>를 비교하여
                  <br /> 현재 핫딜 정도를 계산해 볼 수 있어요
                </p>
              }
            >
              <button aria-label="핫딜 지수 정보" title="핫딜 지수 정보" className="-m-2 flex p-2">
                <Info />
              </button>
            </Tooltip>
          </div>
          <div className="mt-2 flex flex-col justify-between rounded-[12px] bg-gray-100 px-6 py-6">
            <div>
              <div className="flex w-full flex-col items-center justify-center pb-4">
                <div>
                  <div className="flex items-center justify-center">
                    {product.hotDealType && (
                      <div className="mb-1.5">
                        <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                      </div>
                    )}
                  </div>
                  <p
                    className="text-center font-medium text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: hotDealIndex.message.replace(/<b\/>/g, '</b>'),
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <HotdealScoreBar
                maxValue={hotDealIndex.highestPrice}
                minValue={hotDealIndex.lowestPrice}
                currentValue={hotDealIndex.currentPrice}
                visualConfig={hotDealIndex.visualConfig}
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default HotdealScore;

type VisualConfig =
  | {
      markerPct: number;
      q1Pct: number;
      q3Pct: number;
      medianPct: number;
      isClustered: boolean;
    }
  | null
  | undefined;

type HotdealScoreBarType = {
  maxValue: number;
  minValue: number;
  currentValue: number;
  visualConfig?: VisualConfig;
};

const HotdealScoreBar = ({
  maxValue,
  minValue,
  currentValue,
  visualConfig,
}: HotdealScoreBarType) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  // visualConfig가 있으면 미리 계산된 % 사용, 없으면 raw 값으로 폴백
  const percentage = visualConfig
    ? visualConfig.markerPct
    : ((currentValue - minValue) / (maxValue - minValue)) * 100;

  const iconWidth = 18;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const adjustedPercentage = `calc((100% - ${iconWidth}px) * ${percentage / 100})`;
            controls.start({ left: adjustedPercentage });
          }
        });
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
  }, [controls, percentage]);

  const barStyle = visualConfig
    ? {
        background: `linear-gradient(to right,
          #E4E7EC 0%,
          #FFC39C calc(${visualConfig.q1Pct}% * 0.33),
          #FF9651 calc(${visualConfig.q1Pct}% * 0.66),
          #FF594D ${visualConfig.q1Pct}%,
          #FF594D ${visualConfig.q3Pct}%,
          #FF9651 calc(${visualConfig.q3Pct}% + (100% - ${visualConfig.q3Pct}%) * 0.33),
          #FFC39C calc(${visualConfig.q3Pct}% + (100% - ${visualConfig.q3Pct}%) * 0.66),
          #E4E7EC 100%)`,
      }
    : undefined;

  return (
    <div ref={ref} className="flex h-[83px] w-full flex-col justify-end">
      <div className="w-full gap-[8px]">
        <div
          className={cn(
            'relative flex h-[14px] w-full items-center justify-between rounded-xl p-[5px]',
            !visualConfig && 'bg-gray-300',
          )}
          style={barStyle}
        >
          <motion.div
            initial={{ left: '0%' }}
            animate={controls}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute z-10"
          >
            <div
              className={cn(
                'flex',
                percentage < 4
                  ? 'justify-start'
                  : percentage > 90
                    ? 'justify-end'
                    : 'justify-center',
              )}
            >
              <div className="absolute bottom-[34px] flex h-[32px] w-fit items-center justify-center rounded-full bg-gray-900 px-[10px] py-[6px] whitespace-nowrap">
                <span className="text-primary-500 text-base font-semibold">
                  {`${currentValue.toLocaleString()}원`}
                </span>
              </div>
              <div className="flex h-[30px] items-center justify-center">
                <div className="h-[18px] w-[18px] rounded-full border border-solid border-gray-400 bg-white" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-[8px] flex w-full items-center justify-between">
          <span className="text-xs text-gray-500">{`${minValue.toLocaleString()}원`}</span>
          <span className="text-xs text-gray-500">{`${maxValue.toLocaleString()}원`}</span>
        </div>
      </div>
    </div>
  );
};
