export const RankingSkeleton = () => {
  return (
    <div className="relative flex animate-pulse justify-center overflow-x-hidden">
      <div className="flex w-auto justify-center gap-x-1">
        <SkeletonCard scale={0.9} />
        <SkeletonCard scale={1.0} />
        <SkeletonCard scale={0.9} />
      </div>
    </div>
  );
};

const SkeletonCard = ({ scale }: { scale: number }) => (
  <div
    className="mb-5 h-[340px] min-w-fit flex-shrink-0 origin-center animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all"
    style={{ transform: `scale(${scale})` }}
  >
    <div className="relative h-[240px] w-full">
      <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
      <div className="h-full w-[240px] bg-gray-100" />
    </div>
    <div className="p-3 pb-0">
      <div className="mb-2 h-5 w-full rounded bg-gray-100" />
      <div className="h-6 w-1/2 rounded bg-gray-100" />
    </div>
  </div>
);

export const SliderDotsSkeleton = ({ total }: { total: number }) => (
  <div className="flex h-[20px] w-full items-center justify-center">
    <div className="ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-200" />
    {Array.from({ length: total - 1 }).map((_, i) => (
      <div key={i} className="h-[3px] w-[3px] bg-gray-100" />
    ))}
  </div>
);
