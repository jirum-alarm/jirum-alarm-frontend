import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

import JirumRankingSlider from '../JirumRankingSlider';

import { JirumRankingSliderSkeleton } from './JirumRankingSliderSkeleton';

const SLIDER_CONFIG_MOBILE: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 4,
  centeredSlides: true,
  loop: true,
  lazyPreloadPrevNext: 1,
  lazyPreloaderClass: 'swiper-lazy-preloader',
} as const;

const JirumRankingContainer = () => {
  return (
    <div className="w-full">
      <div className="px-5">
        <SectionHeader
          title="지름알림 랭킹"
          right={
            <Link className="text-sm text-gray-500" href={PAGE.TRENDING}>
              더보기
            </Link>
          }
        />
      </div>
      <ApiErrorBoundary>
        <div className="mt-2">
          <Suspense
            fallback={
              <>
                <JirumRankingSliderSkeleton />
                <SliderDotsSkeleton total={10} />
              </>
            }
          >
            <JirumRankingSlider config={SLIDER_CONFIG_MOBILE} isMobile={true} />
          </Suspense>
        </div>
      </ApiErrorBoundary>
    </div>
  );
};

export default JirumRankingContainer;

const SliderDotsSkeleton = ({ total }: { total: number }) => (
  <div className="flex h-[20px] w-full items-center justify-center">
    <div className="ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-200" />
    {Array.from({ length: total - 1 }).map((_, i) => (
      <div key={i} className="h-[3px] w-[3px] bg-gray-100" />
    ))}
  </div>
);
