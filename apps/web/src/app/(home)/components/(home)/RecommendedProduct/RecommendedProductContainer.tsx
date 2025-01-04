import { Suspense } from 'react';
import RecommendedProductTabsFetcher from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabsFetcher';
import RecommendedProductList from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductList';
import RecommendedMoreLink from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedMoreLink';

const RecommendedProductContainer = () => {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900">지름알림 추천</h2>
        <RecommendedMoreLink>더보기</RecommendedMoreLink>
      </div>
      <div className="pb-[52px]">
        <Suspense>
          <RecommendedProductTabsFetcher>
            <RecommendedProductList />
          </RecommendedProductTabsFetcher>
        </Suspense>
      </div>
    </div>
  );
};

export default RecommendedProductContainer;
