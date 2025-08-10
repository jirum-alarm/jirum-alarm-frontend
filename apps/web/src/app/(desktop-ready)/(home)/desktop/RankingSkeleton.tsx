export const RankingSkeleton = () => {
  return (
    <div className="relative flex w-full justify-center gap-x-6 overflow-x-hidden px-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="basis-1/4 overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-square w-full pc:h-auto">
        <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
        <div className="h-full bg-gray-100 pc:w-full" />
      </div>
      <div className="h-[110px] p-3 pb-0">
        <div className="mb-2 h-5 w-full rounded bg-gray-100" />
        <div className="h-6 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  );
};

export const SliderDotsSkeleton = ({ total }: { total: number }) => (
  <div className="mx-auto flex h-[20px] w-[100px] items-center justify-center">
    <div className="ml-[6px] mr-[6px] h-[4px] w-[32px] grow bg-gray-300" />
    {Array.from({ length: total - 1 }).map((_, i) => (
      <div key={i} className="h-[3px] w-[3px] grow bg-gray-500" />
    ))}
  </div>
);
