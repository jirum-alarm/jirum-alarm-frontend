import { motion, useAnimation } from 'motion/react';
import { useEffect, useRef } from 'react';

import { Info } from '@/components/common/icons';
import Tooltip from '@/components/common/Tooltip';
import HotdealBadge from '@/features/products/components/HotdealBadge';
import { cn } from '@/lib/cn';
import { HotDealType, ProductQuery } from '@/shared/api/gql/graphql';

const HotdealScore = ({ product }: { product: NonNullable<ProductQuery['product']> }) => {
  const hotDealIndex = product.hotDealIndex;
  console.log(hotDealIndex);
  return (
    <>
      {hotDealIndex ? (
        <section className="px-5">
          <div className="flex items-center justify-between gap-2 pb-4">
            <h2 className="font-semibold text-gray-900">핫딜 지수</h2>
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
          <div className="flex flex-col justify-between rounded-[12px] bg-gray-100 px-6 py-5">
            <div>
              <div className="flex w-full flex-col items-center justify-center pb-[31px] pt-[19px]">
                <div>
                  <div className="flex items-center justify-center">
                    {product.hotDealType && (
                      <div className="mb-3">
                        <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                      </div>
                    )}
                  </div>
                  <p
                    className="text-center font-medium text-gray-800"
                    dangerouslySetInnerHTML={{ __html: hotDealIndex.message }}
                  />
                </div>
              </div>
            </div>
            <div>
              <HotdealScoreBar
                maxValue={hotDealIndex.highestPrice}
                minValue={hotDealIndex.lowestPrice}
                currentValue={hotDealIndex.currentPrice}
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default HotdealScore;

type HotdealScoreBarType = {
  maxValue: number;
  minValue: number;
  currentValue: number;
};
const HotdealScoreBar = ({ maxValue, minValue, currentValue }: HotdealScoreBarType) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const percentage = ((currentValue - minValue) / (maxValue - minValue)) * 100;
  const iconWidth = 18; // 아이콘 크기
  console.log(percentage);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const adjustedPercentage = percentage === 100 ? 'calc(100% - 30px)' : `${percentage}%`;
            controls.start({ left: adjustedPercentage }); // 애니메이션 시작
          }
        });
      },
      { threshold: 0.1 }, // 요소의 10%가 보일 때 트리거
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls, percentage]);

  return (
    <div ref={ref} className="flex h-[83px] w-full flex-col justify-end">
      <div className="w-full gap-[8px]">
        <div className="relative flex h-[14px] w-full items-center justify-between rounded-[20px] bg-gray-300 p-[5px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[4px] w-[4px] rounded-full bg-gray-400" />
          ))}
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
              <div className="absolute bottom-[34px] flex h-[32px] w-fit items-center justify-center whitespace-nowrap rounded-full bg-gray-900 px-[10px] py-[6px]">
                <span className="text-base font-semibold text-primary-500">{`${currentValue.toLocaleString()}원`}</span>
              </div>
              <div className="flex h-[30px] w-[30px] items-center justify-center">
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
