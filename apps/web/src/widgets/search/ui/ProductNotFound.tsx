import { text } from '@jirum/design-system/recipes';
import { SEARCH_COPY, SEARCH_EVENT } from '@jirum/domain/search';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { cn } from '@/shared/lib/cn';
import { ErrorIllust } from '@/shared/ui/common/icons/Illust';
import SectionHeader from '@/shared/ui/SectionHeader';

import { CarouselProductList } from '@/entities/product-list/ui/carousel';

import { useHotDealsRandom } from '@/features/product-list/hooks';

import { pushDataLayer, useSearchKeywordAlert } from '../hooks/useSearchKeywordAlert';

const ProductNotFound = () => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';

  useEffect(() => {
    pushDataLayer({ event: SEARCH_EVENT.noResult, keyword });
  }, [keyword]);

  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  const { canRegister, isOn, isPending, isLoggedIn, register, ensureAlertSession } =
    useSearchKeywordAlert({ keyword, source: 'search_no_result' });

  const handleAddKeywordClick = async () => {
    if (canRegister) {
      await register();
      return;
    }
    // 2~20자 밖이면 검색어로 못 건다 — 키워드 화면에서 직접 입력하게 보낸다.
    if (!isLoggedIn) pushDataLayer({ event: 'keyword_intent', keyword });
    if (!(await ensureAlertSession())) return;
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
        <p className={cn(text.display, 'pb-2')}>{SEARCH_COPY.noResult}</p>
        <p className="text-gray-500">키워드를 등록하고 알림을 받아보세요</p>
      </div>
      <div className="w-full pb-16 text-center">
        {isOn ? (
          <p
            role="status"
            className="inline-block rounded-lg bg-gray-100 px-5 py-1.5 font-semibold text-gray-700"
          >
            알림 받는 중
          </p>
        ) : (
          <button
            type="button"
            onClick={handleAddKeywordClick}
            disabled={isPending}
            className="text-primary-500 bg-fixed-800 rounded-lg px-5 py-1.5 font-semibold disabled:opacity-60"
          >
            {canRegister ? `'${keyword.trim()}' 알림 받기` : '키워드 등록'}
          </button>
        )}
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
                    <button
                      type="button"
                      onClick={handleShowMoreClick}
                      className="active:opacity-60"
                    >
                      더보기
                    </button>
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
