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
    className="mb-5 h-[340px] min-w-fit shrink-0 origin-center animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all"
    style={{ transform: `scale(${scale})` }}
  >
    <div className="relative h-[240px] w-full">
      <div className="absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-200" />
      <div className="h-full w-[240px] bg-gray-100" />
    </div>
    <div className="p-3 pb-0">
      <div className="mb-2 h-5 w-full rounded-sm bg-gray-100" />
      <div className="h-6 w-1/2 rounded-sm bg-gray-100" />
    </div>
  </div>
);
