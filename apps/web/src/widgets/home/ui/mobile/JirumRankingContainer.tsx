import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { preload } from 'react-dom';
import { SwiperOptions } from 'swiper/types';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { PAGE } from '@/shared/config/page';
import { getDayBefore } from '@/shared/lib/utils/date';
import { convertToWebp } from '@/shared/lib/utils/image';
import ApiErrorBoundary from '@/shared/ui/ApiErrorBoundary';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ProductQueries } from '@/entities/product';

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

const JirumRankingContainer = async () => {
  // 서버에서 랭킹 데이터를 prefetch한 뒤 LCP 이미지의 preload 링크를 head에 명시 주입한다.
  // dehydrate로 client useSuspenseQuery는 같은 캐시를 재사용 → 추가 fetch 없음.
  const queryClient = getQueryClient();
  const queryOptions = ProductQueries.products({
    limit: 10,
    orderBy: ProductOrderType.CommunityRanking,
    startDate: getDayBefore(3),
    categoryId: null,
    orderOption: OrderOptionType.Desc,
    isEnd: false,
  });

  await queryClient.prefetchQuery(queryOptions);
  const data = queryClient.getQueryData(queryOptions.queryKey) as
    | { products: Array<{ thumbnail?: string | null }> }
    | undefined;
  const firstThumbnail =
    convertToWebp(data?.products?.[0]?.thumbnail) ?? data?.products?.[0]?.thumbnail;

  if (firstThumbnail) {
    const optimizedUrl = `/_next/image?url=${encodeURIComponent(firstThumbnail)}&w=256&q=75`;
    const optimizedUrl15x = `/_next/image?url=${encodeURIComponent(firstThumbnail)}&w=384&q=75`;
    preload(optimizedUrl, {
      as: 'image',
      fetchPriority: 'high',
      imageSizes: '252px',
      imageSrcSet: `${optimizedUrl} 1x, ${optimizedUrl15x} 1.5x`,
    });
  }

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
          <HydrationBoundary state={dehydrate(queryClient)}>
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
          </HydrationBoundary>
        </div>
      </ApiErrorBoundary>
    </div>
  );
};

export default JirumRankingContainer;
