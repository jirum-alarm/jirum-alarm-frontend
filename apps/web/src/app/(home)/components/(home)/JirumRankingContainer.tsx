import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

import JirumRankingSlider from './JirumRankingSlider';

const JirumRankingContainer = () => {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between px-5 py-3">
        <h2 className="text-lg font-bold text-gray-900">지름알림 랭킹</h2>
        <Link className="text-sm text-gray-500" href={PAGE.TRENDING}>
          더보기
        </Link>
      </div>
      <ApiErrorBoundary>
        <Suspense fallback={<JirumRankingSliderSkeleton />}>
          <JirumRankingSlider />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default JirumRankingContainer;

// const JirumRankingSliderSkeleton = () => {
//   return (
//     <>
//       <div className="relative flex animate-pulse justify-center overflow-x-hidden">
//         <div className="flex h-[340px] w-auto justify-center gap-4">
//           <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-90 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
//             <div className="relative h-[240px] w-full">
//               <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
//               <div className="h-full w-[240px] bg-gray-100" />
//             </div>
//             <div className="p-3 pb-0">
//               <div className="mb-2 h-5 w-full rounded bg-gray-100" />
//               <div className="h-6 w-1/2 rounded bg-gray-100" />
//             </div>
//           </div>

//           <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-100 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
//             <div className="relative h-[240px] w-full">
//               <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
//               <div className="h-full w-[240px] bg-gray-100" />
//             </div>
//             <div className="p-3 pb-0">
//               <div className="mb-2 h-5 w-full rounded bg-gray-100" />
//               <div className="h-6 w-1/2 rounded bg-gray-100" />
//             </div>
//           </div>

//           <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-90 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
//             <div className="relative h-[240px] w-full">
//               <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
//               <div className="h-full w-[240px] bg-gray-100" />
//             </div>
//             <div className="p-3 pb-0">
//               <div className="mb-2 h-5 w-full rounded bg-gray-100" />
//               <div className="h-6 w-1/2 rounded bg-gray-100" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <SliderDotsSkeleton total={10} />
//     </>
//   );
// };

// const SliderDotsSkeleton = ({ total }: { total: number }) => (
//   <div className="mt-3 flex h-[20px] w-full items-center justify-center">
//     <div className="ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-200" />
//     {Array.from({ length: total - 1 }).map((_, i) => (
//       <div key={i} className="h-[3px] w-[3px] animate-pulse bg-gray-100" />
//     ))}
//   </div>
// );

const SliderDotsSkeleton = ({ total }: { total: number }) => (
  <div className="flex h-[20px] w-full animate-pulse items-center justify-center">
    <div className="ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-200" />
    {Array.from({ length: total - 1 }).map((_, i) => (
      <div key={i} className="h-[3px] w-[3px]  bg-gray-100" />
    ))}
  </div>
);

const JirumRankingSliderSkeleton = () => {
  return (
    <>
      <div className="relative flex animate-pulse justify-center overflow-x-hidden pb-3">
        <div className="flex h-[340px] w-auto justify-center">
          <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-90 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative h-[240px] w-full">
              <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
              <div className="h-full w-[240px] bg-gray-100" />
            </div>
            <div className="p-3 pb-0">
              <div className="mb-2 h-5 w-full rounded bg-gray-100" />
              <div className="h-6 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-100 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative h-[240px] w-full">
              <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
              <div className="h-full w-[240px] bg-gray-100" />
            </div>
            <div className="p-3 pb-0">
              <div className="mb-2 h-5 w-full rounded bg-gray-100" />
              <div className="h-6 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-[340px] min-w-fit flex-shrink-0 origin-center scale-90 animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative h-[240px] w-full">
              <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
              <div className="h-full w-[240px] bg-gray-100" />
            </div>
            <div className="p-3 pb-0">
              <div className="mb-2 h-5 w-full rounded bg-gray-100" />
              <div className="h-6 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
      <SliderDotsSkeleton total={10} />
    </>
  );
};
