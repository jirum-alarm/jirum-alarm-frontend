import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import { PAGE } from '@/shared/config/page';
import ApiErrorBoundary from '@/shared/ui/ApiErrorBoundary';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import JirumRankingSlider from '../JirumRankingSlider';
import SliderDots from '../SliderDots';

import { RankingSkeleton } from './RankingSkeleton';

const SLIDER_CONFIG_MOBILE: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 4,
  centeredSlides: true,
  loop: true,
  lazyPreloadPrevNext: 1,
  touchStartForcePreventDefault: true,
  preventClicksPropagation: true,
} as const;

const JirumRankingContainer = () => {
  return (
    <div className="w-full">
      <div className="px-5">
        <SectionHeader
          title="지름알림 랭킹"
          right={
            <InteractiveMoreLink href={PAGE.TRENDING} aria-label="지름알림 랭킹 더보기">
              더보기
            </InteractiveMoreLink>
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
