import { Suspense } from 'react';

import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import { cn } from '@/lib/cn';

import JirumRankingSlider from './JirumRankingSlider';

const JirumRankingContainer = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pb-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900">지름알림 랭킹</h2>
        <Link className="text-sm text-gray-500" href={PAGE.TRENDING}>
          더보기
        </Link>
      </div>
      <Suspense fallback={<JirumRankingSliderSkeleton />}>
        <JirumRankingSlider />
      </Suspense>
    </div>
  );
};

export default JirumRankingContainer;

const JirumRankingSliderSkeleton = () => {
  return (
    <div>
      <div className="flex h-[340px] w-full justify-around">
        <div className="w-1/4 scale-90 bg-gray-100 "></div>
        <div className="w-1/2 scale-100 bg-gray-100"></div>
        <div className="w-1/4 scale-90 bg-gray-100"></div>
      </div>
      <div className="mt-3 flex h-[20px] w-full items-center justify-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(`h-[3px] w-[3px] bg-gray-400`, {
              'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600': 0 === i,
            })}
          />
        ))}
      </div>
    </div>
  );
};
