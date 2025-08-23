import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';

import JirumRankingSlider from '../components/JirumRankingSlider';
import SliderDots from '../components/SliderDots';

import { RankingSkeleton } from './RankingSkeleton';

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
                <RankingSkeleton />
                <SliderDots total={10} visibleSlides={[0]} />
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
