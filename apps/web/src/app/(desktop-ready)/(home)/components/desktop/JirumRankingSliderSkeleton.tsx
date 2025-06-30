export const JirumRankingSliderSkeleton = () => {
  return (
    <>
      <div className="relative flex w-full justify-center gap-x-6 overflow-x-hidden px-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:basis-1/4"
          >
            <div className="relative w-full lg:aspect-square lg:h-auto">
              <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-200" />
              <div className="h-full bg-gray-100 lg:w-full" />
            </div>
            <div className="h-[110px] p-3 pb-0">
              <div className="mb-2 h-5 w-full rounded bg-gray-100" />
              <div className="h-6 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
