import { IllustError } from '@/components/common/icons';
import Link from '@/features/Link';
import { useHotDealsRandom } from '@/features/products';
import { useMe } from '@/features/users';
import useMyRouter from '@/hooks/useMyRouter';

import RecommendationProduct from './RecommendationProduct';

const ProductNotFound = () => {
  const userResult = useMe();
  const router = useMyRouter();

  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  const handleAddKeywordClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.ADD_KEYWORD_CLICK.NAME, {
    //   page: EVENT.PAGE.SEARCH_NOT_FOUND,
    // });
  };

  const handleShowMoreClick = () => {
    router.push(`/?categoryId=0`);

    // TODO: Need GTM Migration
    // mp?.track(EVENT.SHOW_MORE_HOT_DEALS_CLICK.NAME, {
    //   page: EVENT.PAGE.SEARCH_NOT_FOUND,
    // });
  };

  if (userResult.loading) {
    return <></>;
  }

  return (
    <div className="flex h-full w-full animate-fade-in flex-col items-start justify-center pt-11">
      <div className="w-full pb-8 text-center">
        <div className="flex justify-center pb-4">
          <IllustError />
        </div>
        <p className="pb-2 text-2xl font-semibold text-gray-900">검색 결과가 없어요.</p>
        <p className="text-gray-500">
          {userResult.data?.me
            ? '키워드를 등록하고 알림을 받아보세요.'
            : '다른 키워드로 검색해보세요.'}
        </p>
      </div>
      {userResult.data?.me && (
        <div className="w-full pb-16 text-center">
          <button
            onClick={handleAddKeywordClick}
            className="rounded-lg bg-gray-800 px-5 py-1.5 font-semibold text-primary-500"
          >
            <Link href="/mypage/keyword">키워드 등록</Link>
          </button>
        </div>
      )}
      {hotDeals?.length ? (
        <>
          <hr className="w-full border-gray-300" />
          <div className="w-full pt-10">
            <div className="flex w-full items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">오늘 가장 인기있는 핫딜</span>
              <span className="text-sm text-gray-500">
                <div onClick={handleShowMoreClick} className="cursor-pointer">
                  더보기
                </div>
              </span>
            </div>
          </div>
          <div className="w-full pt-4">
            <RecommendationProduct hotDeals={hotDeals} logging={{ page: 'SEARCH_NOT_FOUND' }} />
          </div>
        </>
      ) : undefined}
    </div>
  );
};

export default ProductNotFound;
