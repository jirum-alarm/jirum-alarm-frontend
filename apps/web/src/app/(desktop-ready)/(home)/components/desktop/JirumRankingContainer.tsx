import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeaderHOC';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

import JirumRankingSlider from '../JirumRankingSlider';

import { JirumRankingSliderSkeleton } from './JirumRankingSliderSkeleton';

const SLIDE_SIZE = 4;

const SLIDER_CONFIG_DESKTOP: SwiperOptions = {
  slidesPerView: SLIDE_SIZE,
  centeredSlides: false,
  loop: false,
  slidesPerGroup: SLIDE_SIZE,
  spaceBetween: 24,
} as const;

const JirumRankingContainer = () => {
  return (
    <div className="w-full px-9 pt-[56px]">
      <div className="mx-auto mt-9 max-w-slider-max">
        <SectionHeader
          title="지름알림 랭킹"
          titleClassName="text-white"
          right={
            <Link className="px-3 text-sm text-gray-100" href={PAGE.TRENDING}>
              더보기
            </Link>
          }
        />
      </div>
      <ApiErrorBoundary>
        <div className="mt-6 w-full xl:px-9">
          <Suspense
            fallback={
              <div className="flex animate-pulse flex-col gap-y-6">
                <JirumRankingSliderSkeleton />
                <div className="flex justify-center">
                  <SliderDotsSkeleton total={10} />
                </div>
              </div>
            }
          >
            <div className="w-full">
              <JirumRankingSlider config={SLIDER_CONFIG_DESKTOP} isMobile={false} />
            </div>
          </Suspense>
        </div>
      </ApiErrorBoundary>
    </div>
  );
};

export default JirumRankingContainer;

const SliderDotsSkeleton = ({ total }: { total: number }) => (
  <div className="flex h-[20px] w-[100px] items-center justify-center">
    <div className="ml-[6px] mr-[6px] h-[4px] w-[32px] bg-gray-300" />
    {Array.from({ length: total - 1 }).map((_, i) => (
      <div key={i} className="h-[3px] grow bg-gray-500" />
    ))}
  </div>
);
