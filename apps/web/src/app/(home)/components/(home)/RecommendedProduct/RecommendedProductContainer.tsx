import { Suspense } from 'react';
import Link from 'next/link';
import { PAGE } from '@/constants/page';
import RecommendedProductListServer from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductContainerServer';

const RecommendedProductContainer = () => {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900">지름알림 추천</h2>
        {/*<Link className="text-sm text-gray-500" href={PAGE.TRENDING}>*/}
        {/*  더보기*/}
        {/*</Link>*/}
      </div>
      <div className="pb-[52px]">
        <Suspense>
          <RecommendedProductListServer />
        </Suspense>
      </div>
    </div>
  );
};

export default RecommendedProductContainer;
