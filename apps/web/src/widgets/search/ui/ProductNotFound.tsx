import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { PendingActionType, usePendingAction } from '@/shared/lib/pending-action';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { ErrorIllust } from '@/shared/ui/common/icons/Illust';
import { useToast } from '@/shared/ui/common/Toast';
import SectionHeader from '@/shared/ui/SectionHeader';

import { CarouselProductList } from '@/entities/product-list/ui/carousel';

import { useUpdateKeyword } from '@/features/mypage/model';
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

  const { toast } = useToast();
  const promptPushChannel = usePushChannelPrompt();
  // 검색어를 그대로 등록한다. 예전엔 빈 키워드 화면으로 보내 검색어를 다시 치게 했다.
  const { mutate: addKeyword, isPending } = useUpdateKeyword({
    source: 'search_no_result',
    onSuccess: ({ keyword: added }) => {
      toast(`'${added}' 알림을 등록했어요.`);
      promptPushChannel(added);
    },
    onError: (error) => {
      const gql = error as { response?: { errors?: { message?: string }[] } };
      toast(gql?.response?.errors?.[0]?.message || '키워드 저장에 실패했습니다.');
    },
  });
  const segments = [...new Intl.Segmenter().segment(keyword.trim())].length;
  const canRegister = segments >= 2 && segments <= 20;

  // 게스트가 눌러 로그인하고 돌아왔으면 그 검색어를 이어서 등록한다.
  usePendingAction<string>(PendingActionType.NOTIFICATION_KEYWORD_ADD, (pending) => {
    if (pending) addKeyword({ keyword: pending });
  });

  const handleAddKeywordClick = () => {
    // 비로그인 유저는 검색 결과가 없을 때 가장 강한 "알림받고 싶은" 의도를 보인다.
    // 게이트 직전에 keyword_intent를 쏴서 "막힌 알림 수요"를 측정한다. (Phase 1 익명→회원 전환)
    if (!isLoggedIn && typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'keyword_intent',
        keyword,
      });
    }

    if (!canRegister) {
      if (checkAndRedirect()) return;
      router.push(PAGE.MYPAGE_KEYWORD);
      return;
    }
    if (
      checkAndRedirect(
        {
          title: '키워드 알림은 로그인이 필요해요',
          description: `로그인하고 '${keyword.trim()}' 알림을 받아보세요`,
        },
        { type: PendingActionType.NOTIFICATION_KEYWORD_ADD, payload: keyword.trim() },
      )
    )
      return;
    if (!isPending) addKeyword({ keyword: keyword.trim() });
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
          className="text-primary-500 bg-fixed-800 rounded-lg px-5 py-1.5 font-semibold"
        >
          {canRegister ? `'${keyword.trim()}' 알림 받기` : '키워드 등록'}
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
