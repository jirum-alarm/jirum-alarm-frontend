import { ErrorIllust } from '@/components/common/icons/Illust';
import SectionHeader from '@/components/SectionHeader';
import useMyRouter from '@/hooks/useMyRouter';

import useIsLoggedIn from '@shared/hooks/useIsLoggedIn';
import Link from '@shared/ui/Link';

import { CarouselProductList } from '@features/products/carousel';
import { useHotDealsRandom } from '@features/products/hooks';

const ProductNotFound = () => {
  const router = useMyRouter();
  const { isLoggedIn } = useIsLoggedIn();

  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  const handleAddKeywordClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.ADD_KEYWORD_CLICK.NAME, {
    //   page: EVENT.PAGE.SEARCH_NOT_FOUND,
    // });
  };

  const handleShowMoreClick = () => {
    router.push(`/?categoryId=0`);
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col items-start justify-center pt-11">
      <div className="w-full pb-8 text-center">
        <div className="flex justify-center pb-4">
          <ErrorIllust className="size-25" />
        </div>
        <p className="pb-2 text-2xl font-semibold text-gray-900">검색 결과가 없어요</p>
        <p className="text-gray-500">
          {isLoggedIn ? '키워드를 등록하고 알림을 받아보세요' : '다른 키워드로 검색해보세요'}
        </p>
      </div>
      {isLoggedIn && (
        <div className="w-full pb-16 text-center">
          <button
            onClick={handleAddKeywordClick}
            className="text-primary-500 rounded-lg bg-gray-800 px-5 py-1.5 font-semibold"
          >
            <Link href="/mypage/keyword">키워드 등록</Link>
          </button>
        </div>
      )}
      {hotDeals?.length ? (
        <>
          <hr className="w-full border-gray-300" />
          <div className="w-full px-5 pt-7">
            <SectionHeader
              title="오늘 가장 인기있는 핫딜"
              right={
                <div className="flex items-center px-2 py-3">
                  <div onClick={handleShowMoreClick} className="cursor-pointer">
                    더보기
                  </div>
                </div>
              }
            />
          </div>
          <div className="w-full pt-4">
            <CarouselProductList products={hotDeals} type="mobile" />
          </div>
        </>
      ) : undefined}
    </div>
  );
};

export default ProductNotFound;
