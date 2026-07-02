import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { ErrorIllust } from '@/shared/ui/common/icons/Illust';
import SectionHeader from '@/shared/ui/SectionHeader';

import { CarouselProductList } from '@/entities/product-list/ui/carousel';

import { useHotDealsRandom } from '@/features/product-list/hooks';

const ProductNotFound = () => {
  const router = useMyRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'search_no_result',
      keyword,
    });
  }, [keyword]);

  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  const handleAddKeywordClick = () => {
    // 비로그인 유저는 검색 결과가 없을 때 가장 강한 "알림받고 싶은" 의도를 보인다.
    // 게이트 직전에 keyword_intent를 쏴서 "막힌 알림 수요"를 측정한다. (Phase 1 익명→회원 전환)
    if (!isLoggedIn && typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'keyword_intent',
        keyword,
      });
    }

    if (checkAndRedirect()) return;

    router.push(PAGE.MYPAGE_KEYWORD);
  };

  const handleShowMoreClick = () => {
    router.push(`/trending`);
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col items-start justify-center pt-11">
      <div className="w-full pb-8 text-center">
        <div className="flex justify-center pb-4">
          <ErrorIllust className="size-25" />
        </div>
        <p className="pb-2 text-2xl font-semibold text-gray-900">검색 결과가 없어요</p>
        <p className="text-gray-500">키워드를 등록하고 알림을 받아보세요</p>
      </div>
      <div className="w-full pb-16 text-center">
        <button
          onClick={handleAddKeywordClick}
          className="text-primary-500 rounded-lg bg-gray-800 px-5 py-1.5 font-semibold"
        >
          키워드 등록
        </button>
      </div>
      {hotDeals?.length ? (
        <>
          <hr className="mx-5 mb-7 border-gray-300" />
          <section className="w-full overflow-x-hidden">
            <div className="pc:px-0 w-full px-5">
              <SectionHeader
                title="오늘 가장 인기있는 핫딜"
                right={
                  <div className="flex items-center px-2 py-3">
                    <div onClick={handleShowMoreClick} className="cursor-pointer">
                      더보기
                    </div>
                  </div>
                }
                shouldShowMobileUI
              />
            </div>
            <CarouselProductList products={hotDeals} />
          </section>
        </>
      ) : undefined}
    </div>
  );
};

export default ProductNotFound;
