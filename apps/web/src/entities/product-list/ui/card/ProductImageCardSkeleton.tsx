import { Skeleton } from '@/shared/ui/common/Skeleton';

const ProductImageCardSkeleton = () => {
  return (
    <div className="w-full">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="flex flex-col">
        <div className="flex h-12 flex-col items-stretch justify-stretch gap-1 pt-2">
          <Skeleton className="grow rounded-sm" />
          <Skeleton className="w-1/2 grow rounded-sm" />
        </div>
        <div className="flex h-8 items-center pt-1">
          <Skeleton className="pc:max-w-[192px] h-6 w-2/3 max-w-[120px] rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default ProductImageCardSkeleton;
