import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { Info } from '@/components/common/icons';
import Tooltip from '@/components/common/Tooltip';
import HotdealBadge from '@/features/products/components/HotdealBadge';
import { ProductQuery } from '@/shared/api/gql/graphql';

const HotdealScore = ({ product }: { product: NonNullable<ProductQuery['product']> }) => {
  const hotDealIndex = product.hotDealIndex;
  return (
    <>
      {hotDealIndex ? (
        <section className="px-5">
          <div className="flex items-center gap-2 pb-4">
            <h2 className="font-semibold text-gray-900">핫딜 지수</h2>
            <Tooltip
              content={
                <p className="text-s text-white">
                  <strong className="font-semibold">다나와 최저가</strong>와{' '}
                  <strong className="font-semibold">역대 최저가</strong>를 비교하여
                  <br /> 현재 핫딜 정도를 계산해 볼 수 있어요
                </p>
              }
            >
              <button>
                <Info />
              </button>
            </Tooltip>
          </div>
          <div className="rounded-[8px] border border-gray-200 px-6 py-5">
            <div className="flex justify-between">
              <div className="pt-3">
                <div className="mb-3">
                  <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType!} />
                </div>
                <p
                  className="text-sm font-medium text-gray-800"
                  dangerouslySetInnerHTML={{ __html: hotDealIndex.message }}
                />
              </div>
              <div className="h-[140px]">
                <HotdealScoreBar
                  maxValue={hotDealIndex.highestPrice}
                  minValue={hotDealIndex.lowestPrice}
                  currentValue={hotDealIndex.currentPrice}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default HotdealScore;

type HotdealScoreBarType = { maxValue: number; minValue: number; currentValue: number };
const HotdealScoreBar = ({ maxValue, minValue, currentValue }: HotdealScoreBarType) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const percentage = ((currentValue - minValue) / (maxValue - minValue)) * 100;
  const iconHeight = 54; // 아이콘 크기

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const adjustedPercentage =
              Math.max(0, Math.min(100, percentage)) -
              (iconHeight / 2) * (100 / ref.current!.offsetHeight);
            controls.start({ bottom: `${adjustedPercentage}%` }); // 애니메이션 시작
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
    <div ref={ref}>
      <div className="flex h-[140px] gap-[8px]">
        <div className="flex h-full flex-col items-center justify-between">
          <span className="text-xs text-gray-600">{`${maxValue.toLocaleString()}원`}</span>
          <span className="text-xs text-gray-600">{`${minValue.toLocaleString()}원`}</span>
        </div>
        <div className="relative flex h-full w-[16px] flex-col items-center justify-between rounded-b-[20px] rounded-t-[20px] bg-gray-200 p-[5px]">
          <div className="h-[6px] w-[6px] rounded-full bg-white" />
          <div className="h-[6px] w-[6px] rounded-full bg-white" />
          <motion.div
            initial={{ bottom: '100%' }}
            animate={controls} // Intersection Observer에서 제어
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute z-10"
          >
            <div className="absolute right-[50px] top-[11px] h-[28px] w-fit whitespace-nowrap rounded-full bg-gray-900 px-[10px] pt-[1px] after:absolute after:right-[-11.5px] after:top-1/2 after:-translate-y-1/2 after:border-[8px] after:border-b-transparent after:border-l-gray-900 after:border-r-transparent after:border-t-transparent">
              <span className="text-s font-semibold text-primary-500">{`${currentValue.toLocaleString()}원`}</span>
            </div>
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_3_7679)">
                <circle cx="27" cy="25" r="14" fill="#9EF22E" stroke="#101828" strokeWidth="2" />
                <path
                  d="M20.1997 21L23.5747 30L26.9497 21L30.3247 30L33.6997 21"
                  stroke="#101828"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="bevel"
                />
                <path
                  d="M19.2998 24.5996H21.0998"
                  stroke="#101828"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="bevel"
                />
                <path
                  d="M32.7998 24.5996H34.5998"
                  stroke="#101828"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="bevel"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_3_7679"
                  x="0"
                  y="0"
                  width="54"
                  height="54"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="2" />
                  <feGaussianBlur stdDeviation="6" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_3_7679"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_3_7679"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
